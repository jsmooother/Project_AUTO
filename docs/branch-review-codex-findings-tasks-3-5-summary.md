# Quick Summary: Tasks 3-5 Changes

## All Files Changed

### Task 3 — Missing Correlation Handling
- `packages/queue/src/redis.ts` — validation + deadLetter path
- `packages/queue/src/index.ts` — exports
- `packages/queue/src/adapter.ts` — type update
- `apps/worker/src/lib/queue.ts` — onMissingCorrelation callback
- `packages/db/migrations/0013_seed_queue_missing_correlation.sql` — new
- `packages/queue/test/validateCorrelation.test.ts` — new
- `packages/queue/package.json` — test script

### Task 4 — Lifecycle Events
- `apps/worker/src/jobs/sourceProbe.ts` — SYSTEM_JOB_START/SUCCESS/FAIL
- `apps/worker/src/jobs/scrapeProd.ts` — SYSTEM_JOB_START/SUCCESS/FAIL

### Task 5 — HTML Size Cap
- `apps/worker/src/lib/http.ts` — truncation logic
- `apps/worker/src/lib/drivers/types.ts` — FetchTrace update
- `apps/worker/src/lib/drivers/httpDriver.ts` — pass-through truncation info
- `apps/worker/src/jobs/scrapeProd.ts` — emit HTML_TRUNCATED_FOR_PARSE
- `apps/worker/src/jobs/sourceProbe.ts` — emit HTML_TRUNCATED_FOR_PARSE (2 places)
- `packages/db/migrations/0014_seed_html_truncated_for_parse.sql` — new
- `apps/worker/test/truncateHtmlForParse.test.ts` — new
- `apps/worker/package.json` — test script

## New Event Codes

1. `QUEUE_MISSING_CORRELATION` (migration 0013)
   - Category: `queue`
   - Severity: `error`
   - Emitted when job correlation is missing/invalid

2. `HTML_TRUNCATED_FOR_PARSE` (migration 0014)
   - Category: `scrape`
   - Severity: `warn`
   - Emitted when HTML is truncated before parsing

## New Environment Variables

- `MAX_HTML_BYTES_FOR_PARSE` (default: 200_000) — max HTML bytes for extractors

## Type-Check Commands

```bash
pnpm --filter @repo/queue exec tsc --noEmit
pnpm --filter @repo/worker exec tsc --noEmit
```

## Test Commands

```bash
pnpm --filter @repo/queue test
pnpm --filter @repo/worker test
```

## Migrations to Run

```bash
pnpm db:migrate
```

This will apply:
- `0013_seed_queue_missing_correlation.sql`
- `0014_seed_html_truncated_for_parse.sql`
