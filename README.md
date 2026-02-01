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

## Local validation

Run `./scripts/validate-local.sh` to verify probe → profile → prod → incremental → removals. Requires Postgres, Redis, API, and worker. See docs/22_local_validation.md.
