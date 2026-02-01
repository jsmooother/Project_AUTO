/**
 * SCRAPE_PROD: generic incremental pipeline using SiteProfile.
 * 1) Ensure profile exists; 2) Discover; 3) Upsert seen; 4) Fetch detail for new only; 5) Mark removed; 6) Update counters.
 */

import { eq, and, isNull, sql } from "drizzle-orm";
import { createHash } from "crypto";
import { db } from "../lib/db.js";
import { dataSources, scrapeRuns, items } from "@repo/db/schema";
import type { SiteProfile } from "@repo/shared";
import { JOB_TYPES, type QueuedJob } from "@repo/queue";
import { createRunEventsWriter } from "@repo/observability/runEvents";
import { mapErrorToEventCode } from "../lib/errorMap.js";
import { getDriver } from "../lib/drivers/index.js";
import { discover } from "../lib/discovery/index.js";
import { extract } from "../lib/extractors/index.js";
import { DEFAULT_PROFILE_LIMITS } from "@repo/shared";

const SIMULATE_REMOVALS_FRACTION = process.env.SIMULATE_REMOVALS === "1" ? 0.1 : undefined;
const MAX_NEW_PER_RUN = 50;
const DETAIL_CONCURRENCY = 6;

function getProfileFromConfig(config: unknown): SiteProfile | null {
  if (config == null || typeof config !== "object") return null;
  const c = config as Record<string, unknown>;
  if (typeof c.profileVersion !== "number" || !c.discovery || typeof c.discovery !== "object") return null;
  const discovery = c.discovery as Record<string, unknown>;
  const strategy = discovery.strategy as string;
  if (!strategy || strategy === "unknown") return null;
  return config as SiteProfile;
}

function normalizeText(value: string | null): string {
  if (!value) return "";
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function contentHash(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload).sort();
  const normalized: Record<string, unknown> = {};
  for (const k of keys) normalized[k] = payload[k];
  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}

export async function processScrapeProd(
  job: QueuedJob<{ dataSourceId: string }>
): Promise<void> {
  const { jobId, payload, correlation } = job;
  const { customerId, dataSourceId, runId: correlationRunId } = correlation;

  if (!customerId || !dataSourceId) {
    await job.deadLetter("Missing correlation: customerId, dataSourceId required");
    return;
  }

  const emit = createRunEventsWriter(db);
  const basePayload = {
    customerId,
    jobType: JOB_TYPES.SCRAPE_PROD,
    jobId: String(jobId),
    runId: "",
    dataSourceId,
  };

  let runId = correlationRunId ?? null;
  let runRow: { id: string } | undefined;

  if (runId) {
    const [r] = await db
      .select({ id: scrapeRuns.id })
      .from(scrapeRuns)
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)))
      .limit(1);
    runRow = r;
  }

  if (!runRow && !runId) {
    const [run] = await db
      .insert(scrapeRuns)
      .values({
        customerId,
        dataSourceId,
        runType: "prod",
        status: "queued",
      })
      .returning({ id: scrapeRuns.id });
    if (!run) {
      await job.deadLetter("Failed to create scrape_runs row");
      return;
    }
    runId = String(run.id);
    await db
      .update(scrapeRuns)
      .set({ jobId: String(jobId) })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));
  }

  basePayload.runId = runId!;

  const [ds] = await db
    .select()
    .from(dataSources)
    .where(and(eq(dataSources.id, payload.dataSourceId), eq(dataSources.customerId, customerId)))
    .limit(1);

  if (!ds) {
    await db
      .update(scrapeRuns)
      .set({ status: "failed", errorCode: "NOT_FOUND", errorMessage: "Data source not found", finishedAt: new Date() })
      .where(and(eq(scrapeRuns.id, runId!), eq(scrapeRuns.customerId, customerId)));
    await emit({ ...basePayload, level: "error", stage: "load_data_source", eventCode: "SCRAPE_PROD_FAIL", message: "Data source not found" });
    await job.deadLetter("Data source not found");
    return;
  }

  const profile = getProfileFromConfig(ds.configJson);
  if (!profile) {
    await db
      .update(scrapeRuns)
      .set({ status: "failed", errorCode: "PROFILE_MISSING", errorMessage: "Site profile missing or stale", finishedAt: new Date() })
      .where(and(eq(scrapeRuns.id, runId!), eq(scrapeRuns.customerId, customerId)));
    await emit({ ...basePayload, level: "warn", stage: "probe", eventCode: "PROFILE_MISSING", message: "Site profile missing; run probe first" });
    await job.deadLetter("Site profile missing; run POST /v1/data-sources/:id/probe first");
    return;
  }

  const driver = getDriver(profile);
  const limits = { ...DEFAULT_PROFILE_LIMITS, ...profile.limits };
  const maxNewPerRun = Number(process.env["MAX_NEW_PER_RUN"] ?? limits.maxNewPerRun ?? MAX_NEW_PER_RUN) || MAX_NEW_PER_RUN;
  const fetchDelayMs = Number(process.env["FETCH_DELAY_MS"] ?? limits.politenessDelayMs ?? 0) || 0;

  try {
    await emit({ ...basePayload, level: "info", stage: "discovery", eventCode: "DISCOVERY_START", message: "Discovery started" });

    const discoverResult = await discover({
      profile,
      baseUrl: ds.baseUrl,
      driver,
      simulateRemovalsFraction: SIMULATE_REMOVALS_FRACTION,
    });

    await emit({
      ...basePayload,
      level: "info",
      stage: "discovery",
      eventCode: "DISCOVERY_DONE",
      message: "Discovery completed",
      meta: { ...discoverResult.meta, discoveredCount: discoverResult.items.length },
    });

    let upsertedCount = 0;
    for (const item of discoverResult.items) {
      await db
        .insert(items)
        .values({
          customerId,
          dataSourceId,
          sourceItemId: item.sourceItemId,
          url: item.url,
          lastSeenAt: new Date(),
          lastSeenRunId: runId!,
          isActive: true,
          removedAt: null,
        })
        .onConflictDoUpdate({
          target: [items.customerId, items.dataSourceId, items.sourceItemId],
          set: {
            url: item.url,
            lastSeenAt: new Date(),
            lastSeenRunId: runId!,
            isActive: true,
            removedAt: null,
            updatedAt: new Date(),
          },
        });
      upsertedCount += 1;
    }

    await emit({
      ...basePayload,
      level: "info",
      stage: "diff",
      eventCode: "DIFF_DONE",
      message: "Diff/upsert completed",
      meta: { discoveredCount: discoverResult.items.length, upsertedCount },
    });

    const removedResult = await db
      .update(items)
      .set({ isActive: false, removedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(items.customerId, customerId),
          eq(items.dataSourceId, dataSourceId),
          eq(items.isActive, true),
          sql`${items.lastSeenRunId} IS DISTINCT FROM ${runId!}`
        )
      )
      .returning({ id: items.id });
    const removedCount = removedResult.length;

    await emit({
      ...basePayload,
      level: "info",
      stage: "removals",
      eventCode: "REMOVALS_DONE",
      message: "Removed items marked",
      meta: { removedCount },
    });

    const totalNewRow = await db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(
        and(
          eq(items.customerId, customerId),
          eq(items.dataSourceId, dataSourceId),
          eq(items.lastSeenRunId, runId!),
          isNull(items.detailFetchedAt)
        )
      );
    const totalNew = Number(totalNewRow[0]?.count ?? 0);

    const newItems = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.customerId, customerId),
          eq(items.dataSourceId, dataSourceId),
          eq(items.lastSeenRunId, runId!),
          isNull(items.detailFetchedAt)
        )
      )
      .limit(maxNewPerRun);

    const newCount = newItems.length;
    const skippedCount = Math.max(0, totalNew - newCount);

    await emit({
      ...basePayload,
      level: "info",
      stage: "details",
      eventCode: "DETAILS_START",
      message: "Detail fetch started",
      meta: { newCount, totalNew, skippedCount, concurrency: DETAIL_CONCURRENCY },
    });

    let fetchedCount = 0;
    let failedCount = 0;

    for (const item of newItems) {
      if (!item.url) {
        failedCount += 1;
        continue;
      }
      try {
        const res = await driver.fetch(item.url, { timeoutMs: profile.fetch?.http?.timeoutMs ?? 15_000 });
        if (res.status !== 200 || !res.body) {
          await emit({
            ...basePayload,
            level: "warn",
            stage: "details",
            eventCode: "ITEM_DETAIL_FAIL",
            message: "Item detail fetch failed",
            meta: { sourceItemId: item.sourceItemId, reason: `HTTP ${res.status}` },
          });
          failedCount += 1;
          continue;
        }
        const extracted = extract({ profile, fetchResult: res });
        const payloadForHash = {
          title: normalizeText(extracted.baseFields.title),
          descriptionText: normalizeText(extracted.baseFields.descriptionText),
          priceAmount: extracted.baseFields.priceAmount ?? 0,
          priceCurrency: extracted.baseFields.priceCurrency ?? "",
          primaryImageUrl: extracted.baseFields.primaryImageUrl ?? "",
          attributesJson: extracted.attributesJson,
        };
        const hash = contentHash(payloadForHash as unknown as Record<string, unknown>);

        await db
          .update(items)
          .set({
            title: extracted.baseFields.title,
            descriptionText: extracted.baseFields.descriptionText,
            priceAmount: extracted.baseFields.priceAmount != null ? String(extracted.baseFields.priceAmount) : null,
            priceCurrency: extracted.baseFields.priceCurrency,
            attributesJson: extracted.attributesJson,
            imageUrlsJson: extracted.imageUrls,
            primaryImageUrl: extracted.baseFields.primaryImageUrl,
            detailFetchedAt: new Date(),
            lastDetailRunId: runId!,
            contentHash: hash,
            updatedAt: new Date(),
          })
          .where(and(eq(items.id, item.id), eq(items.customerId, customerId)));

        await emit({
          ...basePayload,
          level: "info",
          stage: "details",
          eventCode: "ITEM_DETAIL_OK",
          message: "Item detail fetched",
          meta: { sourceItemId: item.sourceItemId, imageCount: extracted.imageUrls.length },
        });
        fetchedCount += 1;
        if (fetchDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, fetchDelayMs));
        }
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        await emit({
          ...basePayload,
          level: "warn",
          stage: "details",
          eventCode: "ITEM_DETAIL_FAIL",
          message: "Item detail fetch failed",
          meta: { sourceItemId: item.sourceItemId, reason },
        });
        failedCount += 1;
        if (fetchDelayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, fetchDelayMs));
        }
      }
    }

    await emit({
      ...basePayload,
      level: "info",
      stage: "details",
      eventCode: "DETAILS_DONE",
      message: "Detail fetch completed",
      meta: { fetchedCount, failedCount },
    });

    await db
      .update(scrapeRuns)
      .set({
        status: "success",
        finishedAt: new Date(),
        itemsSeen: discoverResult.items.length,
        itemsNew: newCount,
        itemsRemoved: removedCount,
      })
      .where(and(eq(scrapeRuns.id, runId!), eq(scrapeRuns.customerId, customerId)));

    await emit({
      ...basePayload,
      level: "info",
      stage: "finalize",
      eventCode: "SCRAPE_PROD_SUCCESS",
      message: "SCRAPE_PROD completed",
    });

    await job.ack();
  } catch (err) {
    const errorCode = mapErrorToEventCode(err, "finalize");
    const message = err instanceof Error ? err.message : String(err);

    await db
      .update(scrapeRuns)
      .set({
        status: "failed",
        errorCode,
        errorMessage: message,
        finishedAt: new Date(),
      })
      .where(and(eq(scrapeRuns.id, runId!), eq(scrapeRuns.customerId, customerId)));

    await emit({
      ...basePayload,
      level: "error",
      stage: "finalize",
      eventCode: "SCRAPE_PROD_FAIL",
      message,
      meta: { error: message },
    });

    await job.deadLetter(message);
  }
}
