# Monorepo & DB Migrations (Drizzle + SQL hybrid)

## Package manager
Use pnpm workspaces.

## Build system
Use Turborepo to run tasks across apps/packages.

## Database approach
- Use Drizzle for:
  - typed query building
  - schema typings
- Use raw SQL migrations for:
  - portability and explicit control
  - easy review and deployment

### Source of truth
Migrations are the source of truth for DB structure:
- /packages/db/migrations/*.sql

Drizzle schema mirrors the DB for types and queries:
- /packages/db/src/schema.ts

### Drift prevention (SQL is truth)
Whenever a migration **changes schema**, update `packages/db/src/schema.ts` in the **same PR**. Never merge a migration that touches tables/columns without updating the Drizzle schema so types and queries stay in sync.

## Migration workflow
1) Write a migration file:
   - /packages/db/migrations/000X_description.sql
2) Update the Drizzle mirror in the same PR:
   - /packages/db/src/schema.ts
3) Apply migrations to local/staging/prod:
   - `pnpm db:migrate`

## Rules
- Never use vendor-specific DB features (keep Postgres standard).
- Every tenant-owned table MUST include customer_id.
- **job_id is TEXT everywhere:** BullMQ (and most queue backends) use string/number job IDs, not UUIDs. Use TEXT for `scrape_runs.job_id`, `run_events.job_id`, and any future `meta_jobs.job_id`. Keep UUIDs for internal IDs (run_id, table PKs).
- Add indexes/uniques in migrations, not in app code.
- Migrations must be idempotent where reasonable (or use transaction + "IF NOT EXISTS").

## Environments
- Local: connect to Supabase local or a local Postgres container.
- Staging/Prod: connect via DATABASE_URL.

## Minimal tooling suggestion
- Use `node-pg-migrate` OR a tiny custom migrator script that:
  - reads migrations folder
  - records applied migrations in a `schema_migrations` table
  - applies pending migrations in order

We prefer a tiny custom migrator for portability and control.