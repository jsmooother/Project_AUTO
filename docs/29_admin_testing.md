# Admin Dashboard — Testing Guide

## How to Run Locally

1. **Start dependencies** (Postgres, Redis via Docker):
   ```bash
   docker-compose up -d
   ```

2. **Run migrations**:
   ```bash
   pnpm db:migrate
   ```

3. **Start API and Web**:
   ```bash
   pnpm dev
   ```
   Or run separately: `pnpm --filter @repo/api dev` and `pnpm --filter @repo/web dev`.

4. **Admin API auth** (see `.env.example`):
   - **NODE_ENV=development**  
     - If `ALLOW_INSECURE_ADMIN=true`: admin endpoints allow access without `x-admin-key`.  
     - Otherwise: require `x-admin-key` header matching `ADMIN_API_KEY`.
   - **All other environments** (e.g. production): always require `x-admin-key` matching `ADMIN_API_KEY`. `ADMIN_API_KEY` must be set.

5. **Admin link on dashboard**:
   - The "Admin →" link is shown only if `NEXT_PUBLIC_SHOW_ADMIN_LINK=true`.  
   - You can still visit `/admin/customers` directly if you have access.

## Curl Examples

Set `ADMIN_KEY` when auth is required (production, or development without `ALLOW_INSECURE_ADMIN=true`):

```bash
export API_URL="http://localhost:3001"
export ADMIN_KEY="your-admin-key"   # Must match ADMIN_API_KEY when auth is required
# In dev with ALLOW_INSECURE_ADMIN=true, header is optional
```

### GET /admin/customers

```bash
curl -s -X GET "$API_URL/admin/customers" \
  -H "x-admin-key: $ADMIN_KEY" | jq
```

With filters:

```bash
curl -s -X GET "$API_URL/admin/customers?search=acme&status=active&limit=20" \
  -H "x-admin-key: $ADMIN_KEY" | jq
```

### GET /admin/customers/:customerId

```bash
# Replace CUSTOMER_ID with a real UUID from signup or customers list
curl -s -X GET "$API_URL/admin/customers/CUSTOMER_ID" \
  -H "x-admin-key: $ADMIN_KEY" | jq
```

### GET /admin/runs

```bash
# All runs
curl -s -X GET "$API_URL/admin/runs" \
  -H "x-admin-key: $ADMIN_KEY" | jq

# Crawl runs only
curl -s -X GET "$API_URL/admin/runs?type=crawl" \
  -H "x-admin-key: $ADMIN_KEY" | jq

# Preview runs, status=success
curl -s -X GET "$API_URL/admin/runs?type=preview&status=success" \
  -H "x-admin-key: $ADMIN_KEY" | jq

# Runs for a specific customer
curl -s -X GET "$API_URL/admin/runs?customerId=CUSTOMER_ID" \
  -H "x-admin-key: $ADMIN_KEY" | jq
```

### GET /admin/runs/:runId

```bash
curl -s -X GET "$API_URL/admin/runs/RUN_ID" \
  -H "x-admin-key: $ADMIN_KEY" | jq
```

### GET /admin/inventory-sources

```bash
curl -s -X GET "$API_URL/admin/inventory-sources" \
  -H "x-admin-key: $ADMIN_KEY" | jq
```

## Browser Verification Steps

1. **Enable Admin link** (optional): set `NEXT_PUBLIC_SHOW_ADMIN_LINK=true` in `.env` and restart the web app.

2. **Create a customer** (if none exist):
   - Go to http://localhost:3000/signup
   - Sign up with email + org name
   - Note the `customerId` from the response (or in `localStorage.customerId`)

3. **Access Admin**:
   - If the Admin link is shown: go to http://localhost:3000/dashboard, scroll to bottom, click "Admin →"
   - Or go directly to http://localhost:3000/admin/customers

4. **Customers table**:
   - Should show a list of customers
   - Use search box (name/ID) and status filter
   - Click a row → navigates to /admin/customers/[customerId]

5. **Customer detail**:
   - Overview tab: stats (inventory items, crawl runs, preview runs, template status)
   - Runs tab: link to filtered runs
   - Inventory / Billing: placeholder content

6. **Runs page**:
   - Go to http://localhost:3000/admin/runs
   - Use type filter (crawl / preview) and status filter
   - Enter customer ID + Filter to scope
   - Click a row → navigates to /admin/runs/[runId]

7. **Run detail**:
   - Shows run metadata, customer link, error if failed

8. **Inventory sources**:
   - Go to http://localhost:3000/admin/inventory-sources
   - Table of website URLs and customers (after customers have connected websites)

9. **Navigation**:
   - Sidebar links: Overview, Customers, Inventory Sources, Runs, Billing, System Config
   - "Exit Admin" returns to /dashboard

## Troubleshooting

- **403 Forbidden**: Invalid or missing `x-admin-key`. Ensure `ADMIN_API_KEY` is set and the header matches.
- **503 Config Error**: `ADMIN_API_KEY` is not set but auth is required. In development, use `ALLOW_INSECURE_ADMIN=true` to skip the key, or set `ADMIN_API_KEY`.
- **Admin link not visible**: Set `NEXT_PUBLIC_SHOW_ADMIN_LINK=true` and restart the web app.

## File List

### New Files

- `apps/api/src/middleware/adminContext.ts` — requireAdmin middleware
- `apps/api/src/routes/admin.ts` — Admin API routes
- `apps/web/src/app/admin/layout.tsx` — Admin shell (sidebar + top bar)
- `apps/web/src/app/admin/page.tsx` — Redirect to /admin/customers
- `apps/web/src/app/admin/customers/page.tsx` — Customers table
- `apps/web/src/app/admin/customers/[customerId]/page.tsx` — Customer detail
- `apps/web/src/app/admin/runs/page.tsx` — Runs table
- `apps/web/src/app/admin/runs/[runId]/page.tsx` — Run detail
- `apps/web/src/app/admin/inventory-sources/page.tsx` — Inventory sources table
- `apps/web/src/app/admin/billing/page.tsx` — Placeholder
- `apps/web/src/app/admin/system-config/page.tsx` — Placeholder
- `docs/28_admin_figma_discovery.md` — Figma discovery table
- `docs/29_admin_testing.md` — This file

### Modified Files

- `apps/api/src/server.ts` — preHandler for /admin/*, admin routes registration
- `apps/web/src/app/dashboard/page.tsx` — Admin link at bottom
- `.env.example` — ADMIN_API_KEY
