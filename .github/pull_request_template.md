## Summary
What does this PR change?

## Why
What problem does it solve / what goal does it advance?

## Scope
- [ ] API changes
- [ ] Worker changes
- [ ] DB migrations/schema changes
- [ ] Queue changes
- [ ] Scripts changes
- [ ] Docs changes
- [ ] UI changes (apps/web)

## Checklist alignment (docs/99_code_review_checklist.md)
Confirm any applicable items:
- [ ] All API routes enforce `x-customer-id` and scope DB queries by `customer_id`
- [ ] No tenant data read/write occurs without customer scoping
- [ ] All queued jobs include correlation (customerId, dataSourceId, runId UUID)
- [ ] JobId is TEXT; runId is UUID; probe creates scrape_runs row (run_type='probe')
- [ ] run_events emitted for major stages and failures
- [ ] error_taxonomy includes any new event codes (with correct severity)
- [ ] No secrets in logs/events (sanitizeForLog used)
- [ ] SQL migrations are idempotent and mirrored in Drizzle schema
- [ ] Incremental sync (seen/new/removed) logic preserved and counters coherent
- [ ] Scripts remain macOS compatible and print useful debug output on failures

## DB migrations
- [ ] New migration(s) added (idempotent)
- [ ] Drizzle schema updated to match
- [ ] Notes about safety assumptions / casts included in migration header comments

List migration files (if any):
- `packages/db/migrations/____.sql`

## Test plan (required)
List the exact commands you ran and the outcome:

- [ ] `pnpm --filter @repo/db db:migrate`
- [ ] `pnpm --filter @repo/api dev`
- [ ] `pnpm --filter @repo/worker dev`
- [ ] `./scripts/validate-local.sh`
- [ ] `./scripts/probe-and-prod.sh`
- [ ] `./scripts/prod-run-twice.sh`

Notes / outputs (paste key lines, links to scripts/out artifacts if relevant):

## Screenshots (if UI changes)
Attach screenshots or a short GIF.

## Risks / Rollback
What could break? How do we rollback?
- Migration rollback notes (if needed):
- Feature flags / env toggles: