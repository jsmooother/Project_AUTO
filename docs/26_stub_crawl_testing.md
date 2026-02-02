# Stub Crawl Pipeline Testing (Milestone 2)

This guide covers testing the website connection and stub crawl pipeline locally. All endpoints assume API on `http://localhost:3001` and require `x-customer-id` unless noted.

## Prerequisites

- Docker Postgres + Redis running (`docker compose up -d`)
- Migrations applied (`pnpm --filter @repo/db db:migrate`)
- API running (`pnpm --filter @repo/api dev`)
- Worker running (`pnpm --filter @repo/worker dev`)

You need a valid `customerId`. If you don't have one, sign up first:

```bash
curl -X POST http://localhost:3001/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test Org"}'
```

Response: `{"customerId":"...","userId":"...","email":"..."}` — save `customerId` for the following requests.

---

## 1. Connect a website (create/update inventory source)

**POST /inventory/source**

Creates or updates the single active inventory source for the customer.

```bash
export CID="your-customer-id-here"

curl -X POST http://localhost:3001/inventory/source \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CID" \
  -d '{"websiteUrl":"https://example.com/inventory"}'
```

**Expected response (201 or 200):**

```json
{
  "id": "uuid",
  "customerId": "uuid",
  "websiteUrl": "https://example.com/inventory",
  "status": "active",
  "lastCrawledAt": null,
  "createdAt": "2025-02-02T..."
}
```

Call again with a different URL to update the same source (200).

---

## 2. Trigger a crawl run (manual)

**POST /runs/crawl**

Enqueues a crawl run for the active source. The worker picks it up and processes it (stub: 10 deterministic items).

```bash
curl -X POST http://localhost:3001/runs/crawl \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CID"
```

**Expected response (201):**

```json
{
  "runId": "uuid",
  "jobId": "string"
}
```

If no active source exists:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No active inventory source. Connect a website first (POST /inventory/source)."
  }
}
```

**How to trigger the worker job:** The worker runs in a separate process and listens for CRAWL jobs on Redis. As long as the worker is running (`pnpm --filter @repo/worker dev`), it will process the job within seconds. No extra step required.

---

## 3. List crawl runs

**GET /runs?type=crawl**

Lists recent crawl runs for the customer.

```bash
curl "http://localhost:3001/runs?type=crawl&limit=10" \
  -H "x-customer-id: $CID"
```

**Expected response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "inventorySourceId": "uuid",
      "trigger": "manual",
      "status": "success",
      "startedAt": "2025-02-02T...",
      "finishedAt": "2025-02-02T...",
      "errorMessage": null,
      "createdAt": "2025-02-02T..."
    }
  ]
}
```

Status values: `queued`, `running`, `success`, `failed`.

**Query params:**
- `type=crawl` — required (only crawl runs are supported by this endpoint).
- `limit` — optional, default 50, max 100.

---

## 4. List inventory items

**GET /inventory/items**

Lists inventory items for the customer's active source.

```bash
curl "http://localhost:3001/inventory/items" \
  -H "x-customer-id: $CID"
```

**Expected response (after a successful crawl):**

```json
{
  "data": [
    {
      "id": "uuid",
      "customerId": "uuid",
      "inventorySourceId": "uuid",
      "externalId": "hex-string",
      "title": "Listing 001",
      "url": "https://example.com/inventory/listing/001",
      "price": 1000,
      "status": "active",
      "firstSeenAt": "2025-02-02T...",
      "lastSeenAt": "2025-02-02T..."
    }
  ],
  "source": {
    "id": "uuid",
    "websiteUrl": "https://example.com/inventory"
  }
}
```

If no source is connected, `data` is `[]` and `source` is `null`.

---

## End-to-end flow (copy-paste)

```bash
# Set your customer ID (from signup)
export CID="your-customer-id-here"

# 1. Connect website
curl -s -X POST http://localhost:3001/inventory/source \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CID" \
  -d '{"websiteUrl":"https://example.com/inventory"}'

# 2. Trigger crawl
curl -s -X POST http://localhost:3001/runs/crawl \
  -H "x-customer-id: $CID"

# 3. Wait a few seconds for worker to process, then check runs
sleep 3
curl -s "http://localhost:3001/runs?type=crawl&limit=5" -H "x-customer-id: $CID" | head -50

# 4. List inventory items (should show 10 stub items)
curl -s "http://localhost:3001/inventory/items" -H "x-customer-id: $CID" | head -80
```

---

## Troubleshooting

### "No active inventory source" when calling POST /runs/crawl

- Call **POST /inventory/source** first with a valid URL.
- Ensure the same `x-customer-id` is used for both requests.

### Run stays in `queued` or `running`

- Confirm the **worker** is running: `pnpm --filter @repo/worker dev`.
- Check **Redis** is up: `docker compose ps` and `redis-cli ping` (or use Redis from Docker).
- Check worker logs for errors (e.g. DB connection, missing tables).

### No items after crawl

- Ensure the run status is `success` (GET /runs?type=crawl).
- If status is `failed`, check `errorMessage` in the run and worker logs.
- Run **GET /inventory/items** with the same `x-customer-id` used for the crawl.

### 401 Unauthorized

- Every request (except signup and health) must include header: `x-customer-id: <uuid>`.
- Use a valid UUID from signup or from your database.

### Migration not applied

- Run: `pnpm --filter @repo/db db:migrate`
- Confirm migration `0017_inventory_sources_crawl_runs_items` is applied and tables `inventory_sources`, `crawl_runs`, `inventory_items` exist.
