import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc, gte, inArray } from "drizzle-orm";
import { db } from "../lib/db.js";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import {
  inventorySources,
  inventoryItems,
  adTemplateConfigs,
  metaConnections,
  adSettings,
  adRuns,
  metaAdObjects,
  onboardingStates,
  creativeAssets,
} from "@repo/db/schema";
import { resolveEffectiveAdAccountId, maskAdAccountId } from "../lib/metaAdAccount.js";
import { sql } from "drizzle-orm";

const settingsBody = z.object({
  geoMode: z.enum(["radius", "regions"]),
  geoCenterText: z.string().optional(),
  geoRadiusKm: z.number().int().positive().optional(),
  geoRegionsJson: z.array(z.string()).optional(),
  formatsJson: z.array(z.string()).min(1, "At least one format required"),
  ctaType: z.string().default("learn_more"),
  budgetOverride: z.number().positive().optional(),
});

/**
 * GET /ads/status - Rich snapshot powering ALL Ads UI pages
 */
export async function adsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/ads/status", async (request, reply) => {
    const customerId = request.customer.customerId;

    // Fetch all required data in parallel
    const [
      source,
      items,
      templateConfig,
      metaConnection,
      settings,
      objects,
      lastRuns,
      onboarding,
    ] = await Promise.all([
      db
        .select()
        .from(inventorySources)
        .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.customerId, customerId))
        .then((rows) => rows),
      db
        .select()
        .from(adTemplateConfigs)
        .where(eq(adTemplateConfigs.customerId, customerId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(metaConnections)
        .where(eq(metaConnections.customerId, customerId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(adSettings)
        .where(eq(adSettings.customerId, customerId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(metaAdObjects)
        .where(eq(metaAdObjects.customerId, customerId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
      db
        .select()
        .from(adRuns)
        .where(eq(adRuns.customerId, customerId))
        .orderBy(desc(adRuns.createdAt))
        .limit(10),
      db
        .select()
        .from(onboardingStates)
        .where(eq(onboardingStates.customerId, customerId))
        .limit(1)
        .then((rows) => rows[0] ?? null),
    ]);

    // Meta write mode and partner access (needed for prerequisites)
    const allowRealWrite = process.env["ALLOW_REAL_META_WRITE"] === "true";
    const allowDevSim = process.env["ALLOW_DEV_ADS_PUBLISH_SIM"] === "true";
    const metaConnectedAndSelected =
      metaConnection?.status === "connected" && !!metaConnection?.selectedAdAccountId;
    const partnerAccessStatus = metaConnection?.partnerAccessStatus ?? "pending";
    const metaPartnerAccessVerified = partnerAccessStatus === "verified";
    const requirePartnerForRealWrite = allowRealWrite && !allowDevSim;
    const metaOk =
      metaConnectedAndSelected &&
      (requirePartnerForRealWrite ? metaPartnerAccessVerified : true);

    // Prerequisites check
    const prerequisites = {
      website: {
        ok: !!source,
        hint: source ? null : "Connect a website to start",
        link: "/connect-website",
      },
      inventory: {
        ok: items.length > 0,
        count: items.length,
        hint: items.length === 0 ? "Run a crawl to populate inventory" : null,
      },
      templates: {
        ok: !!templateConfig && templateConfig.status === "approved",
        hint:
          !templateConfig
            ? "Configure a template"
            : templateConfig.status !== "approved"
              ? "Approve your template"
              : null,
        link: "/templates",
      },
      meta: {
        ok: metaOk,
        hint: !metaConnectedAndSelected
          ? metaConnection?.status !== "connected"
            ? "Connect your Meta account"
            : "Select an ad account in Settings → Meta"
          : requirePartnerForRealWrite && !metaPartnerAccessVerified
            ? "Verify Meta access in Settings"
            : null,
        link: "/settings#meta",
      },
      metaPartnerAccessVerified: requirePartnerForRealWrite ? metaPartnerAccessVerified : true,
    };

    // Derived budget
    const defaultMonthly = onboarding?.monthlyBudgetAmount
      ? parseFloat(onboarding.monthlyBudgetAmount)
      : null;
    const currency = onboarding?.budgetCurrency ?? "USD";
    const effective = settings?.budgetOverride ?? defaultMonthly;

    const derivedBudget = {
      defaultMonthly,
      currency,
      effective,
    };

    // Meta write mode indicator (no secrets)
    const metaWriteMode = allowRealWrite ? "real" : allowDevSim ? "sim" : "disabled";

    // Resolve effective ad account (for internal test mode detection)
    const { effectiveId: effectiveAdAccountId, mode: adAccountMode } = resolveEffectiveAdAccountId({
      customerId,
      selectedAdAccountId: metaConnection?.selectedAdAccountId ?? null,
    });

    // Return rich status object
    return reply.send({
      prerequisites,
      derived: {
        budget: derivedBudget,
        metaWriteMode,
        metaAccountMode: adAccountMode,
        effectiveAdAccountIdLast4: adAccountMode === "internal_test" && effectiveAdAccountId ? maskAdAccountId(effectiveAdAccountId) : null,
      },
      settings: settings
        ? {
            id: settings.id,
            geoMode: settings.geoMode,
            geoCenterText: settings.geoCenterText,
            geoRadiusKm: settings.geoRadiusKm,
            geoRegionsJson: Array.isArray(settings.geoRegionsJson) ? settings.geoRegionsJson : null,
            formatsJson: Array.isArray(settings.formatsJson) ? settings.formatsJson : [],
            ctaType: settings.ctaType,
            budgetOverride: settings.budgetOverride ? parseFloat(settings.budgetOverride) : null,
            status: settings.status,
            lastSyncedAt: settings.lastSyncedAt?.toISOString() ?? null,
            lastPublishedAt: settings.lastPublishedAt?.toISOString() ?? null,
            lastError: settings.lastError,
            createdAt: settings.createdAt.toISOString(),
            updatedAt: settings.updatedAt.toISOString(),
          }
        : null,
      objects: objects
        ? {
            id: objects.id,
            catalogId: objects.catalogId,
            campaignId: objects.campaignId,
            adsetId: objects.adsetId,
            creativeId: objects.creativeId,
            adId: objects.adId,
            status: objects.status,
            lastPublishStep: objects.lastPublishStep,
            lastPublishError: objects.lastPublishError,
            lastSyncedAt: objects.lastSyncedAt?.toISOString() ?? null,
            createdAt: objects.createdAt.toISOString(),
            updatedAt: objects.updatedAt.toISOString(),
          }
        : null,
      lastRuns: lastRuns.map((run) => ({
        id: run.id,
        trigger: run.trigger,
        status: run.status,
        startedAt: run.startedAt?.toISOString() ?? null,
        finishedAt: run.finishedAt?.toISOString() ?? null,
        errorMessage: run.errorMessage,
        createdAt: run.createdAt.toISOString(),
      })),
    });
  });

  // POST /ads/settings - upsert ad_settings
  app.post("/ads/settings", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = settingsBody.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? parsed.error.message;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: String(message),
        issues: parsed.error.issues,
      });
    }

    const data = parsed.data;
    const now = new Date();

    // Determine status based on validation
    let status: "draft" | "ready" | "error" = "draft";
    if (data.geoMode === "radius" && data.geoCenterText && data.geoRadiusKm) {
      status = "ready";
    } else if (data.geoMode === "regions" && data.geoRegionsJson && data.geoRegionsJson.length > 0) {
      status = "ready";
    }

    const [existing] = await db
      .select()
      .from(adSettings)
      .where(eq(adSettings.customerId, customerId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(adSettings)
        .set({
          geoMode: data.geoMode,
          geoCenterText: data.geoCenterText ?? null,
          geoRadiusKm: data.geoRadiusKm ?? null,
          geoRegionsJson: data.geoRegionsJson ?? null,
          formatsJson: data.formatsJson,
          ctaType: data.ctaType,
          budgetOverride: data.budgetOverride ? data.budgetOverride.toString() : null,
          status,
          lastError: null,
          updatedAt: now,
        })
        .where(eq(adSettings.customerId, customerId))
        .returning();

      if (!updated) {
        return reply.status(500).send({
          error: "INTERNAL",
          message: "Failed to update ad settings",
        });
      }

      return reply.send({
        id: updated.id,
        geoMode: updated.geoMode,
        geoCenterText: updated.geoCenterText,
        geoRadiusKm: updated.geoRadiusKm,
        geoRegionsJson: updated.geoRegionsJson,
        formatsJson: updated.formatsJson,
        ctaType: updated.ctaType,
        budgetOverride: updated.budgetOverride ? parseFloat(updated.budgetOverride) : null,
        status: updated.status,
        lastSyncedAt: updated.lastSyncedAt?.toISOString() ?? null,
        lastPublishedAt: updated.lastPublishedAt?.toISOString() ?? null,
        lastError: updated.lastError,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    const [created] = await db
      .insert(adSettings)
      .values({
        customerId,
        geoMode: data.geoMode,
        geoCenterText: data.geoCenterText ?? null,
        geoRadiusKm: data.geoRadiusKm ?? null,
        geoRegionsJson: data.geoRegionsJson ?? null,
        formatsJson: data.formatsJson,
        ctaType: data.ctaType,
        budgetOverride: data.budgetOverride ? data.budgetOverride.toString() : null,
        status,
        updatedAt: now,
      })
      .returning();

    if (!created) {
      return reply.status(500).send({
        error: "INTERNAL",
        message: "Failed to create ad settings",
      });
    }

    return reply.status(201).send({
      id: created.id,
      geoMode: created.geoMode,
      geoCenterText: created.geoCenterText,
      geoRadiusKm: created.geoRadiusKm,
      geoRegionsJson: created.geoRegionsJson,
      formatsJson: created.formatsJson,
      ctaType: created.ctaType,
      budgetOverride: created.budgetOverride ? parseFloat(created.budgetOverride) : null,
      status: created.status,
      lastSyncedAt: created.lastSyncedAt?.toISOString() ?? null,
      lastPublishedAt: created.lastPublishedAt?.toISOString() ?? null,
      lastError: created.lastError,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    });
  });

  // POST /ads/sync - enqueue ADS_SYNC job
  app.post("/ads/sync", async (request, reply) => {
    const customerId = request.customer.customerId;

    // Dedupe check (30 seconds)
    const DEDUPE_SECONDS = 30;
    const dedupeSince = new Date(Date.now() - DEDUPE_SECONDS * 1000);
    const [recent] = await db
      .select({ id: adRuns.id })
      .from(adRuns)
      .where(
        and(
          eq(adRuns.customerId, customerId),
          inArray(adRuns.status, ["queued", "running"]),
          gte(adRuns.createdAt, dedupeSince)
        )
      )
      .limit(1);

    if (recent) {
      request.log.info({ runId: recent.id, customerId, jobType: "ads_sync", event: "enqueue_deduped" });
      return reply.status(200).send({ runId: String(recent.id), jobId: null, deduped: true });
    }

    const [run] = await db
      .insert(adRuns)
      .values({
        customerId,
        trigger: "manual",
        status: "queued",
      })
      .returning({ id: adRuns.id });

    if (!run) {
      return reply.status(500).send({ error: "INTERNAL", message: "Insert failed" });
    }

    const runId = String(run.id);
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.ADS_SYNC,
      payload: {},
      correlation: { customerId, runId },
    });

    request.log.info({ runId, customerId, jobId, jobType: "ads_sync", event: "enqueue" });
    return reply.status(201).send({ runId, jobId });
  });

  // POST /ads/publish - enqueue ADS_PUBLISH job
  app.post("/ads/publish", async (request, reply) => {
    const customerId = request.customer.customerId;

    // Dedupe check (30 seconds)
    const DEDUPE_SECONDS = 30;
    const dedupeSince = new Date(Date.now() - DEDUPE_SECONDS * 1000);
    const [recent] = await db
      .select({ id: adRuns.id })
      .from(adRuns)
      .where(
        and(
          eq(adRuns.customerId, customerId),
          inArray(adRuns.status, ["queued", "running"]),
          gte(adRuns.createdAt, dedupeSince)
        )
      )
      .limit(1);

    if (recent) {
      request.log.info({ runId: recent.id, customerId, jobType: "ads_publish", event: "enqueue_deduped" });
      return reply.status(200).send({ runId: String(recent.id), jobId: null, deduped: true });
    }

    const [run] = await db
      .insert(adRuns)
      .values({
        customerId,
        trigger: "manual",
        status: "queued",
      })
      .returning({ id: adRuns.id });

    if (!run) {
      return reply.status(500).send({ error: "INTERNAL", message: "Insert failed" });
    }

    const runId = String(run.id);
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.ADS_PUBLISH,
      payload: {},
      correlation: { customerId, runId },
    });

    request.log.info({ runId, customerId, jobId, jobType: "ads_publish", event: "enqueue" });
    return reply.status(201).send({ runId, jobId });
  });

  // GET /ads/runs - list ad_runs
  app.get("/ads/runs", async (request, reply) => {
    const customerId = request.customer.customerId;
    const limit = Math.min(parseInt((request.query as { limit?: string }).limit ?? "50", 10) || 50, 200);

    const runs = await db
      .select()
      .from(adRuns)
      .where(eq(adRuns.customerId, customerId))
      .orderBy(desc(adRuns.createdAt))
      .limit(limit);

    return reply.send({
      data: runs.map((run) => ({
        id: run.id,
        trigger: run.trigger,
        status: run.status,
        startedAt: run.startedAt?.toISOString() ?? null,
        finishedAt: run.finishedAt?.toISOString() ?? null,
        errorMessage: run.errorMessage,
        createdAt: run.createdAt.toISOString(),
      })),
    });
  });

  // GET /ads/objects - return meta_ad_objects
  app.get("/ads/objects", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [objects] = await db
      .select()
      .from(metaAdObjects)
      .where(eq(metaAdObjects.customerId, customerId))
      .limit(1);

    if (!objects) {
      return reply.send(null);
    }

    return reply.send({
      id: objects.id,
      catalogId: objects.catalogId,
      campaignId: objects.campaignId,
      adsetId: objects.adsetId,
      creativeId: objects.creativeId,
      adId: objects.adId,
      status: objects.status,
      lastPublishStep: objects.lastPublishStep,
      lastPublishError: objects.lastPublishError,
      lastSyncedAt: objects.lastSyncedAt?.toISOString() ?? null,
      createdAt: objects.createdAt.toISOString(),
      updatedAt: objects.updatedAt.toISOString(),
    });
  });

  // GET /ads/publish-preview - preview what would be published (no DB writes)
  app.get("/ads/publish-preview", async (request, reply) => {
    const customerId = request.customer.customerId;

    // QA Gate: Validate scrape quality (same logic as worker)
    const qaSampleSize = 10;
    const qaItems = await db
      .select({
        id: inventoryItems.id,
        title: inventoryItems.title,
        url: inventoryItems.url,
        price: inventoryItems.price,
        detailsJson: inventoryItems.detailsJson,
        isAdEligible: inventoryItems.isAdEligible,
      })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          eq(inventoryItems.isAdEligible, true),
          sql`${inventoryItems.detailsJson} IS NOT NULL`
        )
      )
      .orderBy(desc(inventoryItems.firstSeenAt))
      .limit(qaSampleSize);

    let validCount = 0;
    const qaResults: Array<{ itemId: string; valid: boolean; reason?: string }> = [];
    
    for (const item of qaItems) {
      const validation = validateItemForMeta({
        ...item,
        detailsJson: item.detailsJson as Record<string, unknown> | null,
      });
      qaResults.push({ itemId: item.id, valid: validation.valid, reason: validation.reason });
      if (validation.valid) {
        validCount++;
      }
    }

    const invalidRatio = qaItems.length > 0 ? (qaItems.length - validCount) / qaItems.length : 1;
    const qaThreshold = 0.3; // 30% invalid threshold
    const qaGatePassed = invalidRatio <= qaThreshold;

    // Select latest N inventory items for Meta projection (N=2 for now)
    // Only include items marked as ad-eligible
    const itemLimit = 2;
    const candidateItems = await db
      .select({
        id: inventoryItems.id,
        title: inventoryItems.title,
        url: inventoryItems.url,
        price: inventoryItems.price,
        detailsJson: inventoryItems.detailsJson,
        isAdEligible: inventoryItems.isAdEligible,
      })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          eq(inventoryItems.isAdEligible, true),
          sql`${inventoryItems.detailsJson} IS NOT NULL`
        )
      )
      .orderBy(desc(inventoryItems.firstSeenAt))
      .limit(itemLimit * 3); // Get extra candidates in case some fail projection/validation

    // Get generated creatives for candidate items
    const itemIds = candidateItems.map((item) => item.id);
    const creatives = itemIds.length > 0
      ? await db
          .select()
          .from(creativeAssets)
          .where(
            and(
              eq(creativeAssets.customerId, customerId),
              inArray(creativeAssets.inventoryItemId, itemIds),
              eq(creativeAssets.status, "generated")
            )
          )
      : [];

    // Map creatives by item ID and variant
    const creativesByItem: Record<string, Record<string, string>> = {};
    for (const creative of creatives) {
      if (!creativesByItem[creative.inventoryItemId]) {
        creativesByItem[creative.inventoryItemId] = {};
      }
      if (creative.generatedImageUrl) {
        creativesByItem[creative.inventoryItemId][creative.variant] = creative.generatedImageUrl;
      }
    }

    // Project items for Meta
    const projectedItems: Array<{
      title: string;
      priceAmount: number;
      currency: string;
      imageUrl: string;
      destinationUrl: string;
      vehicleId: string;
      generatedImageUrl?: string; // Use generated creative if available
    }> = [];
    for (const item of candidateItems) {
      const projected = projectInventoryItemForMeta({
        ...item,
        detailsJson: item.detailsJson as Record<string, unknown> | null,
      });
      if (projected) {
        // Prefer generated feed creative, fallback to source image
        const generatedFeedUrl = creativesByItem[item.id]?.["feed"];
        projectedItems.push({
          title: projected.title,
          priceAmount: projected.price,
          currency: projected.currency,
          imageUrl: generatedFeedUrl ?? projected.imageUrl, // Use generated if available
          destinationUrl: projected.destinationUrl,
          vehicleId: projected.vehicleId,
          ...(generatedFeedUrl ? { generatedImageUrl: generatedFeedUrl } : {}),
        });
        if (projectedItems.length >= itemLimit) {
          break;
        }
      }
    }

    // Check if creatives need to be generated
    const itemsNeedingCreatives = projectedItems.filter((item) => !item.generatedImageUrl);
    const needsCreatives = itemsNeedingCreatives.length > 0;

    const ok = qaGatePassed && projectedItems.length > 0;
    const hint = !qaGatePassed
      ? `Scrape quality too low (${Math.round(invalidRatio * 100)}% invalid). Check Scrape QA panel or inventory quality.`
      : projectedItems.length === 0
        ? "No valid inventory items found for Meta ads. Ensure items have: price >= 50k SEK, valid image URL, valid HTTPS URL, and title."
        : needsCreatives
          ? `${itemsNeedingCreatives.length} item(s) need creative generation. Generate creatives in Ads → Preview.`
          : undefined;

    return reply.send({
      ok,
      qaGate: {
        total: qaItems.length,
        invalid: qaItems.length - validCount,
        invalidRate: invalidRatio,
        threshold: qaThreshold,
        failures: qaResults.filter((r) => !r.valid),
      },
      projectedItems,
      hint,
      needsCreatives,
    });
  });
}

// Helper functions (duplicated from worker for API use)
function validateItemForMeta(item: {
  id: string;
  title: string | null;
  url: string | null;
  price: number | null;
  detailsJson: Record<string, unknown> | null;
}): { valid: boolean; reason?: string } {
  if (!item.detailsJson) {
    return { valid: false, reason: "Missing details_json" };
  }

  const title = item.title?.trim() ?? (item.detailsJson.title as string)?.trim() ?? "";
  if (!title) {
    return { valid: false, reason: "Missing title" };
  }

  let price = 0;
  if (item.detailsJson.priceAmount) {
    price = typeof item.detailsJson.priceAmount === "number" 
      ? item.detailsJson.priceAmount 
      : parseInt(String(item.detailsJson.priceAmount), 10);
  } else if (item.price) {
    price = item.price;
  }
  
  if (!price || price < 50000) {
    return { valid: false, reason: `Invalid price: ${price} (must be >= 50,000)` };
  }

  let imageUrl = "";
  if (item.detailsJson.primaryImageUrl && typeof item.detailsJson.primaryImageUrl === "string") {
    imageUrl = item.detailsJson.primaryImageUrl;
  } else if (item.detailsJson.images && Array.isArray(item.detailsJson.images) && item.detailsJson.images.length > 0) {
    const firstImage = item.detailsJson.images[0];
    imageUrl = typeof firstImage === "string" ? firstImage : String(firstImage);
  }
  
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return { valid: false, reason: "Missing or invalid image URL" };
  }

  const url = item.url?.trim() ?? "";
  if (!url || !url.startsWith("https")) {
    return { valid: false, reason: "Missing or invalid URL (must be HTTPS)" };
  }

  return { valid: true };
}

function projectInventoryItemForMeta(item: {
  id: string;
  title: string | null;
  url: string | null;
  price: number | null;
  detailsJson: Record<string, unknown> | null;
}): {
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  destinationUrl: string;
  vehicleId: string;
} | null {
  if (!item.detailsJson) {
    return null;
  }

  let title = item.title?.trim() ?? "";
  if (!title && item.detailsJson.title && typeof item.detailsJson.title === "string") {
    title = item.detailsJson.title.trim();
  }
  if (!title) {
    return null;
  }

  let price = 0;
  if (item.detailsJson.priceAmount) {
    price = typeof item.detailsJson.priceAmount === "number" 
      ? item.detailsJson.priceAmount 
      : parseInt(String(item.detailsJson.priceAmount), 10);
  } else if (item.price) {
    price = item.price;
  }
  
  if (!price || price < 50000) {
    return null;
  }

  const currency = (item.detailsJson.currency as string)?.toUpperCase() || "SEK";

  let imageUrl = "";
  if (item.detailsJson.primaryImageUrl && typeof item.detailsJson.primaryImageUrl === "string") {
    imageUrl = item.detailsJson.primaryImageUrl;
  } else if (item.detailsJson.images && Array.isArray(item.detailsJson.images) && item.detailsJson.images.length > 0) {
    const firstImage = item.detailsJson.images[0];
    imageUrl = typeof firstImage === "string" ? firstImage : String(firstImage);
  }
  
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return null;
  }

  const destinationUrl = item.url?.trim() ?? "";
  if (!destinationUrl || !destinationUrl.startsWith("http")) {
    return null;
  }

  const vehicleId = item.id;

  return {
    title,
    price: Math.round(price),
    currency,
    imageUrl,
    destinationUrl,
    vehicleId,
  };
}
