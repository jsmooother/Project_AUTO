# Product State Audit — Agentic Ads
**Generated:** 2026-02-06  
**Purpose:** Complete factual export of current product state for product and design teams

---

## 1. Product Overview (as implemented)

**Agentic Ads** is a SaaS platform that automates Meta (Facebook/Instagram) advertising for non-technical advertisers, specifically targeting businesses with inventory catalogs (e.g., car dealerships). The product crawls customer websites to extract inventory items, generates ad creatives with overlays (price, title, logo), and publishes paused campaigns to Meta. Customers see only delivery metrics (impressions, clicks, CTR, reach) and their credit balance—never Meta spend, CPC, CPM, or cost data. The system uses a credit-based billing model where customers purchase credits (SEK) that are consumed based on their plan (time-based daily burn or impression-based CPM).

**User persona:** Non-technical advertiser (e.g., car dealership owner) who wants automated Meta ads without managing campaigns, budgets, or creative design.

**Problem solved:** Eliminates manual Meta campaign setup, creative design, and ongoing management. Handles inventory sync, creative generation, and campaign publishing automatically.

---

## 2. User Journey (current UX)

### Signup & Authentication

1. **Signup** (`POST /signup`): User provides email, name (organization), password. Creates `customers`, `users`, and `onboarding_states` records. Session cookie set.
2. **Login** (`POST /auth/login`): Email + password → session cookie → redirect to `/dashboard` or `/onboarding/start` if incomplete.
3. **Session validation:** All customer routes require `requireCustomerSession` middleware. Session cookie validated against DB; `x-customer-id` header must match session `customerId` or returns 403.

### Onboarding Flow (6 steps, gated)

**Gate:** Users cannot access dashboard (`/dashboard`) or any app routes until `overallComplete === true` (checked in `layout.tsx`). Exception: `/settings` is accessible during onboarding.

**Step 1: Start** (`/onboarding/start`)
- Welcome screen with reassurance banner
- "Get started" button → proceeds to Step 2

**Step 2: Inventory** (`/onboarding/inventory`)
- **Completion criteria:** `hasWebsiteUrl && inventoryCount >= 1`
- User can connect website URL (auto-creates `inventory_source`) OR run crawl if website already connected
- Must have at least 1 inventory item from crawl
- **API:** `POST /inventory/source`, `POST /runs/crawl`, `GET /inventory/items`

**Step 3: Templates** (`/onboarding/preview`)
- **Completion criteria:** `templateConfig.status === "approved"`
- User selects template (e.g., "Grid 4"), configures brand name/color/logo, saves config
- Must approve template (status changes to "approved")
- **API:** `GET /templates/config`, `POST /templates/config`

**Step 4: Meta** (`/onboarding/meta`)
- **Completion criteria:** `metaConnected && hasAdAccount && metaPartnerVerified`
- User must:
  1. Connect Meta account (OAuth or dev fake connect if `ALLOW_DEV_META=true`)
  2. Select ad account in Settings → Meta
  3. Verify partner access (system user configured)
- Links to `/settings` to complete Meta setup
- **API:** `GET /meta/status`, `POST /meta/oauth/connect`, `POST /meta/ad-account/select`, `POST /meta/partner-access/verify`

**Step 5: Ads** (`/onboarding/ads`)
- **Completion criteria:** `adsSettings.id` exists (settings saved)
- User configures:
  - Geo targeting: radius mode (center text + km) OR regions mode (array of regions)
  - Formats: at least one of ["feed", "stories", "reels"]
  - CTA type: "learn_more", "shop_now", "sign_up", "contact_us", "apply_now", "download"
  - Budget override (optional)
- "Save and Continue" → `POST /ads/settings` → proceeds to Step 6

**Step 6: Budget** (`/onboarding/budget`)
- **Completion criteria:** `hasPlan || (hasBalance && !hint)`
- Shows billing status
- User can set monthly budget amount (stored in `onboarding_states.monthly_budget_amount`)
- "Finish" → `POST /onboarding/budget` → redirects to `/dashboard`

**Completion:** `overallComplete` is true when all 5 steps (inventory, templates, meta, ads, billing) are "ok". LocalStorage flag `onboardingComplete` is set to persist across sessions.

### Post-Onboarding

- Dashboard becomes accessible
- All app routes unlocked (inventory, ads, performance, billing, settings, templates, automation)
- Onboarding status checked on every route load; incomplete → redirect to `/onboarding/start`

---

## 3. Customer-Facing Routes & Screens

### `/dashboard` — Dashboard Page
**Purpose:** Overview of performance, credits, ads status, and inventory count.

**Primary actions:**
- View performance snapshot (impressions, clicks, CTR, reach)
- View credits remaining and credits used (MTD)
- View ads status and last sync date
- Navigate to other sections

**Backend endpoints:**
- `GET /performance/summary?preset=last_7d`
- `GET /billing/status`
- `GET /ads/status`
- `GET /inventory/items`

**Constraints:**
- No spend data shown (only delivery metrics)
- Upsell banners shown when credits low (< 7 days runway) or CTR high (> 2.5%) with good runway
- Inventory increase notification if count increased since last visit

---

### `/inventory` — Inventory Management
**Purpose:** View and manage scraped inventory items, select items for ads.

**Primary actions:**
- View all inventory items (table with title, price, status, first/last seen)
- Search by title/external ID
- Filter by status (all, active, new, removed)
- Sort by recent, price (high/low), title
- Toggle "Include in ads" checkbox per item (`isAdEligible`)
- Bulk actions: "Include all", "Exclude all", "Include top 10 newest"
- Run manual crawl sync

**Backend endpoints:**
- `GET /inventory/items`
- `POST /inventory/items/select` (updates `isAdEligible` for multiple items)
- `POST /runs/crawl`

**Constraints:**
- Only shows items from active `inventory_source`
- Optimistic UI updates for selection (local state + API call)

---

### `/ads` — Ads Overview
**Purpose:** View ads status, prerequisites, settings, and publish campaigns.

**Primary actions:**
- View prerequisites status (website, inventory, templates, Meta)
- View current ads settings (geo, formats, CTA)
- View Meta ad objects status (campaign ID, adset ID, status)
- View last publish runs (status, finishedAt, errorMessage)
- Link to "Preview & Publish" (`/ads/preview`)
- Link to "Setup" (`/ads/setup`)
- Link to "Campaign" (`/ads/campaign`)
- Link to "Diagnostics" (`/ads/diagnostics`)

**Backend endpoints:**
- `GET /ads/status` (comprehensive status object)

**Constraints:**
- Shows "Eligible items: X" count (items with `isAdEligible=true`)
- Test mode banner if `metaAccountMode === "internal_test"`

---

### `/ads/preview` — Preview & Publish
**Purpose:** Preview items that will be published, generate creatives, and publish campaigns.

**Primary actions:**
- View QA gate status (scrape quality validation: 30% invalid threshold)
- View projected items (up to 2 items) with generated images or source images
- "Generate Creatives" button → triggers creative generation job, polls status every 2s for 60s max
- View per-item creative status (pending/generated/failed with error messages)
- "Proceed to Publish" button (disabled if creatives not ready)
- Publish campaign → `POST /ads/publish`

**Backend endpoints:**
- `GET /ads/publish-preview` (QA gate + projected items + `needsCreatives` flag)
- `GET /creatives/status?itemIds=...`
- `POST /creatives/generate`
- `POST /ads/publish`

**Constraints:**
- Only shows items with `isAdEligible=true`
- Items must pass validation: price >= 50k SEK, valid image URL, valid HTTPS URL, title present
- Creative generation required before publish (publish button disabled until all items have "feed" variant generated)
- Test mode banner if internal test mode

---

### `/ads/setup` — Ads Configuration
**Purpose:** Configure ads settings (geo, formats, CTA, budget).

**Primary actions:**
- Edit geo targeting (radius or regions)
- Select ad formats (feed, stories, reels)
- Select CTA type
- Set budget override (optional)
- Save settings → `POST /ads/settings`

**Backend endpoints:**
- `GET /ads/status`
- `POST /ads/settings`

**Constraints:**
- At least one format required
- Radius mode requires center text + km
- Regions mode requires at least one region

---

### `/ads/campaign` — Campaign Details
**Purpose:** View campaign status and Meta ad objects.

**Primary actions:**
- View campaign ID, adset ID, ad ID (if published)
- View status (paused, active, error)
- View last publish step and error (if failed)

**Backend endpoints:**
- `GET /ads/objects`
- `GET /ads/status`

**Constraints:**
- Shows warning if `ALLOW_REAL_META_WRITE` and `ALLOW_DEV_ADS_PUBLISH_SIM` both false

---

### `/ads/diagnostics` — Diagnostics
**Purpose:** Debug information for ads runs and errors.

**Primary actions:**
- View last 10 ad runs (status, trigger, startedAt, finishedAt, errorMessage)
- View prerequisites breakdown
- View Meta connection status

**Backend endpoints:**
- `GET /ads/runs`
- `GET /ads/status`

---

### `/templates` — Template Configuration
**Purpose:** Select and configure ad template, preview generated ads.

**Primary actions:**
- View available templates (e.g., "Grid 4", "Single Hero")
- Select template
- Configure brand name, primary color, logo URL
- Save config → `POST /templates/config`
- Approve template (changes status to "approved")
- View previews (if generated)

**Backend endpoints:**
- `GET /templates/list`
- `GET /templates/config`
- `POST /templates/config`
- `GET /templates/previews`

**Constraints:**
- Template must be approved before ads step can complete
- Preview generation requires inventory items

---

### `/performance` — Performance Metrics
**Purpose:** View delivery metrics (impressions, clicks, CTR, reach) over time.

**Primary actions:**
- View totals (impressions, clicks, CTR, reach)
- View daily breakdown (last 7d or last 30d)
- Toggle preset (last_7d / last_30d)
- Refresh data

**Backend endpoints:**
- `GET /performance/summary?preset=last_7d|last_30d`

**Constraints:**
- **No spend data shown** (only delivery metrics)
- Returns synthetic metrics if Meta not connected or sim mode
- Shows hint if campaign paused or no data

---

### `/billing` — Billing & Credits
**Purpose:** View credit balance, plan, usage, and delivery summary.

**Primary actions:**
- View credits remaining (SEK)
- View plan details (billing mode, monthly price, status)
- View delivery summary (impressions, clicks, CTR, reach)
- View credits used (last 7d, last 30d, MTD)
- Toggle preset (last_7d / last_30d)
- Self-service top-up (if `ALLOW_DEV_BILLING_TOPUP=true`)

**Backend endpoints:**
- `GET /billing/status?preset=last_7_days|last_30_days`
- `POST /billing/topup` (dev-only unless flag enabled)

**Constraints:**
- **No spend data shown** (only credits consumed and delivery metrics)
- Credits consumed calculated from ledger entries (type="consumption")
- Balance from `customer_balance_cache` (source of truth: ledger)

---

### `/settings` — Settings
**Purpose:** Manage website connection, Meta connection, ad account selection, partner access, logo discovery.

**Primary actions:**
- **Website:** Update website URL, view last crawled date
- **Meta:** Connect/disconnect Meta account, select ad account, verify partner access, run smoke test
- **Brand Logo:** Discover logo from website (`POST /inventory/logo/discover`), view logo preview
- **Account:** View account name, company name

**Backend endpoints:**
- `GET /inventory/items` (for source info)
- `GET /meta/status`
- `POST /meta/oauth/connect`
- `POST /meta/dev-connect` (if `ALLOW_DEV_META=true`)
- `POST /meta/disconnect`
- `GET /meta/ad-accounts`
- `POST /meta/ad-account/select`
- `POST /meta/partner-access/verify`
- `POST /meta/smoke-test`
- `POST /inventory/logo/discover`

**Constraints:**
- Dev connect button only shown if `NEXT_PUBLIC_ALLOW_DEV_META=true`
- Partner access verification requires system user token
- Logo discovery enqueues `LOGO_DISCOVER` job

---

### `/automation` — Automation (Runs)
**Purpose:** View crawl runs, ad runs, and automation history.

**Primary actions:**
- View crawl runs (status, startedAt, finishedAt, itemCount)
- View ad runs (status, trigger, startedAt, finishedAt, errorMessage)
- Run manual crawl
- View run details

**Backend endpoints:**
- `GET /runs/crawl`
- `GET /ads/runs`
- `POST /runs/crawl`

---

### `/connect-website` — Connect Website
**Purpose:** Connect inventory source website URL.

**Primary actions:**
- Enter website URL
- Connect → `POST /inventory/source`
- Redirects to dashboard

**Backend endpoints:**
- `POST /inventory/source`

**Constraints:**
- URL normalized (adds https:// if missing)
- URL validated (must be reachable via HEAD request)

---

## 4. Ads & Creatives Flow (REAL)

### Inventory Ingestion

1. **Website connection:** User enters URL → `POST /inventory/source` → creates/updates `inventory_sources` record
2. **Crawl:** User triggers crawl → `POST /runs/crawl` → enqueues `CRAWL_REAL_IVARS` job → worker scrapes website → stores items in `inventory_items` table
3. **Item fields:** `id`, `externalId`, `title`, `url`, `price`, `status`, `isAdEligible` (default: true), `detailsJson` (contains `primaryImageUrl`, `images`, `priceAmount`, `currency`, etc.)

### Ad Eligibility Selection

- User toggles "Include in ads" checkbox on `/inventory` page
- Updates `isAdEligible` boolean per item via `POST /inventory/items/select`
- Bulk actions: "Include all", "Exclude all", "Include top 10 newest"
- Only items with `isAdEligible=true` are considered for ads

### Creative Generation

**Trigger:** User clicks "Generate Creatives" on `/ads/preview` → `POST /creatives/generate` with `inventoryItemIds` and `variants` (default: ["feed", "story"])

**Worker job:** `CREATIVE_GENERATE`
1. Downloads source image from `detailsJson.primaryImageUrl` or `detailsJson.images[0]`
2. Resizes/crops to target aspect ratio:
   - `feed`: 1200x628 (1.91:1)
   - `story`/`reel`: 1080x1920 (9:16)
   - `square`: 1080x1080 (1:1, optional)
3. Overlays:
   - Logo (top-left, from `customer_branding.logo_url` if exists)
   - Text overlay (bottom): title, price, mileage (if available)
   - Badge (optional): "NYINKOMMEN" / "New" if item is new
4. Renders with `sharp` + SVG composition
5. Uploads to Supabase Storage bucket `creatives` → returns public URL
6. Writes `creative_assets` record: `id`, `customerId`, `inventoryItemId`, `variant`, `sourceImageUrl`, `generatedImageUrl`, `width`, `height`, `status` ("pending" → "generated" or "failed"), `errorMessage`

**Storage:** Supabase Storage (`creatives` bucket), public URLs format: `{supabaseUrl}/storage/v1/object/public/creatives/{path}`

**Status polling:** UI polls `GET /creatives/status?itemIds=...` every 2s for 60s max until all items have "generated" status

### Preview

**Endpoint:** `GET /ads/publish-preview`
1. **QA Gate:** Validates scrape quality (samples 10 items, checks price >= 50k, valid image URL, valid HTTPS URL, title present). Fails if >30% invalid.
2. **Item projection:** Selects latest N items (N=2) with `isAdEligible=true`, projects for Meta format
3. **Creative lookup:** Fetches `creative_assets` for candidate items, prefers `generatedImageUrl` over source image
4. **Response:** `ok`, `qaGate` (total, invalid, invalidRate, threshold, failures), `projectedItems` (with `generatedImageUrl` if available), `needsCreatives` flag, `hint`

**UI:** Shows QA gate status, projected items with images (generated or source), creative status per item, "Generate Creatives" button if `needsCreatives=true`

### Publish (paused vs live)

**Trigger:** User clicks "Proceed to Publish" on `/ads/preview` → `POST /ads/publish` → enqueues `ADS_PUBLISH` job

**Worker job:** `ADS_PUBLISH`
1. **QA Gate:** Same validation as preview (30% invalid threshold)
2. **Validation:** `ad_settings` exists, geo config valid, at least one format enabled
3. **Mode check:**
   - **Real mode** (`ALLOW_REAL_META_WRITE=true`): Creates real PAUSED campaign + adset in Meta
   - **Sim mode** (`ALLOW_DEV_ADS_PUBLISH_SIM=true`): Writes placeholder Meta IDs
   - **Disabled:** Fails with error
4. **Creative requirement:** Fetches `creative_assets` for eligible items, uses `generatedImageUrl` for Meta creatives. Fails if required creatives missing.
5. **Meta API calls:**
   - Creates catalog (if not exists)
   - Creates catalog item (vehicle)
   - Creates campaign (status: "PAUSED")
   - Creates adset (status: "PAUSED", targeting from `ad_settings`)
   - Creates ad creative (uses `generatedImageUrl` or source image)
   - Creates ad (links creative to adset)
6. **Storage:** Writes `meta_ad_objects` record with Meta IDs (campaignId, adsetId, creativeId, adId, status: "paused")

**Campaign status:** Always created as **PAUSED**. User must manually activate in Meta Ads Manager.

**Meta permissions model:**
- **System user:** Used for partner access verification and internal test mode
- **Customer OAuth token:** Used for real writes (if `ALLOW_REAL_META_WRITE=true`)
- **Partner access:** Required for real writes (verified via system user token)
- **Internal test mode:** If `META_TEST_MODE=true` and customer matches `META_TEST_CUSTOMER_ID`, uses system user token with `META_TEST_AD_ACCOUNT_ID` override

---

## 5. Billing & Credits Model

### What the customer sees

- **Credits remaining:** Balance in SEK (from `customer_balance_cache.balance_sek`)
- **Credits used:** Consumption from ledger (last 7d, last 30d, MTD)
- **Plan:** Billing mode (time_based / impression_based), monthly price (SEK), status (active/paused)
- **Delivery summary:** Impressions, clicks, CTR, reach (from Meta insights or synthetic)
- **Usage period:** Selectable preset (last_7_days / last_30_days)

### What is explicitly hidden

- **Meta spend:** Never exposed to customers (admin-only)
- **CPC, CPM, cost_per_***: Never exposed to customers
- **Margin:** Admin-only (revenue - Meta spend)
- **Meta currency:** Not shown in customer scope
- **Internal pricing:** `meta_monthly_cap`, `margin_percent` are admin-only

**Code enforcement:** `.cursor/rules/no-spend-customer-scope.mdc` rule enforces this. Performance routes request Meta insights with `fields: "impressions,reach,clicks,ctr"` only (no `spend`).

### How credits are consumed

**Mode A: Time-based burn** (default)
- Daily charge = `customer_monthly_price / 30` SEK
- One consumption entry per customer per day (`type: "consumption"`, `meta_campaign_id: null`)
- Idempotent by `customer_id`, `period_date`

**Mode B: Impression-based burn**
- Charge = `(impressions / 1000) * customer_cpm_sek` SEK per day per campaign
- One consumption entry per customer per `period_date` per `meta_campaign_id`
- Idempotent by `customer_id`, `period_date`, `meta_campaign_id`

**Ledger:** `customer_ledger_entries` is source of truth. Balance = sum of `amount_sek`. Types: `topup`, `consumption`, `adjustment`.

### Upsell or top-up entry points

- **Dashboard:** Low credits banner (< 7 days runway) → links to `/billing`
- **Dashboard:** Scale suggestion banner (CTR > 2.5% with good runway) → links to `/billing`
- **Billing page:** Self-service top-up button (if `ALLOW_DEV_BILLING_TOPUP=true`, dev-only by default)
- **Admin:** Top-up via admin panel (`POST /admin/customers/:id/billing/topup`)

---

## 6. Dashboard (as-is)

### Data shown

- **Performance snapshot:** Impressions, clicks, CTR, reach (from `GET /performance/summary`)
- **Credits remaining:** Balance SEK (from `GET /billing/status`)
- **Credits used (MTD):** Month-to-date consumption (from `GET /billing/status`)
- **Ads status:** Campaign status, last sync date (from `GET /ads/status`)
- **Inventory count:** Total items (from `GET /inventory/items`)

### Data intentionally NOT shown

- **Spend:** Never shown (admin-only)
- **CPC, CPM:** Never shown
- **Meta currency:** Not exposed
- **Margin:** Admin-only
- **Internal budget caps:** Not shown

### What decisions the user can make from it

- Navigate to `/ads` to publish campaigns
- Navigate to `/billing` to top up credits (if enabled)
- Navigate to `/performance` for detailed metrics
- Navigate to `/inventory` to manage items
- Navigate to `/settings` to update Meta connection

---

## 7. Feature Flags / Modes

### Dev / Test / Prod Differences

**Meta Connection:**
- `ALLOW_DEV_META=true` + `NEXT_PUBLIC_ALLOW_DEV_META=true`: Shows "Dev: Fake Connect" button, allows fake OAuth connection
- `META_TEST_MODE=true` + `META_TEST_CUSTOMER_ID` + `META_TEST_AD_ACCOUNT_ID`: Internal test mode (uses system user token, overrides ad account)

**Ads Publish:**
- `ALLOW_REAL_META_WRITE=true`: Real Meta API writes (creates PAUSED campaigns)
- `ALLOW_DEV_ADS_PUBLISH_SIM=true`: Sim mode (placeholder Meta IDs, no real writes)
- **Disabled (both false):** Publish fails with error

**Billing:**
- `ALLOW_DEV_BILLING_TOPUP=true`: Enables self-service top-up endpoint (dev-only by default)

**Onboarding:**
- `NEXT_PUBLIC_ONBOARDING_ALLOW_BYPASS=true`: Allows bypassing onboarding gate (dev-only)

**Meta Write Mode Indicator:**
- `GET /ads/status` returns `derived.metaWriteMode`: `"real"` | `"sim"` | `"disabled"` (no secrets)

### META_TEST_MODE

**Purpose:** Allows designated test customers to publish ads using Project Auto's Meta ad account instead of their own.

**Behavior:**
- If `META_TEST_MODE=true` and `customerId === META_TEST_CUSTOMER_ID`:
  - Uses system user token for Meta API calls
  - Overrides `selectedAdAccountId` with `META_TEST_AD_ACCOUNT_ID`
  - Real Meta writes remain PAUSED
  - Other customers continue using their own ad accounts

**UI:** Test mode banner shown on `/ads/preview` and `/ads` if `metaAccountMode === "internal_test"`

### ALLOW_REAL_META_WRITE

**Purpose:** Enables real Meta API writes (creates PAUSED campaigns in Meta).

**Behavior:**
- If `true`: Worker creates real campaigns/adsets/ads in Meta (status: "PAUSED")
- Requires: Meta connected, ad account selected, partner access verified
- Campaigns are always PAUSED (no spend occurs)

**UI:** Warning shown on `/ads/campaign` if both flags false

### Simulation Behavior

**Performance metrics:**
- If Meta not connected or sim mode: Returns synthetic metrics (random impressions/clicks within ranges)
- `GET /performance/summary` returns `mode: "sim"` if synthetic

**Ads publish:**
- Sim mode (`ALLOW_DEV_ADS_PUBLISH_SIM=true`): Writes placeholder Meta IDs (e.g., "sim-campaign-123")
- No real Meta API calls

---

## 8. Known UX Complexity or Friction (from code)

### Multi-step Meta setup

**Friction:** Meta connection requires 3 separate steps:
1. Connect Meta account (OAuth or dev fake connect)
2. Select ad account (dropdown in Settings)
3. Verify partner access (system user configuration)

**Impact:** User must navigate to Settings → Meta multiple times during onboarding. Onboarding step 4 (`/onboarding/meta`) links to Settings but doesn't provide inline flow.

**Code evidence:** `useOnboardingStatus` checks `metaConnected && hasAdAccount && metaPartnerVerified` separately. Settings page has separate sections for each step.

### Ads configuration depth

**Friction:** Ads settings require multiple fields:
- Geo targeting: Radius mode (center text + km) OR regions mode (array selection)
- Formats: Multiple checkboxes (feed, stories, reels)
- CTA: Dropdown selection
- Budget override: Optional number input

**Impact:** Onboarding step 5 (`/onboarding/ads`) is form-heavy. User must understand radius vs regions, format implications, CTA options.

**Code evidence:** `POST /ads/settings` validates all fields. Form has multiple inputs and conditional logic (radius vs regions).

### Creative generation async flow

**Friction:** Creative generation is asynchronous:
1. User clicks "Generate Creatives"
2. Job enqueued
3. UI polls status every 2s for 60s max
4. User must wait for all items to have "generated" status before publish button enables

**Impact:** User may not understand why publish is disabled. Polling timeout (60s) may be insufficient for large batches.

**Code evidence:** `/ads/preview` page implements polling with `setInterval`, checks `creativesReady` before enabling publish button.

### QA Gate failure unclear

**Friction:** QA gate validates scrape quality (30% invalid threshold). If fails, user sees error but may not understand which items are invalid or how to fix.

**Impact:** User may be stuck if scrape quality is low. Error message shows invalid rate but not specific item issues (though `failures` array exists in response).

**Code evidence:** `GET /ads/publish-preview` returns `qaGate.failures` array, but UI may not display individual item reasons clearly.

### Partner access verification complexity

**Friction:** Partner access verification requires system user token and Meta Business Manager setup. User may not understand what "partner access" means or why it's required.

**Impact:** User may be confused by "Verify partner access" step. Error messages may reference technical concepts (system user, Business Manager).

**Code evidence:** `POST /meta/partner-access/verify` uses system user token, checks Business Manager access. Error messages reference technical concepts.

### Inventory selection UX

**Friction:** User must manually select items for ads via checkboxes. Bulk actions exist ("Include top 10 newest") but default is all items eligible (`isAdEligible=true`).

**Impact:** User may not realize they need to select items before generating creatives. Bulk actions help but require understanding of "top 10 newest" logic.

**Code evidence:** `/inventory` page has checkboxes per item, bulk action buttons. Default `isAdEligible=true` means all items are eligible by default.

### Billing plan setup unclear

**Friction:** Billing plan is created automatically on first publish (from onboarding budget), but user may not understand when/how plan is created.

**Impact:** User may see "No budget plan yet" hint but not understand how to set one up (it's automatic on publish).

**Code evidence:** `GET /billing/status` returns hint if no plan. Plan is created in `ADS_PUBLISH` job if missing.

---

## Appendix: API Endpoints Summary

### Customer-facing endpoints (require `x-customer-id` header)

**Auth:**
- `POST /signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

**Onboarding:**
- `GET /onboarding/status`
- `POST /onboarding/company`
- `POST /onboarding/budget`

**Inventory:**
- `GET /inventory/items`
- `POST /inventory/source`
- `POST /inventory/items/select`
- `POST /inventory/logo/discover`

**Templates:**
- `GET /templates/list`
- `GET /templates/config`
- `POST /templates/config`
- `GET /templates/previews`

**Meta:**
- `GET /meta/status`
- `POST /meta/oauth/connect`
- `POST /meta/dev-connect` (if `ALLOW_DEV_META=true`)
- `POST /meta/disconnect`
- `GET /meta/ad-accounts`
- `POST /meta/ad-account/select`
- `POST /meta/partner-access/verify`
- `POST /meta/smoke-test`

**Ads:**
- `GET /ads/status`
- `POST /ads/settings`
- `POST /ads/sync`
- `POST /ads/publish`
- `GET /ads/publish-preview`
- `GET /ads/runs`
- `GET /ads/objects`

**Creatives:**
- `POST /creatives/generate`
- `GET /creatives/status`

**Performance:**
- `GET /performance/summary?preset=last_7d|last_30d`

**Billing:**
- `GET /billing/status?preset=last_7_days|last_30_days`
- `POST /billing/topup` (if `ALLOW_DEV_BILLING_TOPUP=true`)

**Runs:**
- `GET /runs/crawl`
- `POST /runs/crawl`

---

**End of audit**
