# Docs

## Branch summaries

- **task-2-guard-removals-on-low-discovery:** `docs/branch-task-2-guard-removals.md` — API support-case ownership check; worker guardrail to skip removals when discovery is very low.
- **review/codex-findings/tasks-3-5-reliability-observability-hardening:** `docs/branch-review-codex-findings-tasks-3-5.md` — Queue missing correlation handling; standardized lifecycle events; HTML size cap for parsing.

## Run commands

- **Install dependencies (root):** `pnpm install`
- **Build all:** `pnpm build`
- **Run migrations:** `pnpm db:migrate` (runs in `packages/db`; requires `DATABASE_URL` in env or `.env`)
- **Dev (apps):** `pnpm dev` (turbo runs dev for web/api/worker)
- **API only:** `pnpm --filter @repo/api dev` (Fastify on PORT, default 3000)
- **Worker only:** `pnpm --filter @repo/worker dev` (consumes SCRAPE_TEST / SCRAPE_PROD)

## Env (packages)

- **@repo/db:** `DATABASE_URL`
- **@repo/queue:** `REDIS_URL` (optional; defaults to localhost:6379)
- **@repo/storage (Supabase):** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- **@repo/observability:** `LOG_LEVEL` (optional; default `info`)
