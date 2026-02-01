# Worker Spec (apps/worker)

## Goal
Consume jobs and execute pipelines.
Job types: SCRAPE_TEST, SCRAPE_PROD, SOURCE_PROBE.

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

### SCRAPE_PROD payload
{
  "dataSourceId": "<uuid>"
}

CorrelationContext: customerId (required), dataSourceId (required), runId (required).

### SOURCE_PROBE payload
{
  "dataSourceId": "<uuid>"
}

CorrelationContext: customerId, dataSourceId, runId (required).

## SCRAPE_PROD pipeline

Stages (each emits run_events):
1. load_data_source — validate profile in config_json
2. discovery — DISCOVERY_START, DISCOVERY_DONE; discover URLs via profile strategy
3. diff — DIFF_DONE; upsert seen markers (last_seen_run_id, is_active=true)
4. details — DETAILS_START, DETAILS_DONE; fetch detail only for new items
5. removals — REMOVALS_DONE; mark items that disappeared (is_active=false, removed_at)
6. finalize — SCRAPE_PROD_SUCCESS / SCRAPE_PROD_FAIL

When profile uses headless_listing or fetch.driver=headless: emit HEADLESS_USED (meta: provider, mode, reason).

## SOURCE_PROBE pipeline

Stages: PROBE_START, PROBE_STRATEGY_SELECTED, PROBE_DONE. Try discovery strategies (sitemap → html_links → endpoint_sniff → headless_listing), sample detail pages, persist SiteProfile to data_sources.config_json. When headless_listing selected: emit HEADLESS_USED and add probe note.

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

SCRAPE_TEST: SYSTEM_JOB_START, SYSTEM_JOB_SUCCESS, SYSTEM_JOB_FAIL, HTTP_XXX, TIMEOUT, DNS_FAIL, PARSE_FAIL, UNKNOWN_ERROR.

SCRAPE_PROD: DISCOVERY_START, DISCOVERY_DONE, DIFF_DONE, DETAILS_START, DETAILS_DONE, REMOVALS_DONE, SCRAPE_PROD_SUCCESS, SCRAPE_PROD_FAIL, ITEM_DETAIL_OK, ITEM_DETAIL_FAIL.

SOURCE_PROBE: PROBE_START, PROBE_STRATEGY_SELECTED, PROBE_DONE, HEADLESS_USED (when headless_listing selected).

Queue: QUEUE_LOCK_RENEW_FAIL, QUEUE_LOCK_LOST (when BullMQ lock issues occur).

Support: SUPPORT_CASE_CREATED (from API).

## Env vars

- **HEADLESS_ENABLED**: set to `1` or `true` to enable headless driver; required for headless_listing discovery.
- **HEADLESS_PROVIDER**: `playwright-local` (default), `browserless`, or `browserbase`; only playwright-local implemented.
- **WORKER_CONCURRENCY**: BullMQ worker concurrency (default 2).
- **SIMULATE_REMOVALS**: set to `1` to drop 10% of discovered URLs before upsert for removal validation.

## Concurrency and safety
- For MVP, single worker process is ok.
- Later: apply concurrency caps per tenant/source (queue-level or worker-level).