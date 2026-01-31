/**
 * run_events writer. Writes to Postgres via @repo/db. Correlation context required.
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type * as schema from "@repo/db/schema";
import { runEvents } from "@repo/db/schema";
import { sanitizeForLog } from "./sanitize.js";

export type RunEventPayload = {
  customerId: string;
  jobType: string;
  jobId: string;
  runId: string;
  dataSourceId?: string | null;
  level: string;
  stage: string;
  eventCode: string;
  message: string;
  meta?: Record<string, unknown> | null;
};

export type RunEventsWriter = (payload: RunEventPayload) => Promise<void>;

export function createRunEventsWriter(db: NodePgDatabase<typeof schema>): RunEventsWriter {
  return async (payload: RunEventPayload): Promise<void> => {
    const { customerId, jobType, jobId, runId, dataSourceId, level, stage, eventCode, message, meta } = payload;
    await db.insert(runEvents).values({
      customerId,
      jobType,
      jobId,
      runId,
      dataSourceId: dataSourceId ?? undefined,
      level,
      stage,
      eventCode,
      message,
      meta: meta ? sanitizeForLog(meta) : undefined,
    });
  };
}

/** One-off emit: pass db and payload. Use createRunEventsWriter when processing many events. */
export async function emitRunEvent(
  db: NodePgDatabase<typeof schema>,
  payload: RunEventPayload
): Promise<void> {
  const writer = createRunEventsWriter(db);
  await writer(payload);
}
