import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { storage, REPRO_BUCKET } from "../lib/storage.js";
import { fetchWithTrace } from "../lib/http.js";
import { mapErrorToEventCode } from "../lib/errorMap.js";
import { dataSources, scrapeRuns, reproBundles } from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";
import { createRunEventsWriter } from "@repo/observability/runEvents";
import { sanitizeForLog } from "@repo/observability/sanitize";

const HTML_SAMPLE_MAX_BYTES = 150_000;

function stripHtmlSample(html: string): string {
  const truncated = html.length > HTML_SAMPLE_MAX_BYTES ? html.slice(0, HTML_SAMPLE_MAX_BYTES) : html;
  return truncated.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] != null ? match[1].trim() : null;
}

/** Only writes to storage and inserts repro_bundles when storage is configured. Otherwise no-op (no dangling DB rows). */
async function saveReproBundle(
  runId: string,
  customerId: string,
  jobType: string,
  jobId: string,
  keySuffix: string,
  body: string | Uint8Array,
  contentType: string
): Promise<void> {
  if (!storage) return;
  const storageKey = `repro/${customerId}/${jobType}/${jobId}/${keySuffix}`;
  const bytes = typeof body === "string" ? new TextEncoder().encode(body) : body;
  await storage.putObject(REPRO_BUCKET, storageKey, bytes, { contentType });
  await db.insert(reproBundles).values({
    customerId,
    runId,
    storageKey,
  });
}

export async function processScrapeTest(job: QueuedJob<{ dataSourceId: string }>): Promise<void> {
  const { jobId, payload, correlation } = job;
  const { customerId, dataSourceId, runId } = correlation;

  if (!customerId || !dataSourceId || !runId) {
    await job.deadLetter("Missing correlation: customerId, dataSourceId, runId required");
    return;
  }

  const emit = createRunEventsWriter(db);
  const basePayload = {
    customerId,
    jobType: "SCRAPE_TEST",
    jobId,
    runId,
    dataSourceId,
  };

  if (!storage) {
    await emit({
      ...basePayload,
      level: "warn",
      stage: "init",
      eventCode: "STORAGE_NOT_CONFIGURED",
      message: "Storage adapter not configured; repro_bundles will not be saved",
    });
  }

  try {
    await emit({
      ...basePayload,
      level: "info",
      stage: "load_data_source",
      eventCode: "SYSTEM_JOB_START",
      message: "Loading data source",
    });

    const [ds] = await db
      .select()
      .from(dataSources)
      .where(and(eq(dataSources.id, payload.dataSourceId), eq(dataSources.customerId, customerId)))
      .limit(1);

    if (!ds) {
      await db
        .update(scrapeRuns)
        .set({ status: "failed", errorCode: "NOT_FOUND", errorMessage: "Data source not found" })
        .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));
      await emit({
        ...basePayload,
        level: "error",
        stage: "load_data_source",
        eventCode: "SYSTEM_JOB_FAIL",
        message: "Data source not found",
      });
      await job.deadLetter("Data source not found");
      return;
    }

    await emit({
      ...basePayload,
      level: "info",
      stage: "validate_config",
      eventCode: "SCRAPE_FETCH_OK",
      message: "Config validated",
    });

    await emit({
      ...basePayload,
      level: "info",
      stage: "fetch_base_url",
      eventCode: "SCRAPE_START",
      message: "Fetching base URL",
    });

    const { body: html, trace } = await fetchWithTrace(ds.baseUrl);

    const traceJson = JSON.stringify(sanitizeForLog(trace));
    await saveReproBundle(
      runId,
      customerId,
      "SCRAPE_TEST",
      jobId,
      "http_trace.json",
      traceJson,
      "application/json"
    );

    if (trace.error || trace.status === null || (trace.status !== undefined && trace.status >= 400)) {
      await db
        .update(scrapeRuns)
        .set({
          status: "failed",
          errorCode: mapErrorToEventCode(new Error(trace.error ?? `HTTP ${trace.status}`), "fetch_base_url"),
          errorMessage: trace.error ?? `HTTP ${trace.status}`,
          finishedAt: new Date(),
        })
        .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));
      await emit({
        ...basePayload,
        level: "error",
        stage: "fetch_base_url",
        eventCode: "SCRAPE_FETCH_FAIL",
        message: trace.error ?? `HTTP ${trace.status}`,
        meta: sanitizeForLog(trace),
      });
      const htmlSample = stripHtmlSample(html);
      await saveReproBundle(
        runId,
        customerId,
        "SCRAPE_TEST",
        jobId,
        "html_sample.html",
        htmlSample,
        "text/html"
      );
      await emit({
        ...basePayload,
        level: "error",
        stage: "finalize_failed",
        eventCode: "SYSTEM_JOB_FAIL",
        message: "Scrape failed",
      });
      await job.deadLetter(trace.error ?? `HTTP ${trace.status}`);
      return;
    }

    await emit({
      ...basePayload,
      level: "info",
      stage: "capture_html_sample",
      eventCode: "SCRAPE_FETCH_OK",
      message: "HTML captured",
      meta: { status: trace.status, durationMs: trace.durationMs },
    });

    const htmlSample = stripHtmlSample(html);
    await saveReproBundle(
      runId,
      customerId,
      "SCRAPE_TEST",
      jobId,
      "html_sample.html",
      htmlSample,
      "text/html"
    );

    const title = extractTitle(html);
    await emit({
      ...basePayload,
      level: "info",
      stage: "parse_minimal",
      eventCode: "SCRAPE_PARSE_OK",
      message: "Parse minimal",
      meta: { title },
    });

    await db
      .update(scrapeRuns)
      .set({
        status: "success",
        finishedAt: new Date(),
        itemsFound: 0,
      })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

    await emit({
      ...basePayload,
      level: "info",
      stage: "finalize_success",
      eventCode: "SYSTEM_JOB_SUCCESS",
      message: "SCRAPE_TEST completed",
    });

    await job.ack();
  } catch (err) {
    const errorCode = mapErrorToEventCode(err, "finalize_failed");
    const message = err instanceof Error ? err.message : String(err);

    await db
      .update(scrapeRuns)
      .set({
        status: "failed",
        errorCode,
        errorMessage: message,
        finishedAt: new Date(),
      })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

    await emit({
      ...basePayload,
      level: "error",
      stage: "finalize_failed",
      eventCode: "SYSTEM_JOB_FAIL",
      message,
      meta: sanitizeForLog({ error: message }),
    });

    try {
      if (storage) {
        const traceJson = JSON.stringify(sanitizeForLog({ error: message }));
        await saveReproBundle(
          runId,
          customerId,
          "SCRAPE_TEST",
          jobId,
          "http_trace.json",
          traceJson,
          "application/json"
        );
      }
    } catch (_) {
      /* best effort */
    }

    await job.deadLetter(message);
  }
}
