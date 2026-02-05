import type { FastifyInstance } from "fastify";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  adsBudgetPlans,
  customerLedgerEntries,
  customerBalanceCache,
  metaConnections,
  metaAdObjects,
} from "@repo/db/schema";
import { metaGet, type MetaGraphError } from "../lib/metaGraph.js";

/** Get date range for preset */
function getUsagePeriod(preset: "last_7_days" | "last_30_days"): { since: string; until: string } {
  const until = new Date();
  const since = new Date();
  if (preset === "last_7_days") since.setDate(since.getDate() - 7);
  else since.setDate(since.getDate() - 30);
  return {
    since: since.toISOString().slice(0, 10),
    until: until.toISOString().slice(0, 10),
  };
}

/** Compute balance from ledger (source of truth) */
async function getBalanceFromLedger(customerId: string): Promise<number> {
  const rows = await db
    .select({ sum: sql<string>`COALESCE(SUM(${customerLedgerEntries.amountSek}), 0)` })
    .from(customerLedgerEntries)
    .where(eq(customerLedgerEntries.customerId, customerId));
  const sum = rows[0]?.sum;
  return sum != null ? parseFloat(String(sum)) : 0;
}

/** Sum consumption (absolute value of negative amount_sek) in date range. */
async function getCreditsConsumedInRange(
  customerId: string,
  since: string,
  until: string
): Promise<number> {
  const rows = await db
    .select({ amountSek: customerLedgerEntries.amountSek })
    .from(customerLedgerEntries)
    .where(
      and(
        eq(customerLedgerEntries.customerId, customerId),
        eq(customerLedgerEntries.type, "consumption"),
        gte(customerLedgerEntries.createdAt, new Date(since)),
        lte(customerLedgerEntries.createdAt, new Date(until + "T23:59:59.999Z"))
      )
    );
  return rows.reduce((sum, r) => sum + Math.abs(parseFloat(String(r.amountSek))), 0);
}

/** Get delivery metrics (impressions, clicks, etc.) from Meta insights - no spend */
async function getDeliveryMetrics(
  customerId: string,
  since: string,
  until: string
): Promise<{ impressions: number; clicks: number; ctr: number; reach: number }> {
  const [metaConn] = await db
    .select()
    .from(metaConnections)
    .where(and(eq(metaConnections.customerId, customerId), eq(metaConnections.status, "connected")))
    .limit(1);
  const [objects] = await db
    .select()
    .from(metaAdObjects)
    .where(eq(metaAdObjects.customerId, customerId))
    .limit(1);
  if (!metaConn?.accessToken || !objects?.campaignId) {
    return { impressions: 0, clicks: 0, ctr: 0, reach: 0 };
  }
  try {
    const params: Record<string, string> = {
      fields: "impressions,reach,clicks,ctr",
      "time_range[since]": since,
      "time_range[until]": until,
      time_increment: "1",
    };
    const response = (await metaGet(`/${objects.campaignId}/insights`, metaConn.accessToken, params)) as {
      data?: Array<Record<string, unknown>>;
    };
    const data = (response.data || []) as Array<Record<string, unknown>>;
    let impressions = 0;
    let reach = 0;
    let clicks = 0;
    for (const day of data) {
      impressions += parseInt(String(day.impressions || 0), 10);
      reach += parseInt(String(day.reach || 0), 10);
      clicks += parseInt(String(day.clicks || 0), 10);
    }
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    return { impressions, clicks, ctr, reach };
  } catch {
    return { impressions: 0, clicks: 0, ctr: 0, reach: 0 };
  }
}

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /billing/status
   * Customer-facing: balance, plan, usage (credits consumed + delivery metrics). No spend.
   */
  app.get<{ Querystring: { preset?: "last_7_days" | "last_30_days" } }>(
    "/billing/status",
    async (request, reply) => {
      const customerId = request.customer.customerId;
      const preset = request.query.preset || "last_7_days";
      const { since, until } = getUsagePeriod(preset);

      const [cache] = await db
        .select()
        .from(customerBalanceCache)
        .where(eq(customerBalanceCache.customerId, customerId))
        .limit(1);
      let balanceSek = cache ? Number(cache.balanceSek) : 0;
      if (cache == null) {
        balanceSek = await getBalanceFromLedger(customerId);
        await db
          .insert(customerBalanceCache)
          .values({ customerId, balanceSek: String(balanceSek), updatedAt: new Date() })
          .onConflictDoUpdate({
            target: customerBalanceCache.customerId,
            set: { balanceSek: String(balanceSek), updatedAt: new Date() },
          });
      }

      const [plan] = await db
        .select()
        .from(adsBudgetPlans)
        .where(eq(adsBudgetPlans.customerId, customerId))
        .limit(1);

      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const since7 = sevenDaysAgo.toISOString().slice(0, 10);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since30 = thirtyDaysAgo.toISOString().slice(0, 10);

      const [creditsConsumedSekLast7d, creditsConsumedSekLast30d, creditsConsumedSekMtd, creditsConsumedSek] = await Promise.all([
        getCreditsConsumedInRange(customerId, since7, today),
        getCreditsConsumedInRange(customerId, since30, today),
        getCreditsConsumedInRange(customerId, monthStart, today),
        getCreditsConsumedInRange(customerId, since, until),
      ]);

      const delivery = await getDeliveryMetrics(customerId, since, until);
      const deliverySummary = {
        impressions: delivery.impressions,
        clicks: delivery.clicks,
        ctr: Math.round(delivery.ctr * 100) / 100,
        reach: delivery.reach,
      };

      const hints: string[] = [];
      if (!plan) hints.push("No budget plan yet. Publish a campaign or set up billing in admin.");
      const singleHint = hints.length > 0 ? hints[0] : undefined;

      return reply.send({
        ok: true,
        balanceSek,
        billingMode: plan?.billingMode ?? null,
        monthlyPriceSek: plan != null ? Number(plan.customerMonthlyPrice) : null,
        status: plan?.status ?? null,
        deliverySummary,
        creditsConsumedSekLast7d,
        creditsConsumedSekLast30d,
        creditsConsumedSekMtd,
        ...(singleHint != null ? { hint: singleHint } : {}),
        plan: plan
          ? {
              billingMode: plan.billingMode,
              customerMonthlyPrice: Number(plan.customerMonthlyPrice),
              pacing: plan.pacing,
              status: plan.status,
            }
          : null,
        usage: {
          period: { preset, since, until },
          creditsConsumedSek,
          impressions: delivery.impressions,
          clicks: delivery.clicks,
          ctr: deliverySummary.ctr,
          reach: delivery.reach,
        },
        ...(hints.length > 0 ? { hints } : {}),
      });
    }
  );

  /**
   * POST /billing/topup
   * Dev-only unless ALLOW_DEV_BILLING_TOPUP=true. Add ledger topup and update cache.
   */
  app.post<{ Body: { amountSek?: number; note?: string } }>("/billing/topup", async (request, reply) => {
    const customerId = request.customer.customerId;
    const allowDev = process.env["ALLOW_DEV_BILLING_TOPUP"] === "true";
    if (!allowDev) {
      return reply.status(503).send({
        error: {
          code: "CONFIG_ERROR",
          message: "Self-service top-up is disabled",
          hint: "Set ALLOW_DEV_BILLING_TOPUP=true for dev, or use admin top-up.",
        },
      });
    }
    const body = (request.body ?? {}) as { amountSek?: number; note?: string };
    const amountSek = typeof body.amountSek === "number" ? body.amountSek : 0;
    if (amountSek <= 0 || amountSek > 200000) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "amountSek must be > 0 and <= 200000",
        },
      });
    }
    const now = new Date();
    await db.insert(customerLedgerEntries).values({
      customerId,
      type: "topup",
      amountSek: String(amountSek),
      refType: "admin",
      note: body.note ?? "Dev top-up",
      createdAt: now,
    });
    const newBalance = await getBalanceFromLedger(customerId);
    await db
      .insert(customerBalanceCache)
      .values({ customerId, balanceSek: String(newBalance), updatedAt: now })
      .onConflictDoUpdate({
        target: customerBalanceCache.customerId,
        set: { balanceSek: String(newBalance), updatedAt: now },
      });
    return reply.send({ ok: true, balanceSek: newBalance });
  });
}
