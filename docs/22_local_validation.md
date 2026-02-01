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

To validate removal tracking, run the worker with (headless enabled for Ivars/Jonassons fixtures):

```
HEADLESS_ENABLED=1 HEADLESS_PROVIDER=playwright-local SIMULATE_REMOVALS=1 pnpm --filter @repo/worker dev
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
- **Headless required (Ivars, Jonassons)**: set `HEADLESS_ENABLED=1 HEADLESS_PROVIDER=playwright-local`; run `pnpm --filter @repo/worker exec playwright install chromium` once
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

When headless is used, runs emit `HEADLESS_USED` with meta `{ provider, mode, reason }`. Probe notes record when headless_listing is selected. This aids support for older or JS-heavy dealer sites.
