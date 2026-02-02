import { createRedisQueueAdapter } from "@repo/queue";
import { db } from "./db.js";
import { createRunEventsWriter } from "@repo/observability/runEvents";
import { scrapeRuns } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";

const RUN_ID_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const queue = createRedisQueueAdapter({
  onLockIssue: async ({ jobType, jobId, correlation, event, error }) => {
    if (!correlation?.customerId) return;
    const emit = createRunEventsWriter(db);
    const runId = correlation.runId ?? "";
    const dataSourceId = correlation.dataSourceId ?? undefined;
    const eventCode = event === "lock_lost" ? "QUEUE_LOCK_LOST" : "QUEUE_LOCK_RENEW_FAIL";
    await emit({
      customerId: correlation.customerId,
      jobType,
      jobId,
      runId,
      dataSourceId,
      level: "error",
      stage: "queue",
      eventCode,
      message: error.message,
      meta: { event, jobId },
    });
    if (runId) {
      await db
        .update(scrapeRuns)
        .set({
          status: "failed",
          errorCode: eventCode,
          errorMessage: error.message,
          finishedAt: new Date(),
        })
        .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, correlation.customerId)));
    }
  },
  onMissingCorrelation: async ({ jobType, jobId, reason, correlation }) => {
    const customerId = correlation?.customerId?.trim();
    const runId = typeof correlation?.runId === "string" ? correlation.runId.trim() : "";
    if (!customerId || !runId || !RUN_ID_UUID_REGEX.test(runId)) return;
    const emit = createRunEventsWriter(db);
    await emit({
      customerId,
      jobType,
      jobId,
      runId,
      dataSourceId: typeof correlation?.dataSourceId === "string" ? correlation.dataSourceId : undefined,
      level: "error",
      stage: "init",
      eventCode: "QUEUE_MISSING_CORRELATION",
      message: "Job missing correlation; dead-lettered",
      meta: { jobType, jobId, reason },
    });
  },
});

export { queue };
