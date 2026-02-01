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

export type RedisQueueOptions = {
  connection?: ConnectionOptions;
  onLockIssue?: (params: {
    jobType: JobType;
    jobId: string;
    correlation: CorrelationContext | null;
    event: "lock_renew_fail" | "lock_lost";
    error: Error;
  }) => Promise<void> | void;
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
          const correlation = bullJob.data.correlation;
          if (!correlation?.customerId) {
            throw new Error("Job missing correlation.customerId");
          }
          const token = (bullJob as Job<{ payload: T; correlation: CorrelationContext }> & { token?: string }).token ?? "";
          const queuedJob: QueuedJob<T> = {
            jobId: bullJob.id ?? "",
            payload: bullJob.data.payload,
            correlation: bullJob.data.correlation,
            ack: async () => {
              /* BullMQ completes the job when processor returns */
            },
            retry: async (_backoffMs?: number) => {
              await bullJob.retry();
            },
            deadLetter: async (reason: string) => {
              await bullJob.moveToFailed(new Error(reason), token);
            },
          };
          await processJob(queuedJob);
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
