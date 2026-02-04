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

1. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for local Docker setup)
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Run migrations:**
   ```bash
   pnpm db:migrate
   ```

4. **Start all dev servers:**
   ```bash
   pnpm dev:up
   ```
   This starts Docker services (Postgres + Redis) and all dev servers:
   - **API**: http://localhost:3001
   - **Web**: http://localhost:3000
   - **Worker**: running in background

   **To stop everything:**
   ```bash
   pnpm dev:down
   ```

   **If you see 404/500 errors or weird behavior:**
   ```bash
   pnpm dev:reset
   ```
   This stops all services, clears Next.js cache, and restarts everything fresh.

### Troubleshooting

**If login (or any page) shows 404 for `_next/static/chunks/...`:**  
Next.js cache may be stale. Run `pnpm dev:reset` to clear cache and restart.

**If web build fails with `404` for `@next/swc-darwin-arm64`:**  
Next.js and SWC versions must match. See `docs/35_next_swc_build.md`. Run `pnpm dev:reset` to clear cache.

**If you see port conflicts (EADDRINUSE):**
- Run `pnpm dev:down` to stop all processes
- Check what's using the port: `lsof -i:3000` or `lsof -i:3001`
- Run `pnpm dev:reset` for a clean restart

**Check service health:**
- API health: `curl http://localhost:3001/health` (returns `{ok: true, db: true, redis: true}`)
- Check startup logs for connection info (DATABASE_URL, REDIS_URL, NEXT_PUBLIC_API_URL are logged on startup)

### Docker services

- **Postgres**: `localhost:5432` (user: `postgres`, password: `postgres`, db: `project_auto`)
- **Redis**: `localhost:6379`

**Note:** Docker services are automatically managed by `pnpm dev:up` and `pnpm dev:down`.

**Manual Docker commands:**
- Start: `docker compose up -d`
- Stop: `docker compose down`
- View logs: `docker compose logs -f`
- Stop and remove volumes: `docker compose down -v` (⚠️ deletes data)

### Environment variables

Copy `.env.example` to `.env` and adjust as needed. The example includes defaults for local Docker setup.

**Required for local dev:**
- `DATABASE_URL` - Postgres connection string (defaults to `postgres://postgres:postgres@localhost:5432/project_auto` for Docker)
- `REDIS_URL` - Redis connection string (defaults to `redis://localhost:6379` for Docker)
- `COOKIE_SECRET` - Session cookie signing (dev default in example)
- `NEXT_PUBLIC_API_URL` - API base URL for web app (default `http://localhost:3001`)

**Port configuration:**
- API always runs on port **3001** (configurable via `PORT` env var, defaults to 3001)
- Web always runs on port **3000** (hardcoded in Next.js config)
- Worker uses the same env vars as API and logs clearly on startup

**Optional:**
- `ALLOW_INSECURE_ADMIN=true` - In dev, skip `x-admin-key` for Admin API
- `NEXT_PUBLIC_SHOW_ADMIN_LINK=true` - Show Admin link in user dashboard
- `ADMIN_API_KEY` - Required in production for Admin API
- `CORS_ORIGIN` - Comma-separated list of allowed origins for CORS (e.g., `http://localhost:3000,https://app.projectauto.com`). In development, if not set, all origins are allowed. In production, if not set, CORS is disabled for security.

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
