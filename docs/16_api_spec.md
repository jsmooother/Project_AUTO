# API Spec (apps/api)

## Goal
Provide minimal HTTP API to:
- manage data sources
- trigger test runs (enqueue SCRAPE_TEST)
- read runs and run events
- create support cases (auto-attach latest run context)

## Non-negotiables
- API MUST NOT crawl.
- API ONLY enqueues jobs and reads/writes DB rows.
- Every enqueue MUST include CorrelationContext { customerId, dataSourceId?, runId? }.

## Tech choices
- Node.js + TypeScript
- Framework: Fastify (preferred) or Express (ok)
- Validation: zod
- DB: @repo/db (Drizzle)
- Queue: @repo/queue (Redis BullMQ adapter)
- Observability: @repo/observability (emitRunEvent + sanitize)

## Auth / tenancy (MVP)
Phase 1 (MVP/dev): support a header-based customer context
- Required header: `x-customer-id: <uuid>`
- Optional header: `x-user-id: <uuid>`
This avoids blocking on Supabase Auth integration and keeps progress fast.
Add TODO to replace with Supabase JWT validation later.

If x-customer-id missing -> 401.

## Endpoints

### Health
GET /health
Returns { ok: true }

### Data Sources
POST /v1/data-sources
Body:
{
  "name": "Dealer A",
  "baseUrl": "https://example.com/cars",
  "strategy": "http" | "playwright" | "agentql" (optional, default http),
  "config": { ... } (optional),
  "scheduleEnabled": boolean (optional),
  "scheduleCron": string (optional),
  "maxItems": number (optional)
}
Creates row in data_sources for this customer.

GET /v1/data-sources
List data sources for customer.

GET /v1/data-sources/:id
Return data source if belongs to customer.

PATCH /v1/data-sources/:id
Update name/strategy/config/schedule fields.

### Test Run
POST /v1/data-sources/:id/test-run
Creates scrape_runs row (run_type=test, status=queued) and enqueues SCRAPE_TEST.
Returns:
{
  "runId": "...",
  "jobId": "..."
}

### Runs
GET /v1/scrape-runs?dataSourceId=<uuid>&limit=50
Lists runs for customer and optional dataSourceId.

GET /v1/scrape-runs/:runId
Returns one run (customer-owned).

GET /v1/scrape-runs/:runId/events?limit=200
Returns run_events for that run.

### Support cases
POST /v1/support-cases
Body:
{
  "subject": "...",
  "description": "...",
  "dataSourceId": "<uuid>" (optional)
}
Creates support_cases row.
If dataSourceId provided:
- auto-link scrape_run_id = latest run for that source (if any)
Also store a run_event: SUPPORT_CASE_CREATED (info).

GET /v1/support-cases?status=open&limit=50
List cases for customer.

GET /v1/support-cases/:id
Return case for customer.

## Error responses
Use consistent JSON:
{
  "error": {
    "code": "VALIDATION_ERROR|NOT_FOUND|UNAUTHORIZED|INTERNAL",
    "message": "..."
  }
}