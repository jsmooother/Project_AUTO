# Worker Spec (apps/worker)

## Goal
Consume jobs and execute pipelines.
Start with SCRAPE_TEST only, then SCRAPE_PROD.

## Non-negotiables
- Every job writes run_events at each stage.
- Every failure:
  - updates scrape_runs.status=failed + error_code + error_message
  - writes at least one run_events error entry
  - writes at least one repro_bundle (http_trace + html_sample if possible)
- Never store secrets in repro bundles; run sanitizeForLog on metadata.

## Tech choices
- Node.js + TypeScript
- Queue: @repo/queue (BullMQ adapter)
- DB: @repo/db
- Observability: @repo/observability
- Storage: @repo/storage (Supabase adapter)

## Job payloads

### SCRAPE_TEST payload
{
  "dataSourceId": "<uuid>"
}

CorrelationContext:
- customerId (required)
- dataSourceId (required)
- runId (required) -> created by API and passed in

### SCRAPE_PROD payload (later)
{
  "dataSourceId": "<uuid>"
}

## SCRAPE_TEST pipeline (MVP)
Stages (each emits run_events info):
1. load_data_source
2. validate_config
3. fetch_base_url
4. capture_html_sample
5. parse_minimal (extract <title> or basic markers)
6. finalize_success

On error:
- stage: where it happened
- error_code: mapped from taxonomy (e.g. HTTP_403, TIMEOUT, DNS_FAIL, UNKNOWN)
- create repro bundles:
  - http_trace.json (urls + status + duration)
  - html_sample.html (max 150KB; strip scripts if possible)
- finalize_failed

## Storage keys
- repro/{customerId}/{jobType}/{jobId}/http_trace.json
- repro/{customerId}/{jobType}/{jobId}/html_sample.html

## Run event codes
- SYSTEM_JOB_START
- SYSTEM_JOB_SUCCESS
- SYSTEM_JOB_FAIL
- HTTP_XXX, TIMEOUT, DNS_FAIL, PARSE_FAIL, UNKNOWN_ERROR
- SUPPORT_CASE_CREATED (from API)

## Concurrency and safety
- For MVP, single worker process is ok.
- Later: apply concurrency caps per tenant/source (queue-level or worker-level).