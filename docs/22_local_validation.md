# Local Validation Harness

This repo includes a **single-command** local validation harness that verifies:
probe → profile → prod run → incremental behavior → removals.

## Prerequisites

- Postgres running locally
- Redis running locally
- API + Worker running in separate terminals:
  - `pnpm --filter @repo/api dev`
  - `pnpm --filter @repo/worker dev`

Ensure `.env` has:

- `DATABASE_URL=postgres://...`
- `REDIS_URL=redis://localhost:6379` (optional; defaults)

## Pre-Task-6 release candidate validation

Before starting Task 6 (run_events run_id UUID migration), run:

```
./scripts/pre-task-6-validate.sh
```

Requires: `DATABASE_URL` in `.env`, `psql`, API and worker running. Optional: `INTEGRATION_BRANCH` (defaults to current branch).

This script:
1) Checks out integration branch, pulls, verifies clean status
2) Runs `tsc --noEmit` for queue, worker, api
3) Runs `probe-and-prod.sh`, `prod-run-twice.sh`, and (if present) `validate-local.sh`
4) If Riddermark probe times out, prints last 30 run_events for that probe run (root cause)
5) Prints lifecycle events for a successful Ivars prod run (SYSTEM_JOB_START / SYSTEM_JOB_SUCCESS)

Report: `scripts/out/pre-task-6-validation-report.txt`

If the script times out during probe-and-prod or validate-local, run steps 4 and 5 manually after the scripts finish. From the script output, note:
- **Riddermark probe run_id** (e.g. from line `Probe runId=84c34fb6-95eb-4ee4-8211-844e44eb48ad` or `probe run 84c34fb6-... status=timeout`).
- **Ivars prod run_id** from prod-run-twice.sh (first `run_id=` line, e.g. `run_id=6b2dcf42-37de-41e8-804d-7753792c62fe`).

Then run (replace `<RUN_ID>` and `<IVARS_PROD_RUN_ID>`):

```bash
# Last 30 run_events for Riddermark probe (root cause of timeout)
psql "$DATABASE_URL" -c "
  SELECT created_at, level, stage, event_code, message
  FROM run_events
  WHERE run_id = '<RUN_ID>'::text
  ORDER BY created_at DESC
  LIMIT 30;
"

# Lifecycle events on successful Ivars prod run
psql "$DATABASE_URL" -c "
  SELECT event_code, stage, level
  FROM run_events
  WHERE run_id = '<IVARS_PROD_RUN_ID>'::text
  ORDER BY created_at ASC;
"
```

## One-command validation

From repo root:

```
./scripts/validate-local.sh
```

To start API + worker automatically (best-effort):

```
./scripts/validate-local.sh --start
```

This will:
1) Validate Postgres/Redis connectivity
2) Run migrations
3) Probe + prod on all fixtures
4) Run prod twice (incremental check)
5) Attempt removals validation
6) Write a report and artifacts to `scripts/out/`

## Removal validation (SIMULATE_REMOVALS)

To validate removal tracking, run the worker with:

```
SIMULATE_REMOVALS=1 pnpm --filter @repo/worker dev
```

Then run:

```
./scripts/validate-local.sh --removals-only
```

## Artifacts

Artifacts are written to `scripts/out/`:

- `validate_report.json`: full structured report
- `validate_report.txt`: human-readable summary
- `profiles/<data_source_id>.json`: saved SiteProfile per source
- `runs/<run_id>.json`: run rows for probe/prod/incremental checks

## Common failures

- **API not reachable**: run `pnpm --filter @repo/api dev`
- **Worker not consuming jobs**: run `pnpm --filter @repo/worker dev`
- **0 discovered URLs**: add sitemap/seed URLs or enable headless discovery
- **Headless disabled**: set `HEADLESS_ENABLED=1` (still stubbed)
- **Older sites**: headless fallback is recommended; probe will record a note when selected.

## BullMQ lock issues

Symptoms:
- Worker logs show `could not renew lock` or `Missing lock for job ... moveToFinished`
- Runs stay `queued` or `running` and polling times out

Mitigation:
- Worker now uses safer BullMQ settings: `lockDuration=600000`, `stalledInterval=60000`, `maxStalledCount=1`
- Adjust concurrency via `WORKER_CONCURRENCY` (default 2)
- If lock is lost, a run_event is emitted with `QUEUE_LOCK_LOST` or `QUEUE_LOCK_RENEW_FAIL`

## Headless usage tracking

When headless is used, runs emit `HEADLESS_USED` with meta `{ provider, mode, reason }`.
This is intended to make support and debugging easier for older or JS-heavy dealer sites.
