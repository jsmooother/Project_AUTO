# Architecture Overview

## Components
1. Web App (Next.js)
2. API Service (HTTP API)
3. Worker Service(s)
   - Scrape Worker
   - Meta Worker
   - Template Worker (can be combined initially)
4. Queue (Redis)
5. Database (Postgres via Supabase)
6. Object Storage (Supabase Storage initially)
7. Observability
   - Structured logs to stdout
   - RunEvents persisted in DB
   - Repro bundles in storage

## Mandatory architectural rules
- No crawling inside HTTP request/response.
- API only enqueues jobs and reads status.
- Workers do the heavy work and update DB.
- Every job has correlation IDs:
  - customer_id, job_id, run_id (if applicable), data_source_id

## Portability boundaries
- Storage accessed via an internal S3-like interface: put/get/delete + signed URLs
- Queue accessed via an internal adapter: enqueue/dequeue + retries
- DB schema and queries remain standard Postgres

## Execution model
- Nightly: scheduler enqueues N scrape jobs (N = active data sources)
- Worker pool scales horizontally; concurrency caps per tenant and per data source
- Each scrape run generates:
  - scrape_runs row
  - run_events (timeline)
  - repro_bundles on failure
  - items upserted + diff stats