# Local E2E UI Testing Guide

This guide enables full end-to-end manual UI testing locally, including Meta publish using real creatives generated from scraped inventory.

## Prerequisites

- **Docker** (for Postgres + Redis)
- **pnpm** (v9.0.0+)
- **Node.js** (v20+)
- **Supabase account** (for storage - optional but recommended for creative generation)

## Quick Start

### Option 1: Use the e2e:dev script (recommended)

```bash
pnpm e2e:dev
```

This script will:
1. Start Docker services (Postgres + Redis)
2. Run database migrations
3. Start API, Worker, and Web in parallel

### Option 2: Manual setup

#### 1. Start Docker services

```bash
docker compose up -d
```

Or manually:
```bash
docker run -d --name project-auto-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=project_auto \
  -p 5432:5432 \
  postgres:16-alpine

docker run -d --name project-auto-redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### 2. Run migrations

```bash
pnpm db:migrate
```

#### 3. Start services

In separate terminals:

```bash
# Terminal 1: API
pnpm --filter @repo/api dev

# Terminal 2: Worker
pnpm --filter @repo/worker dev

# Terminal 3: Web
pnpm --filter @repo/web dev
```

## Environment Variables

Required environment variables (set in `.env`):

```bash
# Database & Queue
DATABASE_URL=postgres://postgres:postgres@localhost:5432/project_auto
REDIS_URL=redis://localhost:6379

# Web
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase Storage (required for creative generation)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Meta (for real publish testing)
ALLOW_REAL_META_WRITE=true
META_TEST_MODE=true
META_TEST_CUSTOMER_ID=your-test-customer-uuid
META_TEST_AD_ACCOUNT_ID=act_123456789
META_PAGE_ID=your-page-id
```

See `.env.example` for all available options.

## Smoke Test Checklist

After starting services, verify everything is working:

### 1. Ports and Health Endpoints

- [ ] **Postgres**: `docker ps` shows `project-auto-postgres` running
- [ ] **Redis**: `docker ps` shows `project-auto-redis` running
- [ ] **API health**: `curl http://localhost:3001/health` returns `{"status":"ok"}`
- [ ] **Web**: Open `http://localhost:3000` - should load login page

### 2. Database Connection

- [ ] **Migrations applied**: Check `schema_migrations` table has latest version
- [ ] **Tables exist**: Verify `customers`, `inventory_items`, `creative_assets` tables exist

### 3. Login and Session

- [ ] **Login page**: Navigate to `/login` - should show login form
- [ ] **Login works**: Use test credentials (create via `/admin/customers` or scripts)
- [ ] **Session persists**: After login, refresh page - should stay logged in
- [ ] **Redirects**: Logged out users redirected to `/login` from protected routes

### 4. Crawl Run

- [ ] **Connect website**: Go to `/onboarding/inventory` or `/connect-website`
- [ ] **Enter URL**: Add a test website URL (e.g., `https://example.com`)
- [ ] **Run crawl**: Click "Run crawl" or trigger via `/runs/crawl`
- [ ] **Crawl completes**: Check `/runs` or worker logs - should see items discovered
- [ ] **Items appear**: Go to `/inventory` - should see scraped items

### 5. Storage Configuration (for creative generation)

- [ ] **Supabase configured**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] **Buckets exist**: Create `creatives` and `logos` buckets in Supabase Storage
- [ ] **Public access**: Ensure buckets allow public read (or use signed URLs)

## Troubleshooting

### Port already in use

```bash
# Stop existing services
pnpm dev:down

# Or manually kill processes
lsof -ti:3001 | xargs kill  # API
lsof -ti:3000 | xargs kill  # Web
```

### Database connection errors

```bash
# Check Postgres is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Redis connection errors

```bash
# Check Redis is running
docker ps | grep redis

# Test connection
redis-cli ping
```

### Migrations fail

```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 5"

# Re-run migrations (idempotent)
pnpm db:migrate
```

### Worker not processing jobs

- Check worker logs: `tail -f /tmp/project-auto-worker.log`
- Verify Redis connection
- Check job queue: `redis-cli KEYS "bull:*"`

## Next Steps

After smoke tests pass, proceed to:
1. **Create/seed test customer** (see test plan below)
2. **Connect website and crawl** inventory
3. **Select items** for ads
4. **Generate creatives** (Phase 4)
5. **Preview generated ads** (Phase 5)
6. **Publish to Meta** (paused) (Phase 6)
7. **Verify in Meta Ads Manager** (Phase 7)

## Test Plan for Full E2E Run

### Prerequisites Checklist

Before starting the test run, ensure:

- [ ] Docker services running (Postgres + Redis)
- [ ] Migrations applied (`pnpm db:migrate`)
- [ ] API, Worker, Web running (`pnpm e2e:dev` or manually)
- [ ] Supabase Storage configured (`SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)
- [ ] Supabase buckets created: `creatives` and `logos` (public read enabled)
- [ ] Meta test mode configured (`META_TEST_MODE=true`, `META_TEST_CUSTOMER_ID`, `META_TEST_AD_ACCOUNT_ID`)
- [ ] Real Meta writes enabled (`ALLOW_REAL_META_WRITE=true`)
- [ ] Meta page ID set (`META_PAGE_ID`)

### Step-by-Step Test Flow

#### 1. Create/Seed Test Customer

- [ ] **Option A**: Use existing test customer (check `META_TEST_CUSTOMER_ID`)
- [ ] **Option B**: Create new customer via `/admin/customers` or `./scripts/create-test-customer.sh`
- [ ] **Verify**: Customer exists and UUID matches `META_TEST_CUSTOMER_ID` in `.env`

#### 2. Connect Website and Crawl

- [ ] Navigate to `/onboarding/inventory` or `/connect-website`
- [ ] Enter test website URL (e.g., `https://ivarsbil.se`)
- [ ] Click "Connect" or "Save"
- [ ] **Verify**: Inventory source created (check `/inventory` page shows source)
- [ ] Click "Run crawl" or trigger via `/runs/crawl`
- [ ] **Wait**: Check `/runs` page or worker logs for crawl completion
- [ ] **Verify**: Items appear in `/inventory` page (should see scraped items)

#### 3. Discover and Store Logo (Optional but Recommended)

- [ ] **Option A**: Trigger logo discovery via API:
  ```bash
  curl -X POST http://localhost:3001/inventory/logo/discover \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json"
  ```
- [ ] **Option B**: Logo will be auto-discovered during creative generation
- [ ] **Verify**: Check `customer_branding` table has `logo_url` populated
- [ ] **Verify**: Logo file exists in Supabase Storage bucket `logos/{customerId}/logo.{ext}`

#### 4. Select Items for Ads

- [ ] Navigate to `/inventory` page
- [ ] **Option A**: Use API to mark items as ad-eligible:
  ```bash
  curl -X POST http://localhost:3001/inventory/items/select \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json" \
    -d '{"itemIds": ["uuid1", "uuid2"], "isAdEligible": true}'
  ```
- [ ] **Option B**: Use UI checkboxes (if implemented in `/inventory` page)
- [ ] **Verify**: Items have `isAdEligible=true` in database
- [ ] **Note**: Default is `true`, so all items are eligible unless explicitly excluded

#### 5. Generate Creatives

- [ ] Navigate to `/ads/preview` page
- [ ] **Verify**: Preview shows items that will be advertised
- [ ] **Check**: If creatives are missing, you'll see "Generate creatives" hint
- [ ] **Option A**: Trigger generation via API:
  ```bash
  curl -X POST http://localhost:3001/creatives/generate \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json" \
    -d '{"inventoryItemIds": ["uuid1", "uuid2"], "variants": ["feed", "story"]}'
  ```
- [ ] **Option B**: Use UI "Generate Creatives" button (if implemented)
- [ ] **Wait**: Check worker logs for creative generation completion
- [ ] **Verify**: Creative assets created in `creative_assets` table with `status='generated'`
- [ ] **Verify**: Generated images exist in Supabase Storage: `creatives/{customerId}/{itemId}/{variant}.png`
- [ ] **Refresh**: `/ads/preview` page should now show generated creative images

#### 6. View Preview

- [ ] Navigate to `/ads/preview` page
- [ ] **Verify**: Preview shows 1-3 items with generated creative images
- [ ] **Verify**: Images display correctly (check browser DevTools → Network)
- [ ] **Verify**: QA gate shows valid status (invalid rate <= 30%)
- [ ] **Verify**: No "needs creatives" hint if all items have generated creatives

#### 7. Publish to Meta (PAUSED)

- [ ] Navigate to `/ads/preview` page
- [ ] **Verify**: All items have generated creatives (no "needs creatives" hint)
- [ ] Click "Publish" button
- [ ] **Wait**: Check worker logs for `adsPublish` job completion
- [ ] **Verify**: `ad_runs` table shows `status='completed'`
- [ ] **Verify**: `meta_ad_objects` table has `campaign_id`, `adset_id`, `ad_id` populated
- [ ] **Verify**: Campaign/adset/ads are created with `status='PAUSED'` in Meta

#### 8. Verify in Meta Ads Manager

- [ ] Open Meta Ads Manager: https://business.facebook.com/adsmanager
- [ ] Select the test ad account (`META_TEST_AD_ACCOUNT_ID`)
- [ ] **Verify**: Campaign exists with name like "Project Auto - ..."
- [ ] **Verify**: Campaign status is **PAUSED** (not active)
- [ ] **Verify**: Ad set exists and is **PAUSED**
- [ ] **Verify**: Ads exist (2 ads if 2 items selected) and are **PAUSED**
- [ ] **Verify**: Ad creatives show generated images (not source images)
- [ ] **Verify**: Ad creatives have correct destination URLs (inventory item URLs)
- [ ] **Verify**: Ad creatives have correct titles, prices, mileage (if shown in overlay)

#### 9. Verify No Spend Exposure

- [ ] Navigate to `/ads` page (customer dashboard)
- [ ] **Verify**: No spend, CPC, CPM, or cost_per_* fields visible
- [ ] **Verify**: Only shows delivery metrics: impressions, clicks, CTR, reach (if any)
- [ ] Navigate to `/performance` page
- [ ] **Verify**: No spend data visible (only delivery metrics)
- [ ] Navigate to `/billing` page
- [ ] **Verify**: Only shows credits/balance, no Meta spend

#### 10. Verify Billing/Performance Still Work

- [ ] Navigate to `/billing` page
- [ ] **Verify**: Billing status loads correctly
- [ ] **Verify**: Balance/credits display correctly
- [ ] Navigate to `/performance` page
- [ ] **Verify**: Performance summary loads (may be empty if no delivery yet)
- [ ] **Verify**: No errors or crashes

### Troubleshooting

#### Creatives not generating

- **Check**: Worker logs for `CREATIVE_GENERATE` job errors
- **Check**: Supabase Storage configuration (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)
- **Check**: Bucket `creatives` exists and is public (or using signed URLs)
- **Check**: Source images are accessible (not blocked by CORS or auth)

#### Logo not discovered

- **Check**: Worker logs for `LOGO_DISCOVER` job errors
- **Check**: Website URL is accessible
- **Check**: Logo discovery strategies (favicon, og:image, header logo)
- **Check**: Logo file uploaded to Supabase Storage bucket `logos`

#### Publish fails with "Creatives not generated"

- **Check**: All selected items have `isAdEligible=true`
- **Check**: Creative generation job completed successfully
- **Check**: `creative_assets` table has `status='generated'` for all items
- **Check**: Generated image URLs are accessible (public or signed URLs)

#### Campaign not appearing in Meta Ads Manager

- **Check**: Worker logs for Meta API errors
- **Check**: `ALLOW_REAL_META_WRITE=true` is set
- **Check**: Meta access token has `ads_management` scope
- **Check**: Ad account ID matches `META_TEST_AD_ACCOUNT_ID`
- **Check**: `META_PAGE_ID` is set correctly

### Success Criteria

✅ **All steps complete without errors**
✅ **Campaign created in Meta Ads Manager (PAUSED)**
✅ **Generated creatives used (not source images)**
✅ **No spend data exposed in customer UI**
✅ **Billing/Performance pages still functional**
✅ **Session enforcement still works**

### Next Steps

After successful test run:
1. Document any issues found
2. Update test plan with any missing steps
3. Consider adding automated E2E tests for critical paths
4. Review creative generation quality (overlay design, text readability)
5. Optimize creative generation performance (parallel processing, caching)
