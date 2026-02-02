/**
 * BullMQ + Redis implementation of the queue adapter.
 * One queue per job type; every job carries correlation context.
 */

import { Queue, Worker, Job } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import type {
  JobType,
  CorrelationContext,
  EnqueueInput,
  QueuedJob,
  QueueAdapter,
} from "./adapter.js";
import { JOB_TYPES } from "./adapter.js";

const QUEUE_PREFIX = "repo";

export type ValidateCorrelationResult =
  | { ok: true; correlation: CorrelationContext }
  | { ok: false; reason: "MISSING_CORRELATION" | "MISSING_CUSTOMER_ID"; correlation?: Partial<CorrelationContext> | null };

/**
 * Pure validation for job data. Use in worker wrapper to decide whether to process or dead-letter.
 */
export function validateCorrelation(data: { correlation?: unknown }): ValidateCorrelationResult {
  const correlation = data.correlation;
  if (correlation == null || typeof correlation !== "object") {
    return { ok: false, reason: "MISSING_CORRELATION" };
  }
  const c = correlation as Record<string, unknown>;
  const customerId = c.customerId;
  if (typeof customerId !== "string" || !customerId.trim()) {
    return {
      ok: false,
      reason: "MISSING_CUSTOMER_ID",
      correlation: {
        customerId: "",
        dataSourceId: typeof c.dataSourceId === "string" ? c.dataSourceId : undefined,
        runId: typeof c.runId === "string" ? c.runId : undefined,
      },
    };
  }
  return {
    ok: true,
    correlation: {
      customerId: customerId.trim(),
      dataSourceId: typeof c.dataSourceId === "string" ? c.dataSourceId : undefined,
      runId: typeof c.runId === "string" ? c.runId : undefined,
    },
  };
}

function logQueueValidationError(params: {
  jobType: JobType;
  jobId: string;
  reason: string;
  correlation?: Partial<CorrelationContext> | null;
}): void {
  const payload = {
    event: "queue_validation_error",
    jobType: params.jobType,
    jobId: params.jobId,
    reason: params.reason,
    ...(params.correlation != null && Object.keys(params.correlation).length > 0 ? { correlation: params.correlation } : {}),
  };
  try {
    console.error(JSON.stringify(payload));
  } catch {
    console.error(String(payload));
  }
}

function getConnectionOptions(): ConnectionOptions {
  const url = process.env["REDIS_URL"];
  if (url) {
    try {
      const u = new URL(url);
      return {
        host: u.hostname,
        port: u.port ? parseInt(u.port, 10) : 6379,
        maxRetriesPerRequest: null,
      } as ConnectionOptions;
    } catch {
      return { host: "localhost", port: 6379, maxRetriesPerRequest: null };
    }
  }
  return { host: "localhost", port: 6379, maxRetriesPerRequest: null };
}

function queueName(jobType: JobType): string {
  return `${QUEUE_PREFIX}-${jobType}`;
}

/** BullJob-like shape used by the processor; exported for tests. */
export type BullJobLike<T> = {
  id: string | number | undefined;
  data: { payload: T; correlation: CorrelationContext };
  token?: string;
  moveToFailed: (err: Error, token: string) => Promise<void>;
  retry: () => Promise<void>;
};

/**
 * Runs the worker processor logic for one job. Used by createWorker and by tests to assert
 * missing correlation leads to moveToFailed (deadLetter) and no throw.
 */
export async function runWorkerProcessor<T>(
  bullJob: BullJobLike<T>,
  jobType: JobType,
  processJob: (job: QueuedJob<T>) => Promise<void>,
  opts: { onMissingCorrelation?: (params: OnMissingCorrelationParams) => Promise<void> | void }
): Promise<void> {
  const jobId = String(bullJob.id ?? "");
  const validation = validateCorrelation(bullJob.data);
  if (!validation.ok) {
    logQueueValidationError({
      jobType,
      jobId,
      reason: validation.reason,
      correlation: validation.correlation ?? null,
    });
    await opts.onMissingCorrelation?.({
      jobType,
      jobId,
      reason: validation.reason,
      correlation: validation.correlation ?? null,
    });
    const token = bullJob.token ?? "";
    await bullJob.moveToFailed(new Error(validation.reason), token);
    return;
  }
  const correlation = validation.correlation;
  const token = bullJob.token ?? "";
  const queuedJob: QueuedJob<T> = {
    jobId,
    payload: bullJob.data.payload,
    correlation,
    ack: async () => {},
    retry: async () => {
      await bullJob.retry();
    },
    deadLetter: async (reason: string) => {
      await bullJob.moveToFailed(new Error(reason), token);
    },
  };
  await processJob(queuedJob);
}

export type OnMissingCorrelationParams = {
  jobType: JobType;
  jobId: string;
  reason: "MISSING_CORRELATION" | "MISSING_CUSTOMER_ID";
  correlation?: Partial<CorrelationContext> | null;
};

export type RedisQueueOptions = {
  connection?: ConnectionOptions;
  onLockIssue?: (params: {
    jobType: JobType;
    jobId: string;
    correlation: CorrelationContext | null;
    event: "lock_renew_fail" | "lock_lost";
    error: Error;
  }) => Promise<void> | void;
  /** Called when a job is dead-lettered due to missing/invalid correlation. Use to emit run_event when runId/customerId available. */
  onMissingCorrelation?: (params: OnMissingCorrelationParams) => Promise<void> | void;
};

export function createRedisQueueAdapter(options: RedisQueueOptions = {}): QueueAdapter {
  const connection = options.connection ?? getConnectionOptions();
  const queues = new Map<JobType, Queue>();
  const workers = new Map<JobType, Worker>();

  function getQueue(jobType: JobType): Queue {
    let q = queues.get(jobType);
    if (!q) {
      q = new Queue(queueName(jobType), {
        connection,
        defaultJobOptions: {
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
        },
      });
      queues.set(jobType, q);
    }
    return q;
  }

  return {
    async enqueue<T>(input: EnqueueInput<T>): Promise<string> {
      const { jobType, payload, correlation, idempotencyKey } = input;
      const queue = getQueue(jobType);
      const job = await queue.add(
        "job",
        { payload, correlation } as { payload: T; correlation: CorrelationContext },
        {
          jobId: idempotencyKey,
        }
      );
      return job.id ?? String(job.name);
    },

    createWorker<T>(
      jobType: JobType,
      processJob: (job: QueuedJob<T>) => Promise<void>
    ): { close: () => Promise<void> } {
      const queue = getQueue(jobType);
      const concurrency = Number(process.env["WORKER_CONCURRENCY"] ?? "2") || 2;
      const worker = new Worker(
        queueName(jobType),
        async (bullJob: Job<{ payload: T; correlation: CorrelationContext }>) => {
          const token = (bullJob as Job<{ payload: T; correlation: CorrelationContext }> & { token?: string }).token ?? "";
          await runWorkerProcessor(
            {
              id: bullJob.id,
              data: bullJob.data,
              token,
              moveToFailed: async (err, t) => {
                await bullJob.moveToFailed(err, t);
              },
              retry: () => bullJob.retry(),
            },
            jobType,
            processJob,
            { onMissingCorrelation: options.onMissingCorrelation }
          );
        },
        {
          connection,
          concurrency,
          lockDuration: 600_000,
          stalledInterval: 60_000,
          maxStalledCount: 1,
        }
      );
      worker.on("failed", async (job, err) => {
        if (!job) return;
        const message = err?.message ?? "";
        if (message.includes("Missing lock")) {
          await options.onLockIssue?.({
            jobType,
            jobId: String(job.id ?? ""),
            correlation: job.data?.correlation ?? null,
            event: "lock_lost",
            error: err,
          });
        }
      });
      worker.on("stalled", async (jobId) => {
        try {
          const stalledJob = await queue.getJob(jobId);
          if (!stalledJob) return;
          await options.onLockIssue?.({
            jobType,
            jobId: String(stalledJob.id ?? ""),
            correlation: stalledJob.data?.correlation ?? null,
            event: "lock_lost",
            error: new Error("Job stalled; lock may be lost"),
          });
        } catch {
          /* best-effort */
        }
      });
      worker.on("error", async (err) => {
        const message = err?.message ?? "";
        if (message.includes("could not renew lock")) {
          await options.onLockIssue?.({
            jobType,
            jobId: "",
            correlation: null,
            event: "lock_renew_fail",
            error: err,
          });
        }
      });
      workers.set(jobType, worker);
      return {
        async close() {
          const w = workers.get(jobType);
          if (w) {
            await w.close();
            workers.delete(jobType);
          }
        },
      };
    },

    async close(): Promise<void> {
      for (const w of workers.values()) await w.close();
      workers.clear();
      for (const q of queues.values()) await q.close();
      queues.clear();
      /* Connections are owned by Queue/Worker and closed above */
    },
  };
}

export { type QueueAdapter, type JobType, type CorrelationContext, JOB_TYPES } from "./adapter.js";
