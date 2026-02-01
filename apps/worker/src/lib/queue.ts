import { createRedisQueueAdapter } from "@repo/queue";
import { db } from "./db.js";
import { createRunEventsWriter } from "@repo/observability/runEvents";
import { scrapeRuns } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";

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
});

export { queue };
