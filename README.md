# Project AUTO

This repository contains the implementation of an automated social ad enabler.
- Crawl customer inventory sites nightly
- Normalize inventory items into catalogs
- Sync catalogs to Meta Advantage+ and generate campaigns/ads
- Provide run history, reporting, templates, and support diagnostics

## Core principles
1. Job-based architecture: all crawling and Meta sync are async jobs.
2. Multi-tenant from day one (customer isolation).
3. Portable infrastructure: avoid vendor lock-in; DB = Postgres, storage = S3-style abstraction, queue = adapter.
4. Observability first: structured logs, correlation IDs, run events, repro bundles.

## MVP stack (initial)
- Web UI: Vercel (Next.js)
- DB/Auth/Storage: Supabase (Postgres, Auth, Storage)
- Workers/API: Railway (Docker containers)
- Queue: Redis (or managed Redis)

## Conventions
- **Packages:** All workspace packages use the `@repo/*` scope (e.g. `@repo/db`, `@repo/shared`). Keep this consistent in docs, scripts, and imports.

## Getting started
See:
- docs/02_architecture_overview.md
- docs/12_dev_workflow_and_standards.md
- docs/13_backlog_mvp.md

## Local development setup

### Prerequisites
- Docker Desktop (for Postgres + Redis)
- Node.js 20+ and pnpm 9+

### Quick start

1. **Start database services:**
   ```bash
   docker compose up -d
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for local Docker setup)
   ```

3. **Install dependencies:**
   ```bash
   pnpm install
   ```

4. **Run migrations:**
   ```bash
   pnpm --filter @repo/db db:migrate
   ```

5. **Start dev servers** (run each in its own terminal):
   ```bash
   pnpm --filter @repo/api dev
   pnpm --filter @repo/worker dev
   pnpm --filter @repo/web dev
   ```
   API runs on http://localhost:3001, web on http://localhost:3000.

   **If login (or any page) shows 404 for `_next/static/chunks/...`:**  
   The wrong process may be on port 3000, or the Next.js cache is stale. Fix:
   - Stop anything using port 3000.
   - From repo root: `pnpm --filter @repo/web dev:clean` (clears `.next` and starts web on 3000).  
   - Or: `cd apps/web && rm -rf .next && pnpm dev`, then open http://localhost:3000/login.

   **If you see 500 Internal Server Error (or EADDRINUSE on restart):**
   - Run: `./scripts/restart-dev.sh` to kill processes on 3000/3001/3002 and clear `.next` cache.
   - Then start dev servers again (API, worker, web).
   - If API runs on a different port (e.g. 3002), set `NEXT_PUBLIC_API_URL=http://localhost:3002` in `.env` so the web app can reach it.

### Docker services

- **Postgres**: `localhost:5432` (user: `postgres`, password: `postgres`, db: `project_auto`)
- **Redis**: `localhost:6379`

**Commands:**
- Start: `docker compose up -d`
- Stop: `docker compose down`
- View logs: `docker compose logs -f`
- Stop and remove volumes: `docker compose down -v` (⚠️ deletes data)

### Environment variables

Copy `.env.example` to `.env` and adjust as needed. The example includes defaults for local Docker setup.

**Required for local dev:**
- `DATABASE_URL` - Postgres connection string
- `REDIS_URL` - Redis connection string
- `COOKIE_SECRET` - Session cookie signing (dev default in example)
- `NEXT_PUBLIC_API_URL` - API base URL for web app (default `http://localhost:3001`)

**Optional:**
- `ALLOW_INSECURE_ADMIN=true` - In dev, skip `x-admin-key` for Admin API
- `NEXT_PUBLIC_SHOW_ADMIN_LINK=true` - Show Admin link in user dashboard
- `ADMIN_API_KEY` - Required in production for Admin API

## Auth & Web App

- **Sign up / Log in**: Session-based auth (email + password). Cookies + `credentials: "include"` for API calls.
- **Protected routes**: Dashboard, Inventory, Automation, Templates, etc. use `(app)` layout with auth guard. Unauthenticated → redirect to `/login`.
- **Admin**: Admin dashboard at `/admin/*` (customers, runs, inventory-sources). Requires `x-admin-key` in production; see `ALLOW_INSECURE_ADMIN` for dev. Admin link in user dashboard only when `NEXT_PUBLIC_SHOW_ADMIN_LINK=true`.
- **Dev diagnostics**: Dashboard shows customerId, x-customer-id, source URL, template config when `NODE_ENV=development`.

## Local validation

Run `./scripts/validate-local.sh` to verify probe → profile → prod → incremental → removals. Requires Postgres, Redis, API, and worker. See docs/22_local_validation.md.

## Key documentation

| Topic | Doc |
|-------|-----|
| Architecture | docs/02_architecture_overview.md |
| Dev workflow | docs/12_dev_workflow_and_standards.md |
| Auth & sessions | docs/31_phase1_auth_test_guide.md |
| UI phases 2–4 | docs/32_phases_2_4_ui_checklist.md |
| Admin testing | docs/29_admin_testing.md |
| Templates testing | docs/27_templates_testing.md |
| Docker setup | docs/23_local_docker_setup.md |
| API spec | docs/16_api_spec.md |
