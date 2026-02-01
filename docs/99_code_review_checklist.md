# Code Review Checklist (Project Auto)

This checklist defines the invariants and quality gates for reviewing changes in this repo. It is intended for humans and automated reviewers (e.g., Codex).

---

## 0) Repo quick map

- **apps/api**: Fastify API (multi-tenant via `x-customer-id`)
- **apps/worker**: BullMQ workers for `SCRAPE_TEST`, `SOURCE_PROBE`, `SCRAPE_PROD`
- **packages/db**: Postgres schema + migrations + Drizzle schema
- **packages/queue**: BullMQ adapter + correlation envelope
- **packages/observability**: run_events writer + error_taxonomy
- **packages/storage**: storage adapter (Supabase Storage now; S3-like interface)
- **scripts/**: local validation + batch runners

---

## 1) Multi-tenant & auth invariants (MUST)

### 1.1 Customer scoping everywhere
- Every API route MUST require `x-customer-id` (UUID) and use it to scope DB queries.
- Every DB query that reads/writes tenant data MUST include:
  - `where customer_id = request.customer.customerId`
- Never accept `customer_id` from the request body.

### 1.2 Access boundaries
- Data sources, runs, items, support cases MUST be customer-scoped.
- A request for a resource by ID MUST also validate it belongs to the customer:
  - e.g., `GET /v1/data-sources/:id` must `WHERE id=:id AND customer_id=:customerId`.
- No cross-customer joins without scoping.

### 1.3 Minimal identity model for now
- `x-user-id` is optional and used only for audit metadata (if at all).
- Do not build authorization roles yet unless required, but do not create endpoints that allow listing all customers.

---

## 2) Queue/job invariants (MUST)

### 2.1 Correlation is mandatory
All jobs MUST carry a correlation envelope:
- `customerId` (required)
- `dataSourceId` (required for site jobs)
- `runId` (required for probe/prod/test) — must be a UUID (scrape_runs.id)

If correlation is missing:
- Worker MUST `deadLetter()` with a clear reason
- Emit a run_event with `event_code=VALIDATION_ERROR` or equivalent

### 2.2 Job IDs vs run IDs
- `job_id` is always **TEXT** in DB.
- `run_id` on `run_events` is a UUID that corresponds to `scrape_runs.id`.
- Probe runs MUST create a `scrape_runs` row with `run_type='probe'` and use that UUID as runId in events.

### 2.3 BullMQ lock/stall robustness
Workers MUST set safe defaults (unless explicitly overridden):
- `lockDuration` sufficiently large (minutes) for scraping work
- `concurrency` set to a low default for stability
- lock lost / stall events must be observable (run_event codes exist)

If BullMQ lock is lost:
- Do not leave runs hanging
- Update scrape_runs status to failed, emit `QUEUE_LOCK_LOST` (or similar)

---

## 3) Observability invariants (MUST)

### 3.1 run_events on every meaningful stage
Each job should emit stage events:
- `SYSTEM_JOB_START`
- key internal stages (discovery/diff/details/removals)
- `SYSTEM_JOB_SUCCESS` or `SYSTEM_JOB_FAIL`

### 3.2 Taxonomy mapping
- All important event codes should exist in `error_taxonomy` migrations.
- Severity should be consistent:
  - info: normal progression and counts
  - warn: degraded/partial but recoverable
  - error: failure that needs attention

### 3.3 No secrets in logs/events
- Use `sanitizeForLog()` for all meta payloads.
- Never log auth tokens, API keys, cookies, session IDs, Authorization headers.

---

## 4) Data model & migrations (MUST)

### 4.1 SQL migrations are source of truth
- All schema changes must be done via `packages/db/migrations/*.sql`.
- Migrations MUST be idempotent:
  - `ADD COLUMN IF NOT EXISTS`
  - `CREATE TABLE IF NOT EXISTS`
  - `CREATE INDEX IF NOT EXISTS`
- Provide safe casts when changing types (and document assumptions).

### 4.2 Drizzle schema must mirror migrations
- Every column/table/index critical to application logic must be mirrored in `packages/db/src/schema.ts`.
- Any drift is a bug.

### 4.3 Index coverage for hot paths
Ensure indexes exist for:
- `items(customer_id, data_source_id, is_active)`
- `items(customer_id, data_source_id, last_seen_run_id)`
- `items(customer_id, data_source_id, detail_fetched_at)`
- `run_events(run_id, created_at)`
- any unique constraints used for upserts:
  - `items(customer_id, data_source_id, source_item_id)`

---

## 5) Self-service SiteProfile invariants (MUST)

### 5.1 Profile stored per data source
- Stored in `data_sources.config_json`.
- Must include:
  - profileVersion
  - discovery.strategy
  - discovery.seedUrls (or baseUrl)
  - discovery.detailUrlPatterns
  - discovery.idFromUrl rule
  - fetch.driver (http/headless)
  - extract.vertical (vehicle/generic)
  - limits (concurrency/maxNewPerRun/etc.)

### 5.2 Probe is fail-open (controlled)
- If discovery finds some URLs (>=3), persist a low-confidence profile with notes.
- Do not block onboarding unnecessarily.
- Notes must be actionable (add seed URL, enable headless, provide feed).

### 5.3 No site-specific code paths
- No “riddermark.ts”, “ivars.ts”, etc. in production logic.
- Fixture sites are only used in scripts/docs.
- The system should adapt by profile + strategies.

---

## 6) Incremental sync invariants (MUST)

### 6.1 Discovery → diff → details → removals
Every SCRAPE_PROD run must:
1) Discover current set of detail URLs / IDs
2) Upsert items (seen markers):
   - `last_seen_at=now()`
   - `last_seen_run_id=runId`
   - `is_active=true`
   - `removed_at=null`
3) Determine new items:
   - `last_seen_run_id == runId` AND `detail_fetched_at IS NULL`
4) Fetch details ONLY for new items (bounded by maxNewPerRun)
5) Mark removed items:
   - `is_active=true AND last_seen_run_id != runId` → set inactive + removed_at

### 6.2 Counters
`scrape_runs` counters must be coherent:
- `items_seen` = discovered count (unique IDs)
- `items_new` = attempted detail fetch count (bounded)
- `items_removed` = count marked removed in this run

Log meta counts:
- totalNew, attemptedNew, skippedCount

### 6.3 URL / ID stability
- Normalize URLs consistently (strip fragments, normalize trailing slash).
- `source_item_id` extraction must be stable:
  - last path segment or regex
  - fallback hash if extraction fails
- Dedup primarily by source_item_id.

---

## 7) Scraper robustness (SHOULD)

### 7.1 Cost control defaults
For small dealers (100–500 items):
- maxNewPerRun default ~50 (configurable)
- concurrency default low (2–6)
- optional fetch delay support

### 7.2 Extraction quality expectations
For vehicle vertical, try to populate at least:
- title
- price (when present)
- image_urls_json (>=1 when possible)
- attributes_json (basic key/value extraction)

Partial extraction should be allowed but observable:
- warn event codes for missing critical fields.

### 7.3 Avoid event-loop blocking
- Large HTML parsing and hashing should not block indefinitely.
- Cap HTML bytes used for parsing/hashing (e.g., 150KB sample or similar).

---

## 8) Scripts & local validation (MUST)

### 8.1 One-command validation
`./scripts/validate-local.sh` should:
- verify prerequisites
- run migrations
- run probe + prod on fixtures
- run prod twice to validate incremental behavior
- write artifacts to scripts/out/

### 8.2 Useful failure output
On timeout/failure, scripts must print:
- run status
- last N run_events (or endpoint to fetch them)
- hints for missing worker / redis / db connectivity

### 8.3 macOS compatibility
Avoid GNU-only sed/awk assumptions.
Prefer POSIX-compatible operations or explicitly document dependencies.

---

## 9) PR hygiene (MUST)

- No secrets committed. `.env` and dumps/logs are ignored.
- New migrations include a short header comment describing intent and safety assumptions.
- Update docs if behavior changes (especially onboarding/probe or incremental sync).
- Include a minimal test plan in PR description:
  - which scripts you ran
  - which fixtures validated

---