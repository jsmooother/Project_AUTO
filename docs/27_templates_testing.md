# Templates & Approval Workflow — Testing Guide

This document covers how to test the Milestone 3 templates and approval workflow via curl and expected database state.

## Prerequisites

- API running on `http://localhost:3001`
- Worker running (consumes PREVIEW jobs)
- Redis and Postgres (Docker)
- A valid `customer_id` from signup (e.g. `POST /signup`)

Set `CUSTOMER_ID` and `API_URL` for the examples:

```bash
export CUSTOMER_ID="<your-customer-uuid>"
export API_URL="http://localhost:3001"
```

## 1. List Available Templates

```bash
curl -s -X GET "$API_URL/templates" | jq
```

**Expected:** Array of 2–3 templates (e.g. `grid_4`, `single_hero`, `carousel_3`).

## 2. Get Current Config (Initially Null)

```bash
curl -s -X GET "$API_URL/templates/config" \
  -H "x-customer-id: $CUSTOMER_ID" | jq
```

**Expected:** `null` if no config yet.

## 3. Create or Update Template Config

```bash
curl -s -X POST "$API_URL/templates/config" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{
    "templateKey": "grid_4",
    "brandName": "My Brand",
    "primaryColor": "#0070f3",
    "logoUrl": ""
  }' | jq
```

**Expected:** Config object with `status: "draft"`.

**DB state:** `ad_template_configs` has one row for this customer, `status = 'draft'`.

## 4. Start a Preview Run

```bash
curl -s -X POST "$API_URL/templates/previews/run" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" | jq
```

**Expected:** `{ "runId": "...", "jobId": "..." }`.

**DB state:** `preview_runs` has a new row with `status = 'queued'`. Worker picks up the job and sets `status = 'running'`, then `status = 'success'` when done.

## 5. List Previews

```bash
curl -s -X GET "$API_URL/templates/previews" \
  -H "x-customer-id: $CUSTOMER_ID" | jq
```

**Expected:** `{ "data": [...], "config": { "id": "...", "status": "preview_ready" } }` after a successful run.

**DB state:** `ad_previews` has rows; `ad_template_configs.status` becomes `preview_ready` when the run succeeds.

## 6. Approve Template

```bash
curl -s -X POST "$API_URL/templates/approve" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{"notes": "Looks good"}' | jq
```

**Expected:** `{ "message": "Approved", "approval": {...}, "config": {...} }`.

**DB state:** `approvals` has a new row; `ad_template_configs.status = 'approved'`.

## 7. List Preview Runs

```bash
curl -s -X GET "$API_URL/runs?type=preview&limit=20" \
  -H "x-customer-id: $CUSTOMER_ID" | jq
```

**Expected:** Array of preview runs with `type: "preview"`, `status`, `startedAt`, `finishedAt`, etc.

## DB State Transitions

| Step                | `ad_template_configs.status` | `preview_runs.status` | `ad_previews`     |
|---------------------|------------------------------|------------------------|-------------------|
| After config save   | draft                        | —                      | —                 |
| After run enqueue   | draft                        | queued                 | —                 |
| While worker runs   | draft                        | running                | —                 |
| After run success   | preview_ready                | success                | rows created      |
| After approve       | approved                     | success                | unchanged         |

## Troubleshooting

### Missing inventory

If the customer has no inventory items, the worker still runs and uses placeholder sample data (e.g. "Sample Item 1", "Sample Item 2"). Previews will be generated.

### No config

`POST /templates/previews/run` returns 400 with message:  
`"No template config. Configure a template first (POST /templates/config)."`  
Create a config with `POST /templates/config` first.

### Job not picked up

- Ensure the worker is running: `pnpm --filter worker dev` (or equivalent).
- Check Redis: `redis-cli LLEN bull:preview:wait` (queue name may vary).
- Worker logs: look for `[PREVIEW] Starting preview run ...` and any errors.

### Cannot approve

`POST /templates/approve` requires:

1. A template config exists.
2. At least one successful preview run (`preview_runs.status = 'success'`).
3. At least one preview row in `ad_previews`.

If any of these are missing, you'll get 400 with a descriptive message.
