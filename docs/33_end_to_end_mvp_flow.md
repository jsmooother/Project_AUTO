# End-to-end MVP flow (no curl)

This doc describes the full browser flow for the MVP loop: **Website → Crawl → Templates → Previews → Approve**, and how to troubleshoot using Dev diagnostics.

## Prerequisites

- API running (e.g. `pnpm --filter @repo/api dev` on port 3001)
- Web app running (e.g. `pnpm --filter @repo/web dev`)
- Worker running (e.g. `pnpm --filter @repo/worker dev`) so crawl and preview jobs are processed
- Redis (and DB) available per [18_local_dev_setup.md](18_local_dev_setup.md) / [23_local_docker_setup.md](23_local_docker_setup.md)

## Browser steps (user flow)

### 1) Sign up / log in

- Go to **Sign up** and create an account (email, name, password).
- Or go to **Login** and sign in.
- After auth you land on **Dashboard**. Session is stored in a cookie; the app uses `GET /auth/me` to get `customerId` and passes it as `x-customer-id` on all API calls.

### 2) Connect website

- Go to **Connect website** (or use the link from Dashboard).
- Enter a valid URL (e.g. `https://example.com/inventory`) and click **Connect**.
- **Expected:** Redirect to Dashboard. **POST /inventory/source** is called with `{ websiteUrl }`; the active inventory source is created/updated.
- **Dev diagnostics (Dashboard):** `sourceUrl` should show the URL you entered. If not, refresh the page or re-open Dashboard.

### 3) Run crawl

- On **Dashboard**, in the “Website & Crawl” section, click **Run crawl**.
- **Expected:** You are redirected to **Automation / Runs** and a new crawl run appears with status `queued` then `running` then `success` (once the worker processes it). Inventory items appear on the **Inventory** page.
- **If you see an error:** The UI shows the API message and a **hint** (e.g. “Go to Connect Website and add your inventory URL”). Check Dev diagnostics: `x-customer-id` should be “set” and `sourceUrl` should be set before running crawl.

### 4) Select template and save config

- Go to **Templates**.
- Click a template (e.g. “Grid 4”) to select it, fill in Brand name / Primary color / Logo URL if desired, then click **Save config**.
- **Expected:** “Current config” shows your template and status **draft**. **POST /templates/config** is called with `{ templateKey, brandName?, primaryColor?, logoUrl? }`.

### 5) Generate previews

- On **Templates**, click **Generate previews**.
- **Expected:** You are taken to **Runs** (preview type) and a new preview run appears. When the worker finishes, previews appear on the Templates page (iframes with HTML). **POST /templates/previews/run** is called with no body; the API uses the customer’s active template config.
- **If you see an error:** Message + hint are shown (e.g. “Choose a template and save config on the Templates page”). Ensure you saved config in step 4.

### 6) Approve template

- After previews are generated, the template status becomes **preview_ready**.
- Click **Approve template**.
- **Expected:** Status becomes **approved**. Dashboard “Template Status” shows **approved**. **POST /templates/approve** is called (body may be `{}` or `{ notes?: "..." }`).

## Expected statuses at each step

| Step              | Website (source)     | Template config      | Crawl run     | Preview run   |
|-------------------|----------------------|----------------------|---------------|---------------|
| After connect     | Connected (URL set)   | —                    | —             | —             |
| After run crawl   | Connected            | —                    | success       | —             |
| After save config | Connected            | draft                | success       | —             |
| After gen previews| Connected            | preview_ready        | success       | success       |
| After approve     | Connected            | approved             | success       | success       |

## Troubleshooting with Dev diagnostics

On **Dashboard**, in development, a **Dev diagnostics** block shows:

- **customerId** – from `/auth/me` (should be a UUID).
- **x-customer-id** – “set” if the app is sending the header on API requests (required for all non-auth endpoints).
- **sourceUrl** – from `GET /inventory/items` (present after Connect website).
- **templateConfigId** – from `GET /templates/config` (present after Save config).
- **templateStatus** – draft | preview_ready | approved.

If **Run crawl** or **Generate previews** returns 400:

- If **x-customer-id** is “not set”: the API will actually return 401. Fix: ensure you are logged in and that the app passes `customerId` on all `apiGet` / `apiPost` calls (the (app) layout and pages use `auth.user.customerId`).
- If **x-customer-id** is “set” but **sourceUrl** is “(none)” and you clicked Run crawl: connect a website first.
- If **x-customer-id** is “set” but **templateConfigId** is “(none)” and you clicked Generate previews: save a template config first.

API 400 responses now return structured JSON:

- **Validation:** `{ error: "VALIDATION_ERROR", message: "...", issues?: [...] }`
- **Missing prerequisite:** `{ error: "MISSING_PREREQUISITE", message: "...", hint: "..." }`

The web app shows **message** and **hint** in the error banner so you can fix the step without reading the network tab.

## Demo data and reset (dev only)

To avoid repeating the full flow when iterating on UI or worker logic:

- **Create demo customer:** In **Admin → Customers**, use the **Create demo customer** button (shown only when `NODE_ENV=development`). This calls **POST /admin/demo/seed** and creates a customer with:
  - Onboarding complete
  - A dummy inventory source
  - 10 stub inventory items
  - Template config (grid_4) + one HTML preview + approved
  - Returns `email` and `password` (fixed `demo-password`) so you can log in as that user.
- **Reset customer data:** On **Admin → Customers → [customer]** (Overview tab), use **Reset customer data** (dev only). This calls **POST /admin/customers/:customerId/reset** and deletes runs, previews, items, and approvals for that customer, and sets template config back to draft. Customer, user, website source, and template config remain so you can re-run crawl/preview without re-configuring.

Both actions require **x-admin-key** and are only enabled when **NODE_ENV=development** (API returns 403 otherwise).

## Admin quick actions (dev ops)

From **Admin → Customers → [customer]**, you can:

- **Trigger crawl** – calls **POST /admin/customers/:customerId/runs/crawl**. Requires an active inventory source for that customer. Shows a toast with run ID and a link to the run detail page.
- **Generate previews** – calls **POST /admin/customers/:customerId/runs/preview**. Requires a template config for that customer. Same toast/link behavior.

Admin endpoints require **x-admin-key** (see [29_admin_testing.md](29_admin_testing.md)). Errors return the same structured shape (e.g. `MISSING_PREREQUISITE` with `message` and `hint`).

## Test harness (happy path)

A script runs the full loop against the API (no browser):

```bash
./scripts/happy-path-api.sh
# Or: API_URL=http://localhost:3001 ./scripts/happy-path-api.sh
```

**Requires:** API and worker running, Redis + DB (e.g. `docker compose up -d`). The script: signs up a user → connects a website → runs crawl → saves template config → runs preview → waits 15s → approves. If the worker needs more time, run the approve step again manually (same cookies) or increase the sleep in the script.

**Integration tests (API test suite):** If tests require `DATABASE_URL`, copy `.env.test.example` to `.env.test` and point it at your Docker DB. Run tests with your env loader (e.g. `dotenv -e .env.test -- pnpm --filter @repo/api test`).

## Curl equivalents (debugging only)

Optional; use when you need to drive the API from the command line.

```bash
# Set base URL and (for admin) admin key
API_URL="${API_URL:-http://localhost:3001}"
ADMIN_KEY="${ADMIN_API_KEY}"   # optional for admin calls

# 1) Signup (then use the returned customerId as x-customer-id for next calls)
curl -s -X POST "$API_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"password123"}' \
  -c cookies.txt -b cookies.txt

# 2) Connect website (replace CUSTOMER_ID)
curl -s -X POST "$API_URL/inventory/source" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: CUSTOMER_ID" \
  -d '{"websiteUrl":"https://example.com/inventory"}' \
  -b cookies.txt

# 3) Run crawl
curl -s -X POST "$API_URL/runs/crawl" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: CUSTOMER_ID" \
  -d '{}' -b cookies.txt

# 4) Save template config
curl -s -X POST "$API_URL/templates/config" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: CUSTOMER_ID" \
  -d '{"templateKey":"grid_4","brandName":"My Brand","primaryColor":"#0070f3"}' \
  -b cookies.txt

# 5) Generate previews
curl -s -X POST "$API_URL/templates/previews/run" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: CUSTOMER_ID" \
  -b cookies.txt

# 6) Approve
curl -s -X POST "$API_URL/templates/approve" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: CUSTOMER_ID" \
  -d '{}' -b cookies.txt

# Admin: trigger crawl for a customer
curl -s -X POST "$API_URL/admin/customers/CUSTOMER_ID/runs/crawl" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY"

# Admin: trigger preview for a customer
curl -s -X POST "$API_URL/admin/customers/CUSTOMER_ID/runs/preview" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: $ADMIN_KEY"
```
