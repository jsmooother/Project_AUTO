import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  inventorySources,
  inventoryItems,
  metaConnections,
  adTemplateConfigs,
  adSettings,
  adRuns,
  metaAdObjects,
} from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";

/**
 * ADS_SYNC job: Catalog sync (simulated for MVP)
 * 
 * Validation (hard fail → ad_runs.failed):
 * - inventory source exists
 * - inventory_items count > 0
 * - meta_connections.status = connected
 * - approved template config exists
 * 
 * Execution:
 * - create ad_settings if missing
 * - create meta_ad_objects if missing
 * - set last_synced_at timestamps
 */
export async function processAdsSync(job: QueuedJob<Record<string, never>>): Promise<void> {
  const { payload, correlation } = job;
  const { customerId, runId } = correlation;

  if (!customerId || !runId) {
    const msg = "Missing correlation: customerId and runId required";
    await job.deadLetter(msg);
    return;
  }

  const now = new Date();

  try {
    console.log(JSON.stringify({ event: "ads_sync_job_start", runId, customerId }));
    await db
      .update(adRuns)
      .set({ status: "running", startedAt: now })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

    // Validation: inventory source exists
    const [source] = await db
      .select()
      .from(inventorySources)
      .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
      .limit(1);

    if (!source) {
      const msg = "No active inventory source found";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Validation: inventory_items count > 0
    const items = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          eq(inventoryItems.inventorySourceId, source.id)
        )
      )
      .limit(1);

    if (items.length === 0) {
      const msg = "No inventory items found. Run a crawl first.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Validation: meta_connections.status = connected
    const [metaConnection] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    if (!metaConnection || metaConnection.status !== "connected") {
      const msg = "Meta account not connected. Connect your Meta account first.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Validation: approved template config exists
    const [templateConfig] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    if (!templateConfig) {
      const msg = "No template config found. Configure a template first.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    if (templateConfig.status !== "approved") {
      const msg = "Template config not approved. Approve your template first.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Execution: ensure ad_settings exists
    const [existingSettings] = await db
      .select()
      .from(adSettings)
      .where(eq(adSettings.customerId, customerId))
      .limit(1);

    if (!existingSettings) {
      await db.insert(adSettings).values({
        customerId,
        status: "ready",
        updatedAt: now,
      });
    } else {
      await db
        .update(adSettings)
        .set({
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(adSettings.customerId, customerId));
    }

    // Execution: ensure meta_ad_objects exists
    const [existingObjects] = await db
      .select()
      .from(metaAdObjects)
      .where(eq(metaAdObjects.customerId, customerId))
      .limit(1);

    if (!existingObjects) {
      await db.insert(metaAdObjects).values({
        customerId,
        status: "draft",
        lastSyncedAt: now,
        updatedAt: now,
      });
    } else {
      await db
        .update(metaAdObjects)
        .set({
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(eq(metaAdObjects.customerId, customerId));
    }

    await db
      .update(adRuns)
      .set({ status: "success", finishedAt: new Date() })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

    console.log(JSON.stringify({ event: "ads_sync_job_finish", runId, customerId, status: "success" }));
    await job.ack();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: "ads_sync_job_finish", runId, customerId, status: "failed", error: message }));
    await db
      .update(adRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: message })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
    await job.deadLetter(message);
  }
}
