# Queue and Jobs

## Job types
- SCRAPE_TEST
- SCRAPE_PROD
- SOURCE_PROBE (onboarding probe: determine SiteProfile and persist to data_sources.config_json)
- META_SYNC_CATALOG
- META_CREATE_CAMPAIGN
- TEMPLATE_RENDER_PREVIEW

## Queue adapter contract (must implement)
- enqueue(jobType, payload, {customer_id, data_source_id?, run_id?}) -> job_id
- dequeue(jobType) -> job payload + job_id
- ack(job_id)
- retry(job_id, backoff)
- dead_letter(job_id, reason)

## Retry policy (defaults)
- Network/timeouts: 3 retries with exponential backoff
- Meta 429: backoff with jitter, up to 5 retries
- Parsing errors: no blind retry (requires fix), but allow one retry after a delay

## Concurrency controls
- Global concurrency: e.g. 10 workers
- Per customer: e.g. max 2 concurrent jobs
- Per data source: max 1 job concurrently

## Job idempotency
- Each job should include an idempotency key.
- SCRAPE_PROD jobs should upsert scrape_runs + items safely.
- META_SYNC jobs should compute diffs and only apply necessary changes.

## BullMQ worker settings (Redis adapter)

The BullMQ adapter uses safer defaults for long-running scrape jobs:

- **lockDuration**: 600000 ms (10 min) — avoids lock expiry during discovery/detail fetch
- **stalledInterval**: 60000 ms (60 s)
- **maxStalledCount**: 1 — avoids repeated reprocessing loops
- **concurrency**: from `WORKER_CONCURRENCY` env (default 2)

When a lock is lost or cannot be renewed, the worker emits run_events:
- **QUEUE_LOCK_RENEW_FAIL** — lock renewal failed; job may stall
- **QUEUE_LOCK_LOST** — lock lost; job moved to failed

See `docs/22_local_validation.md` for troubleshooting.