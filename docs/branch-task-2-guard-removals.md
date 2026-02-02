# Branch: task-2-guard-removals-on-low-discovery

Summary of changes on this branch for when you return to test or merge.

## Purpose

1. **API:** Validate that `dataSourceId` on support case creation belongs to the requesting customer (ownership check).
2. **Worker:** Guard removals in SCRAPE_PROD when discovery returns very few items, so transient discovery failures don’t mass-inactivate items.

## Files changed

| Path | Change |
|------|--------|
| `apps/api/src/routes/supportCases.ts` | POST `/v1/support-cases`: require `dataSourceId` to exist and belong to `customerId`; 404 if not. Optional link to latest run for that data source. |
| `apps/api/test/supportCases.test.ts` | Tests for support case creation: validation, 404 when data source not found or wrong customer, success when owned. |
| `apps/worker/src/jobs/scrapeProd.ts` | After discovery, if discovered count &lt; threshold, skip removals step; emit `DISCOVERY_TOO_LOW_SKIP_REMOVALS` (warn), set `items_removed=0`. Exported `shouldRunRemovals(discoveredCount, threshold)`. |
| `apps/worker/test/shouldRunRemovals.test.ts` | Unit tests for `shouldRunRemovals`. |
| `packages/db/migrations/0012_seed_discovery_skip_removals.sql` | Seed `error_taxonomy` with `DISCOVERY_TOO_LOW_SKIP_REMOVALS` (warn). |
| `docs/21_incremental_sync.md` | Documented guardrail: threshold (default 5), env `MIN_DISCOVERY_FOR_REMOVALS`, run event and behavior. |

## Config / env

- **Worker:** `MIN_DISCOVERY_FOR_REMOVALS` (default 5) — minimum discovered items to run removals.
- **Removals testing:** `SIMULATE_REMOVALS=1` on worker to exercise removal path (see `docs/21_incremental_sync.md`).

## How to test when you return

1. **Checkout and deps**
   - `git checkout task-2-guard-removals-on-low-discovery`
   - `pnpm install && pnpm db:migrate`

2. **API: support case ownership**
   - Start API: `pnpm --filter @repo/api dev`
   - Run: `pnpm --filter @repo/api test` (includes `supportCases.test.ts`).
   - Manually: POST `/v1/support-cases` with `x-customer-id` and a `dataSourceId` that belongs to another customer → expect 404.

3. **Worker: skip-removals guardrail**
   - Start worker: `pnpm --filter @repo/worker dev`
   - Run: `pnpm --filter @repo/worker test` (includes `shouldRunRemovals.test.ts`).
   - Optional: set `MIN_DISCOVERY_FOR_REMOVALS=10`, run a prod run on a site that discovers &lt; 10 items; confirm `DISCOVERY_TOO_LOW_SKIP_REMOVALS` in run_events and `items_removed=0`.

4. **Full local validation**
   - `./scripts/validate-local.sh` (or `--removals-only` with `SIMULATE_REMOVALS=1` on worker).

## Commit

Latest commit on branch: `fix(api): validate dataSourceId ownership on support case creation` (also includes the worker guardrail, migration, tests, and doc updates).
