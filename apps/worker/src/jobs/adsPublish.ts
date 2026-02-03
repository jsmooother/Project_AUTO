import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { adSettings, adRuns, metaAdObjects } from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";

/**
 * ADS_PUBLISH job: Campaign publish (simulated for MVP)
 * 
 * Additional validation:
 * - ad_settings exists
 * - geo config valid
 * - at least one format enabled
 * 
 * Execution (when ALLOW_DEV_ADS_PUBLISH_SIM=true):
 * - write placeholder Meta IDs
 * - set meta_ad_objects.status = 'active'
 * - set ad_settings.status = 'active'
 * - set ad_settings.last_published_at
 */
export async function processAdsPublish(job: QueuedJob<Record<string, never>>): Promise<void> {
  const { payload, correlation } = job;
  const { customerId, runId } = correlation;

  if (!customerId || !runId) {
    const msg = "Missing correlation: customerId and runId required";
    await job.deadLetter(msg);
    return;
  }

  const allowDevPublish = process.env["ALLOW_DEV_ADS_PUBLISH_SIM"] === "true";
  const now = new Date();

  try {
    console.log(JSON.stringify({ event: "ads_publish_job_start", runId, customerId }));
    await db
      .update(adRuns)
      .set({ status: "running", startedAt: now })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

    // Validation: ad_settings exists
    const [settings] = await db
      .select()
      .from(adSettings)
      .where(eq(adSettings.customerId, customerId))
      .limit(1);

    if (!settings) {
      const msg = "Ad settings not found. Configure ads settings first.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Validation: geo config valid
    if (settings.geoMode === "radius") {
      if (!settings.geoCenterText || !settings.geoRadiusKm) {
        const msg = "Invalid geo config: radius mode requires center and radius";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }
    } else if (settings.geoMode === "regions") {
      if (!settings.geoRegionsJson || !Array.isArray(settings.geoRegionsJson) || (settings.geoRegionsJson as unknown[]).length === 0) {
        const msg = "Invalid geo config: regions mode requires at least one region";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }
    }

    // Validation: at least one format enabled
    const formats = (settings.formatsJson as unknown[]) || [];
    if (!Array.isArray(formats) || formats.length === 0) {
      const msg = "No ad formats enabled. Enable at least one format in settings.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Execution: only if ALLOW_DEV_ADS_PUBLISH_SIM=true
    if (!allowDevPublish) {
      const msg = "Ads publish simulation is disabled. Set ALLOW_DEV_ADS_PUBLISH_SIM=true to enable.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Write placeholder Meta IDs
    const catalogId = `dev-catalog-${customerId.slice(0, 8)}`;
    const campaignId = `dev-campaign-${customerId.slice(0, 8)}`;
    const adsetId = `dev-adset-${customerId.slice(0, 8)}`;
    const adId = `dev-ad-${customerId.slice(0, 8)}`;

    // Update meta_ad_objects
    const [existingObjects] = await db
      .select()
      .from(metaAdObjects)
      .where(eq(metaAdObjects.customerId, customerId))
      .limit(1);

    if (existingObjects) {
      await db
        .update(metaAdObjects)
        .set({
          catalogId,
          campaignId,
          adsetId,
          adId,
          status: "active",
          updatedAt: now,
        })
        .where(eq(metaAdObjects.customerId, customerId));
    } else {
      await db.insert(metaAdObjects).values({
        customerId,
        catalogId,
        campaignId,
        adsetId,
        adId,
        status: "active",
        updatedAt: now,
      });
    }

    // Update ad_settings
    await db
      .update(adSettings)
      .set({
        status: "active",
        lastPublishedAt: now,
        lastError: null,
        updatedAt: now,
      })
      .where(eq(adSettings.customerId, customerId));

    await db
      .update(adRuns)
      .set({ status: "success", finishedAt: new Date() })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

    console.log(JSON.stringify({ event: "ads_publish_job_finish", runId, customerId, status: "success" }));
    await job.ack();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: "ads_publish_job_finish", runId, customerId, status: "failed", error: message }));

    // Update ad_settings with error
    await db
      .update(adSettings)
      .set({
        status: "error",
        lastError: message,
        updatedAt: now,
      })
      .where(eq(adSettings.customerId, customerId));

    await db
      .update(adRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: message })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
    await job.deadLetter(message);
  }
}
