import { eq, and, sql, gte, lte, isNull } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  adsBudgetPlans,
  customerLedgerEntries,
  customerBalanceCache,
  metaConnections,
  metaAdObjects,
} from "@repo/db/schema";
import { metaGet } from "../lib/metaGraph.js";
import type { QueuedJob } from "@repo/queue";

export type BillingBurnPayload = {
  customerId: string;
  preset?: "daily";
  periodDate?: string; // YYYY-MM-DD
};

/** Compute balance from ledger (source of truth). */
async function getBalanceFromLedger(customerId: string): Promise<number> {
  const rows = await db
    .select({
      sum: sql<string>`COALESCE(SUM(${customerLedgerEntries.amountSek}), 0)`,
    })
    .from(customerLedgerEntries)
    .where(eq(customerLedgerEntries.customerId, customerId));
  return rows[0]?.sum != null ? parseFloat(String(rows[0].sum)) : 0;
}

/**
 * Check if consumption already exists for idempotency.
 * One burn per (customerId, periodDate, metaCampaignId).
 * DB enforces: UNIQUE (customer_id, period_date, COALESCE(meta_campaign_id, '')) WHERE type = 'consumption'.
 * Running /billing/burn twice for the same date does not double-burn (early exit here + constraint on insert).
 */
async function consumptionExists(
  customerId: string,
  periodDate: string,
  metaCampaignId: string | null
): Promise<boolean> {
  const periodStart = new Date(periodDate + "T00:00:00.000Z");
  const periodEnd = new Date(periodDate + "T23:59:59.999Z");
  const conditions = [
    eq(customerLedgerEntries.customerId, customerId),
    eq(customerLedgerEntries.type, "consumption"),
    gte(customerLedgerEntries.periodDate, periodStart),
    lte(customerLedgerEntries.periodDate, periodEnd),
  ];
  if (metaCampaignId != null) {
    conditions.push(eq(customerLedgerEntries.metaCampaignId, metaCampaignId));
  } else {
    conditions.push(isNull(customerLedgerEntries.metaCampaignId));
  }
  const rows = await db
    .select({ id: customerLedgerEntries.id })
    .from(customerLedgerEntries)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
}

export async function processBillingBurn(job: QueuedJob<BillingBurnPayload>): Promise<void> {
  const { payload, correlation } = job;
  const customerId = payload.customerId ?? correlation.customerId;
  if (!customerId) {
    await job.deadLetter("Missing customerId");
    return;
  }

  const periodDate: string =
    payload.periodDate && /^\d{4}-\d{2}-\d{2}$/.test(payload.periodDate)
      ? payload.periodDate
      : new Date().toISOString().slice(0, 10);

  try {
    const [plan] = await db
      .select()
      .from(adsBudgetPlans)
      .where(eq(adsBudgetPlans.customerId, customerId))
      .limit(1);

    if (!plan) {
      console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "no_plan" }));
      await job.ack();
      return;
    }

    if (plan.status === "paused") {
      console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "plan_paused" }));
      await job.ack();
      return;
    }

    const balanceSek = await getBalanceFromLedger(customerId);
    if (balanceSek <= 0) {
      console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "no_balance", balanceSek: 0 }));
      await job.ack();
      return;
    }

    const periodTimestamp = new Date(periodDate + "T12:00:00.000Z");

    // Time-based: burn daily from monthly/30 unless plan paused. Campaign existence not required (customer pays for plan).
    if (plan.billingMode === "time_based") {
      const already = await consumptionExists(customerId, periodDate, null);
      if (already) {
        console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "idempotent_time_based" }));
        await job.ack();
        return;
      }
      const dailyCharge = Number(plan.customerMonthlyPrice) / 30;
      const charge = Math.min(dailyCharge, Math.max(0, balanceSek));
      const amountSek = -charge;
      await db.insert(customerLedgerEntries).values({
        customerId,
        type: "consumption",
        amountSek: String(amountSek),
        refType: "system",
        periodDate: periodTimestamp,
        metaCampaignId: null,
        note: `Burn ${periodDate} (mode=time_based)`,
      });
      const newBalance = await getBalanceFromLedger(customerId);
      await db
        .insert(customerBalanceCache)
        .values({ customerId, balanceSek: String(newBalance), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: customerBalanceCache.customerId,
          set: { balanceSek: String(newBalance), updatedAt: new Date() },
        });
      console.log(JSON.stringify({ event: "billing_burn_applied", customerId, periodDate, mode: "time_based", charge, newBalance: newBalance }));
      await job.ack();
      return;
    }

    if (plan.billingMode === "impression_based") {
      const cpmSek = plan.customerCpmSek != null ? Number(plan.customerCpmSek) : null;
      if (cpmSek == null) {
        console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "impression_based_missing_cpm" }));
        await job.ack();
        return;
      }
      const [metaConn] = await db
        .select()
        .from(metaConnections)
        .where(and(eq(metaConnections.customerId, customerId), eq(metaConnections.status, "connected")))
        .limit(1);
      const [objects] = await db.select().from(metaAdObjects).where(eq(metaAdObjects.customerId, customerId)).limit(1);
      const campaignId = objects?.campaignId ?? null;
      const accessToken = metaConn?.accessToken;
      if (!accessToken || !campaignId) {
        console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "no_meta_or_campaign" }));
        await job.ack();
        return;
      }

      const already = await consumptionExists(customerId, periodDate, campaignId);
      if (already) {
        console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "idempotent_impression_based", campaignId }));
        await job.ack();
        return;
      }

      // Same date boundaries as customer performance: YYYY-MM-DD in UTC (Meta API time_range)
      const params: Record<string, string> = {
        fields: "impressions,clicks,reach",
        "time_range[since]": periodDate,
        "time_range[until]": periodDate,
        time_increment: "1",
      };
      const response = (await metaGet(`/${campaignId}/insights`, accessToken, params)) as { data?: Array<Record<string, unknown>> };
      const data = (response.data || []) as Array<Record<string, unknown>>;
      let impressionsDelivered = 0;
      for (const row of data) {
        impressionsDelivered += parseInt(String(row.impressions ?? 0), 10);
      }
      const rawCharge = (impressionsDelivered / 1000) * cpmSek;
      const charge = Math.min(rawCharge, Math.max(0, balanceSek));
      // Explicit: impressions = 0 → burn = 0 (no ledger entry for no-delivery days)
      if (charge <= 0) {
        console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "zero_impressions", impressionsDelivered: impressionsDelivered }));
        await job.ack();
        return;
      }
      await db.insert(customerLedgerEntries).values({
        customerId,
        type: "consumption",
        amountSek: String(-charge),
        refType: "system",
        refId: campaignId,
        periodDate: periodTimestamp,
        metaCampaignId: campaignId,
        note: `Burn ${periodDate} (mode=impression_based, impressions=${impressionsDelivered}, cpm=${cpmSek})`,
      });
      const newBalance = await getBalanceFromLedger(customerId);
      await db
        .insert(customerBalanceCache)
        .values({ customerId, balanceSek: String(newBalance), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: customerBalanceCache.customerId,
          set: { balanceSek: String(newBalance), updatedAt: new Date() },
        });
      console.log(JSON.stringify({
        event: "billing_burn_applied",
        customerId,
        periodDate,
        mode: "impression_based",
        impressionsDelivered,
        charge,
        newBalance: newBalance,
      }));
      await job.ack();
      return;
    }

    console.log(JSON.stringify({ event: "billing_burn_skipped", customerId, periodDate, reason: "unknown_billing_mode", billingMode: plan.billingMode }));
    await job.ack();
  } catch (err) {
    console.error("billing_burn_error", customerId, periodDate, err);
    await job.retry(5000);
  }
}
