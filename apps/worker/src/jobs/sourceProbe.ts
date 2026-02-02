/**
 * SOURCE_PROBE: try discovery strategies cheap→expensive, sample detail pages,
 * build SiteProfile and persist to data_sources.config_json.
 */

import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { dataSources, scrapeRuns } from "@repo/db/schema";
import type { SiteProfile } from "@repo/shared";
import {
  DEFAULT_PROFILE_LIMITS,
  DEFAULT_DETAIL_URL_TOKENS,
  type DiscoveryStrategy,
  type SiteProfileDiscovery,
} from "@repo/shared";
import { JOB_TYPES, type QueuedJob } from "@repo/queue";
import { createRunEventsWriter } from "@repo/observability/runEvents";
import { createHttpDriver, createHeadlessDriver } from "../lib/drivers/index.js";
import { getDiscoveryStrategyOrder } from "../lib/discovery/index.js";
import { discoverViaSitemap } from "../lib/discovery/sitemap.js";
import { discoverViaHtmlLinks } from "../lib/discovery/htmlLinks.js";
import { discoverViaEndpointSniff } from "../lib/discovery/endpointSniff.js";
import { discoverViaHeadlessListing } from "../lib/discovery/headlessListing.js";
import { extract } from "../lib/extractors/index.js";
import type { SiteProfileExtract, SiteProfileFetch } from "@repo/shared";

const PROFILE_VERSION = 1;
const MIN_ITEMS_STRONG = 20;
const MIN_ITEMS_WEAK = 3;
const SAMPLE_DETAIL_COUNT = 3;

function buildTrialProfile(baseUrl: string, strategy: DiscoveryStrategy): SiteProfile {
  return {
    profileVersion: PROFILE_VERSION,
    probe: { testedAt: "", confidence: 0, notes: [] },
    discovery: {
      strategy,
      seedUrls: strategy === "html_links" || strategy === "endpoint_sniff" ? [baseUrl] : [],
      sitemapUrls: [],
      detailUrlPatterns: [],
      idFromUrl: { mode: "last_segment" },
    },
    fetch: { driver: "http", http: { timeoutMs: 15_000 } },
    extract: { vertical: "generic", strategy: "dom" },
    limits: DEFAULT_PROFILE_LIMITS,
  };
}

function learnDetailUrlPattern(sampleUrls: string[]): string[] {
  const first = sampleUrls[0];
  if (!first) return [];
  try {
    const u = new URL(first);
    const path = u.pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length < 2) return [".*"];
    const prefix = segments.slice(0, -1).join("/");
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [`^https?://[^/]+/${escapedPrefix}/[^/]+/?$`];
  } catch {
    return [".*"];
  }
}

function detectVertical(attributesJson: Record<string, unknown>): "vehicle" | "generic" {
  const vehicleKeys = ["regNr", "miltal", "bransle", "vaxellada", "arsmodell", "fordonstyp", "farg", "marke", "modell", "features"];
  for (const k of vehicleKeys) {
    if (attributesJson[k] != null) return "vehicle";
  }
  return "generic";
}

function isLikelyDetailUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return DEFAULT_DETAIL_URL_TOKENS.some((t) => lower.includes(t));
}

export async function processSourceProbe(
  job: QueuedJob<{ dataSourceId: string }>
): Promise<void> {
  const { jobId, payload, correlation } = job;
  const { customerId, dataSourceId, runId: correlationRunId } = correlation;

  if (!customerId || !dataSourceId) {
    await job.deadLetter("Missing correlation: customerId, dataSourceId required");
    return;
  }

  const emit = createRunEventsWriter(db);
  let runId = correlationRunId ?? null;
  if (!runId) {
    const [run] = await db
      .insert(scrapeRuns)
      .values({
        customerId,
        dataSourceId,
        runType: "probe",
        status: "running",
      })
      .returning({ id: scrapeRuns.id });
    runId = run ? String(run.id) : null;
  }
  if (!runId) {
    await job.deadLetter("Failed to create probe run");
    return;
  }
  const basePayload = {
    customerId,
    jobType: JOB_TYPES.SOURCE_PROBE,
    jobId: String(jobId),
    runId,
    dataSourceId,
  };

  await db
    .update(scrapeRuns)
    .set({ status: "running" })
    .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

  await emit({
    ...basePayload,
    level: "info",
    stage: "init",
    eventCode: "SYSTEM_JOB_START",
    message: "Job started",
    meta: { jobType: JOB_TYPES.SOURCE_PROBE, jobId: String(jobId), dataSourceId, runId },
  });

  await emit({
    ...basePayload,
    level: "info",
    stage: "probe",
    eventCode: "PROBE_START",
    message: "Onboarding probe started",
  });

  const [ds] = await db
    .select()
    .from(dataSources)
    .where(and(eq(dataSources.id, payload.dataSourceId), eq(dataSources.customerId, customerId)))
    .limit(1);

  if (!ds) {
    await db
      .update(scrapeRuns)
      .set({ status: "failed", errorCode: "NOT_FOUND", errorMessage: "Data source not found", finishedAt: new Date() })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));
    await emit({
      ...basePayload,
      level: "error",
      stage: "finalize",
      eventCode: "SYSTEM_JOB_FAIL",
      message: "Data source not found",
      meta: { jobType: JOB_TYPES.SOURCE_PROBE, jobId: String(jobId), dataSourceId, runId },
    });
    await job.deadLetter("Data source not found");
    return;
  }

  try {
  const baseUrl = ds.baseUrl;
  const strategies = getDiscoveryStrategyOrder();
  let selectedStrategy: DiscoveryStrategy = "unknown";
  let discoveredItems: Array<{ sourceItemId: string; url: string }> = [];
  let fallbackItems: Array<{ sourceItemId: string; url: string }> = [];
  let fallbackStrategy: DiscoveryStrategy = "unknown";
  let selectedMeta: Record<string, unknown> | undefined;
  const driver = createHttpDriver();

  for (const strategy of strategies) {
    const profile = buildTrialProfile(baseUrl, strategy);
    let items: Array<{ sourceItemId: string; url: string }> = [];
    try {
      if (strategy === "sitemap") {
        const ctx = { baseUrl, origin: new URL(baseUrl).origin };
        items = await discoverViaSitemap(driver, profile, ctx);
      } else if (strategy === "html_links") {
        const ctx = { baseUrl, origin: new URL(baseUrl).origin };
        items = await discoverViaHtmlLinks(driver, profile, ctx);
      } else if (strategy === "endpoint_sniff") {
        const ctx = { baseUrl, origin: new URL(baseUrl).origin };
        const result = await discoverViaEndpointSniff(driver, profile, ctx);
        items = result.items;
        selectedMeta = result.meta;
      } else if (strategy === "headless_listing") {
        const ctx = { baseUrl, origin: new URL(baseUrl).origin };
        const headless = createHeadlessDriver();
        items = await discoverViaHeadlessListing(headless, profile, ctx);
      }
      if (items.length > fallbackItems.length) {
        fallbackItems = items;
        fallbackStrategy = strategy;
      }
      if (items.length > 0) {
        // Validate that this strategy yields at least one detail-like URL
        const candidates = items.slice(0, 8).map((i) => i.url);
        let validCount = 0;
        for (const url of candidates) {
          try {
            const res = await driver.fetch(url, { timeoutMs: 10_000 });
            if (res.status !== 200 || !res.body) continue;
            if (res.trace.htmlTruncated) {
              await emit({
                ...basePayload,
                level: "warn",
                stage: "extract",
                eventCode: "HTML_TRUNCATED_FOR_PARSE",
                message: "HTML truncated for parsing",
                meta: {
                  maxBytes: Number(process.env["MAX_HTML_BYTES_FOR_PARSE"] ?? 200_000),
                  originalBytes: res.trace.originalBytes,
                  truncatedBytes: res.trace.truncatedBytes,
                  url,
                },
              });
            }
            const extracted = extract({
              profile: {
                profileVersion: 1,
                probe: { testedAt: "", confidence: 0, notes: [] },
                discovery: profile.discovery,
                fetch: { driver: "http" },
                extract: { vertical: "generic", strategy: "dom" },
                limits: DEFAULT_PROFILE_LIMITS,
              },
              fetchResult: res,
            });
            if (extracted.baseFields.title || extracted.imageUrls.length >= 1) {
              validCount += 1;
              break;
            }
          } catch {
            /* ignore */
          }
        }
        if (validCount > 0) {
          selectedStrategy = strategy;
          discoveredItems = items;
          if (items.length >= MIN_ITEMS_STRONG) break;
        }
      }
    } catch (_) {
      /* try next strategy */
    }
  }
  if (selectedStrategy === "unknown" && fallbackItems.length > 0) {
    discoveredItems = fallbackItems;
    selectedStrategy = fallbackStrategy;
  }

  const foundCount = discoveredItems.length;
  let confidence = 0.1;
  const notes: string[] = [];
  if (selectedStrategy === "unknown") {
    confidence = 0.1;
    notes.push("No detail-like items discovered; add sitemapUrls/seedUrls or enable headless discovery.");
  } else if (foundCount >= MIN_ITEMS_STRONG) {
    confidence = 0.9;
  } else if (foundCount >= MIN_ITEMS_WEAK) {
    confidence = 0.5;
    notes.push(`Only ${foundCount} items discovered; consider adding seedUrls or enabling headless discovery.`);
  } else if (foundCount > 0) {
    confidence = 0.1;
    notes.push(`Only ${foundCount} items discovered; consider adding sitemapUrls/seedUrls or enabling headless.`);
  }
  if (selectedStrategy === "headless_listing") {
    notes.push("Headless listing selected by probe for dynamic inventory discovery.");
  }

  await emit({
    ...basePayload,
    level: "info",
    stage: "probe",
    eventCode: "PROBE_STRATEGY_SELECTED",
    message: `Discovery strategy selected: ${selectedStrategy}`,
    meta: { strategy: selectedStrategy, discoveredCount: discoveredItems.length },
  });
  if (selectedStrategy === "headless_listing") {
    await emit({
      ...basePayload,
      level: "info",
      stage: "probe",
      eventCode: "HEADLESS_USED",
      message: "Headless driver selected for listing discovery",
      meta: { provider: process.env["HEADLESS_PROVIDER"] ?? "playwright-local", mode: "listing", reason: "probe_strategy" },
    });
  }

  let extractVertical: "vehicle" | "generic" = "generic";
  const likely = discoveredItems.filter((i) => isLikelyDetailUrl(i.url));
  const detailCandidates = (likely.length > 0 ? likely : discoveredItems)
    .slice(0, 20)
    .map((i) => i.url);
  const validDetailUrls: string[] = [];
  let detailUrlPatterns: string[] = [];

  for (const url of detailCandidates) {
    try {
      const res = await driver.fetch(url, { timeoutMs: 15_000 });
      if (res.status !== 200 || !res.body) continue;
      if (res.trace.htmlTruncated) {
        await emit({
          ...basePayload,
          level: "warn",
          stage: "extract",
          eventCode: "HTML_TRUNCATED_FOR_PARSE",
          message: "HTML truncated for parsing",
          meta: {
            maxBytes: Number(process.env["MAX_HTML_BYTES_FOR_PARSE"] ?? 200_000),
            originalBytes: res.trace.originalBytes,
            truncatedBytes: res.trace.truncatedBytes,
            url,
          },
        });
      }
      const trialProfile: SiteProfile = {
        profileVersion: 1,
        probe: { testedAt: "", confidence: 0, notes: [] },
        discovery: {
          strategy: selectedStrategy,
          seedUrls: selectedStrategy === "html_links" || selectedStrategy === "endpoint_sniff" ? [baseUrl] : [],
          sitemapUrls: [],
          detailUrlPatterns,
          idFromUrl: { mode: "last_segment" },
        },
        fetch: { driver: "http" },
        extract: { vertical: "generic", strategy: "dom" },
        limits: DEFAULT_PROFILE_LIMITS,
      };
      const extracted = extract({ profile: trialProfile, fetchResult: res });
      if (extracted.baseFields.title || extracted.imageUrls.length >= 1) {
        extractVertical = detectVertical(extracted.attributesJson);
        validDetailUrls.push(url);
        if (validDetailUrls.length >= SAMPLE_DETAIL_COUNT) break;
      }
    } catch (_) {
      /* next sample */
    }
  }

  if (validDetailUrls.length > 0) {
    detailUrlPatterns = learnDetailUrlPattern(validDetailUrls);
  } else {
    const likelyUrls = discoveredItems.filter((i) => isLikelyDetailUrl(i.url)).slice(0, SAMPLE_DETAIL_COUNT).map((i) => i.url);
    if (likelyUrls.length > 0) {
      detailUrlPatterns = learnDetailUrlPattern(likelyUrls);
    }
  }

  const discovery: SiteProfileDiscovery = {
    strategy: selectedStrategy,
    seedUrls: selectedStrategy === "html_links" || selectedStrategy === "endpoint_sniff" ? [baseUrl] : [],
    sitemapUrls: [],
    detailUrlPatterns: detailUrlPatterns.length > 0 ? detailUrlPatterns : [".*"],
    idFromUrl: { mode: "last_segment" },
  };
  const fetchConfig: SiteProfileFetch = {
    driver: "http",
    http: { timeoutMs: 15_000 },
    headless: { enabled: false, timeoutMs: 30_000 },
  };
  const extractConfig: SiteProfileExtract = {
    vertical: extractVertical,
    strategy: "dom",
  };

  const configJson: SiteProfile = {
    profileVersion: PROFILE_VERSION,
    probe: {
      testedAt: new Date().toISOString(),
      confidence,
      notes,
    },
    discovery,
    fetch: fetchConfig,
    extract: extractConfig,
    limits: DEFAULT_PROFILE_LIMITS,
  };

  await db
    .update(dataSources)
    .set({
      configJson: configJson as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(and(eq(dataSources.id, payload.dataSourceId), eq(dataSources.customerId, customerId)));

  await db
    .update(scrapeRuns)
    .set({ status: "success", finishedAt: new Date() })
    .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

  await emit({
    ...basePayload,
    level: "info",
    stage: "finalize",
    eventCode: "SYSTEM_JOB_SUCCESS",
    message: "Job completed",
    meta: {
      jobType: JOB_TYPES.SOURCE_PROBE,
      jobId: String(jobId),
      dataSourceId,
      runId,
      confidence,
      strategy: selectedStrategy,
      foundCount,
      notes,
      ...(selectedMeta ?? {}),
    },
  });

  await job.ack();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(scrapeRuns)
      .set({ status: "failed", errorCode: "SCRAPE_CRASH", errorMessage: message, finishedAt: new Date() })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));
    await emit({
      ...basePayload,
      level: "error",
      stage: "finalize",
      eventCode: "SYSTEM_JOB_FAIL",
      message,
      meta: { jobType: JOB_TYPES.SOURCE_PROBE, jobId: String(jobId), dataSourceId, runId },
    });
    await job.deadLetter(message);
  }
}
