# Branch: review/codex-findings/tasks-3-5-reliability-observability-hardening

Summary of changes on this branch for reliability and observability improvements.

## Purpose

Three related tasks addressing:
1. **Task 3:** Handle missing correlation deterministically in queue package (prevent silent failures)
2. **Task 4:** Standardize lifecycle run_events for SOURCE_PROBE and SCRAPE_PROD (consistent observability)
3. **Task 5:** Add HTML size cap for parsing/extraction (prevent memory/stability issues)

## Task 3 — Handle missing correlation deterministically

### Problem
Queue invariant requires missing correlation to dead-letter the job (not throw) and emit a clear run_event. Current behavior threw early and could lead to silent failures.

### Solution
Made `createWorker` wrapper robust when correlation is missing or malformed.

### Files changed

| Path | Change |
|------|--------|
| `packages/queue/src/redis.ts` | Added `validateCorrelation()` pure function; updated worker processor to validate correlation, log structured error, call `onMissingCorrelation` callback, then `deadLetter` (no throw). Extracted `runWorkerProcessor()` for testability. |
| `packages/queue/src/index.ts` | Exported `validateCorrelation`, `runWorkerProcessor`, `ValidateCorrelationResult`, `BullJobLike`, `OnMissingCorrelationParams` for testing/usage. |
| `packages/queue/src/adapter.ts` | Added `onMissingCorrelation` to `RedisQueueOptions` type. |
| `apps/worker/src/lib/queue.ts` | Added `onMissingCorrelation` callback that emits run_event (`QUEUE_MISSING_CORRELATION`) when `runId` is UUID and `customerId` present. |
| `packages/db/migrations/0013_seed_queue_missing_correlation.sql` | New: seeds `QUEUE_MISSING_CORRELATION` event code (category: `queue`, severity: `error`). |
| `packages/queue/test/validateCorrelation.test.ts` | New: unit tests for `validateCorrelation` (missing correlation, missing customerId, valid) and `runWorkerProcessor` (deadLetter called, no throw). |
| `packages/queue/package.json` | Added test script and `tsx` devDependency. |

### Behavior changes
- **Invalid correlation** (missing or no `customerId`): No throw; structured log (`queue_validation_error`); `onMissingCorrelation` callback; `deadLetter(reason)` with `"MISSING_CORRELATION"` or `"MISSING_CUSTOMER_ID"`.
- **Valid correlation**: Unchanged; `processJob(queuedJob)` as before.

### Config / env
- None (uses existing `REDIS_URL`).

### Testing
- `pnpm --filter @repo/queue test` — 10 tests passing
- `pnpm --filter @repo/queue exec tsc --noEmit` — no type errors

---

## Task 4 — Standardize lifecycle run_events

### Problem
Checklist requires `SYSTEM_JOB_START` and `SYSTEM_JOB_SUCCESS` for meaningful jobs. Currently probe/prod emit custom events but lifecycle events are inconsistent.

### Solution
Ensure SOURCE_PROBE and SCRAPE_PROD always emit:
- `SYSTEM_JOB_START` at the beginning
- `SYSTEM_JOB_SUCCESS` at the end
- `SYSTEM_JOB_FAIL` on failure (standardized)

### Files changed

| Path | Change |
|------|--------|
| `apps/worker/src/jobs/sourceProbe.ts` | Added `SYSTEM_JOB_START` at beginning (after runId established); replaced `PROBE_DONE` with `SYSTEM_JOB_SUCCESS` before `ack()`; standardized `SYSTEM_JOB_FAIL` in both failure paths (data source not found, catch block). |
| `apps/worker/src/jobs/scrapeProd.ts` | Added `SYSTEM_JOB_START` at beginning (after runId established); replaced `SCRAPE_PROD_SUCCESS` with `SYSTEM_JOB_SUCCESS` before `ack()`; standardized `SYSTEM_JOB_FAIL` in all failure paths (data source not found, profile missing, catch block). |

### Event details

**SYSTEM_JOB_START:**
- `stage: "init"`
- `level: "info"`
- `meta: { jobType, jobId, dataSourceId, runId }`

**SYSTEM_JOB_SUCCESS:**
- `stage: "finalize"`
- `level: "info"`
- `meta:` 
  - Probe: `{ jobType, jobId, dataSourceId, runId, confidence, strategy, foundCount, notes, ...selectedMeta }`
  - Prod: `{ jobType, jobId, dataSourceId, runId, items_seen, items_new, items_removed }`

**SYSTEM_JOB_FAIL:**
- `stage: "finalize"`
- `level: "error"`
- `meta: { jobType, jobId, dataSourceId, runId, ...error }`

### Taxonomy
- Event codes already exist in `error_taxonomy` (migration `0007_seed_probe_and_scrape_prod_events.sql`). No migration needed.

### Testing
- `pnpm --filter @repo/worker exec tsc --noEmit` — no type errors

---

## Task 5 — Add HTML size cap for parsing/extraction

### Problem
Large HTML pages can cause heavy regex parsing, memory spikes, and event-loop stalls (may re-trigger lock issues). Need a cap on how much HTML is passed into extractors.

### Solution
Introduce safe, documented HTML truncation limit for parsing while keeping the system functional.

### Files changed

| Path | Change |
|------|--------|
| `apps/worker/src/lib/http.ts` | Added `truncateHtmlForParse()` helper (UTF-8 byte-aware truncation); updated `fetchWithTrace()` to truncate HTML after fetch (default 200 KB, override via `MAX_HTML_BYTES_FOR_PARSE` env); added truncation info to `HttpTrace` (`htmlTruncated`, `originalBytes`, `truncatedBytes`). |
| `apps/worker/src/lib/drivers/types.ts` | Added truncation fields to `FetchTrace` interface. |
| `apps/worker/src/lib/drivers/httpDriver.ts` | Passes truncation info through to `FetchResult.trace`. |
| `apps/worker/src/jobs/scrapeProd.ts` | Emits `HTML_TRUNCATED_FOR_PARSE` run_event (warn) when `res.trace.htmlTruncated` is true, before extraction. |
| `apps/worker/src/jobs/sourceProbe.ts` | Emits `HTML_TRUNCATED_FOR_PARSE` run_event in 2 places (strategy validation, detail sampling) when truncation occurs. |
| `packages/db/migrations/0014_seed_html_truncated_for_parse.sql` | New: seeds `HTML_TRUNCATED_FOR_PARSE` event code (category: `scrape`, severity: `warn`). |
| `apps/worker/test/truncateHtmlForParse.test.ts` | New: unit tests for truncation helper (5 tests: unchanged, truncates, empty, boundary, UTF-8). |
| `apps/worker/package.json` | Added test script. |

### Config / env
- **Worker:** `MAX_HTML_BYTES_FOR_PARSE` (default 200_000 bytes / 200 KB) — maximum HTML bytes passed to extractors.

### Behavior
- HTML fetched via `fetchWithTrace` is truncated to max bytes (UTF-8 aware)
- Full trace preserved; truncation info in `trace.htmlTruncated`, `trace.originalBytes`, `trace.truncatedBytes`
- When truncation occurs, `HTML_TRUNCATED_FOR_PARSE` run_event emitted (warn) with meta: `{ maxBytes, originalBytes, truncatedBytes, sourceItemId/url }`
- Repro bundles still work; they receive truncated HTML (consistent with cap)

### Testing
- `pnpm --filter @repo/worker test` — 5 tests passing
- `pnpm --filter @repo/worker exec tsc --noEmit` — no type errors

---

## How to test when you return

1. **Checkout and deps**
   - `git checkout review/codex-findings/tasks-3-5-reliability-observability-hardening`
   - `pnpm install && pnpm db:migrate`

2. **Task 3: Missing correlation**
   - Start worker: `pnpm --filter @repo/worker dev`
   - Run: `pnpm --filter @repo/queue test` (should pass)
   - Manually: Enqueue a job with missing/invalid correlation → should dead-letter (no throw), structured log, and if `runId`/`customerId` present, run_event `QUEUE_MISSING_CORRELATION` emitted.

3. **Task 4: Lifecycle events**
   - Start worker: `pnpm --filter @repo/worker dev`
   - Run probe: `POST /v1/data-sources/:id/probe` → check run_events for `SYSTEM_JOB_START` and `SYSTEM_JOB_SUCCESS`.
   - Run prod: `POST /v1/data-sources/:id/prod-run` → check run_events for `SYSTEM_JOB_START` and `SYSTEM_JOB_SUCCESS`.
   - On failure: verify `SYSTEM_JOB_FAIL` emitted exactly once.

4. **Task 5: HTML truncation**
   - Start worker: `pnpm --filter @repo/worker dev`
   - Run: `pnpm --filter @repo/worker test` (should pass)
   - Set `MAX_HTML_BYTES_FOR_PARSE=100000` (100 KB), run prod on a site with large pages → verify `HTML_TRUNCATED_FOR_PARSE` events emitted with truncation meta.

5. **Full local validation**
   - `./scripts/validate-local.sh` (should work with all changes)

## Migrations

Run these migrations:
- `0013_seed_queue_missing_correlation.sql` — adds `QUEUE_MISSING_CORRELATION` event code
- `0014_seed_html_truncated_for_parse.sql` — adds `HTML_TRUNCATED_FOR_PARSE` event code

## Commits

Latest commits on branch:
- Task 3: Handle missing correlation deterministically
- Task 4: Standardize lifecycle run_events for SOURCE_PROBE and SCRAPE_PROD
- Task 5: Add HTML size cap for parsing/extraction
