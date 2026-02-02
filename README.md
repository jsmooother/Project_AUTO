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

Required for local dev:
- `DATABASE_URL` - Postgres connection string
- `REDIS_URL` - Redis connection string

Optional (for Supabase integration):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`

## Local validation

Run `./scripts/validate-local.sh` to verify probe → profile → prod → incremental → removals. Requires Postgres, Redis, API, and worker. See docs/22_local_validation.md.
