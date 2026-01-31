# Cursor Prompt: Implement API + Worker (Deliverables 6–7)

Implement apps/api and apps/worker according to:
- docs/16_api_spec.md
- docs/17_worker_spec.md
- existing packages: @repo/db, @repo/queue, @repo/storage, @repo/observability, @repo/shared

## Requirements
1) apps/api (Fastify recommended)
- Middleware that requires x-customer-id header (uuid). If missing -> 401.
- CRUD data_sources for that customer.
- POST /v1/data-sources/:id/test-run:
  - create scrape_runs row with run_type='test', status='queued'
  - enqueue SCRAPE_TEST with payload { dataSourceId }
  - correlation: { customerId, dataSourceId, runId }
  - update scrape_runs.job_id to returned jobId
  - emit run_event SYSTEM_JOB_START (info)

- Runs read endpoints:
  - list runs, read run, read run events

- Support cases:
  - POST /v1/support-cases creates support_cases row
  - auto-link latest run if dataSourceId provided
  - emit SUPPORT_CASE_CREATED run_event (info)

2) apps/worker
- Setup queue workers for SCRAPE_TEST (SCRAPE_PROD stub ok).
- For SCRAPE_TEST:
  - read data source from DB (validate belongs to customerId from correlation)
  - fetch base_url (HTTP GET, with timeout)
  - record http_trace (status, duration, url)
  - store html sample (<=150KB) into storage adapter under repro/...
  - write repro_bundles rows for each stored file
  - parse minimal: extract title from HTML, store in run_event meta
  - update scrape_runs status success + finished_at + items_found=0 (test run)
  - emit SYSTEM_JOB_SUCCESS

- On failure:
  - update scrape_runs status failed + error_code + error_message
  - emit SYSTEM_JOB_FAIL (error)
  - store http_trace + html_sample if possible + repro_bundles rows

3) Code quality
- TypeScript strict, zod validation.
- Use @repo/observability sanitizeForLog for any meta payload.
- Never log secrets.
- Provide README notes for running api/worker locally.

Start with minimal file structure and implement in small steps.