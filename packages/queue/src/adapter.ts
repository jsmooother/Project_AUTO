/**
 * Queue adapter contract. All implementations must provide correlation context on every job.
 */

export const JOB_TYPES = {
  SCRAPE_TEST: "SCRAPE_TEST",
  SCRAPE_PROD: "SCRAPE_PROD",
  SOURCE_PROBE: "SOURCE_PROBE",
  CRAWL: "CRAWL",
  CRAWL_REAL: "CRAWL_REAL",
  PREVIEW: "PREVIEW",
  META_SYNC_CATALOG: "META_SYNC_CATALOG",
  META_CREATE_CAMPAIGN: "META_CREATE_CAMPAIGN",
  TEMPLATE_RENDER_PREVIEW: "TEMPLATE_RENDER_PREVIEW",
  ADS_SYNC: "ADS_SYNC",
  ADS_PUBLISH: "ADS_PUBLISH",
} as const;

export type JobType = (typeof JOB_TYPES)[keyof typeof JOB_TYPES];

/** Correlation context: required on every job for observability. */
export type CorrelationContext = {
  customerId: string;
  dataSourceId?: string;
  runId?: string;
};

export type EnqueueInput<T = unknown> = {
  jobType: JobType;
  payload: T;
  correlation: CorrelationContext;
  /** Optional idempotency key. */
  idempotencyKey?: string;
};

export type QueuedJob<T = unknown> = {
  jobId: string;
  payload: T;
  correlation: CorrelationContext;
  /** Ack successful processing. */
  ack: () => Promise<void>;
  /** Retry with optional delay (ms). */
  retry: (backoffMs?: number) => Promise<void>;
  /** Move to dead letter with reason. */
  deadLetter: (reason: string) => Promise<void>;
};

export type QueueAdapter = {
  /** Enqueue a job. Returns job id. */
  enqueue<T>(input: EnqueueInput<T>): Promise<string>;

  /**
   * Create a worker that processes jobs of the given type.
   * Processor receives the job; use job.ack() / job.retry() / job.deadLetter() to finish.
   */
  createWorker<T>(
    jobType: JobType,
    process: (job: QueuedJob<T>) => Promise<void>
  ): { close: () => Promise<void> };

  /** Close connections. */
  close(): Promise<void>;
};
