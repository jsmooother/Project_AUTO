# Cursor Agent Master Prompt — Internet Broker MVP (Monorepo)

You are the lead engineer building a greenfield multi-tenant crawler + Meta sync platform.
No prior code exists. Implement according to /docs.

## Non-negotiable architecture rules
1) NEVER crawl inside an HTTP request. All crawls are async jobs.
2) Everything is multi-tenant: every row includes customer_id.
3) Storage MUST be accessed through an internal S3-like adapter (packages/storage).
4) Queue MUST be accessed through an internal adapter (packages/queue).
5) Workers MUST run in Docker containers (portable).
6) Observability is mandatory:
   - structured JSON logging
   - DB-backed run_events with correlation IDs
   - repro bundles on failure

## Monorepo layout
- apps/web: Next.js UI
- apps/api: HTTP API service
- apps/worker: queue consumers (scrape/meta/template)
- packages/*: shared libraries (db, queue, storage, observability, shared)

## Database (Drizzle + SQL migrations hybrid)
- Migrations are the source of truth:
  - /packages/db/migrations/*.sql
- Drizzle schema mirrors DB:
  - /packages/db/src/schema.ts
- Implement a simple migration runner:
  - creates schema_migrations table
  - applies pending SQL files in order
- No vendor-specific SQL; keep standard Postgres.

## MVP stack assumptions
- Supabase (Postgres/Auth/Storage)
- Vercel (web)
- Railway (api/worker)
- Redis (queue)

## Deliverables (implement in order)
1) Monorepo scaffolding:
   - pnpm workspace + turbo
   - TypeScript configs
   - packages/shared, packages/observability skeletons
2) Database package:
   - drizzle config + schema.ts
   - migrations folder with 0001_init.sql
   - migration runner script wired to `pnpm db:migrate`
3) Queue package:
   - adapter interface + Redis implementation
4) Storage package:
   - adapter interface + Supabase Storage implementation
5) Observability package:
   - logger (pino JSON)
   - run_events writer + sanitize helper + error taxonomy mapping
6) API app:
   - auth middleware (Supabase JWT)
   - CRUD: data_sources
   - trigger test run endpoint => enqueue job
   - endpoints to read run history + run events
   - support case creation endpoint
7) Worker app:
   - consumes SCRAPE_TEST and SCRAPE_PROD
   - emits run_events at each stage
   - stores repro bundles on failure
   - writes scrape_runs + upserts items + computes diff stats

## Output standards
- TypeScript strict
- zod validation for all inputs
- no secrets in DB or logs
- idempotent jobs
- minimal unit tests for diff logic and parser utilities

## Working style
- Propose exact file structure first.
- Implement in small, reviewable steps.
- After each deliverable, update docs/README with run commands.

Begin by scaffolding the monorepo and implementing the DB package + migration runner.