# Product State Export — Agentic Ads
**Generated:** 2026-02-06  
**Purpose:** Source of truth for UX strategy and Figma design work

---

## 1. Product Overview

Agentic Ads automates Meta advertising for businesses with inventory catalogs, such as car dealerships. The platform crawls the customer's website to extract inventory items, automatically generates ad creatives with price and branding overlays, and publishes campaigns to Meta. Customers see only delivery metrics (impressions, clicks, CTR, reach) and their credit balance—never Meta spend, CPC, or CPM data. Campaigns are created in a paused state by default, requiring manual activation in Meta Ads Manager. The system uses a credit-based billing model where customers purchase credits (SEK) that are consumed based on their plan.

**Who it's for:** Non-technical advertisers (e.g., car dealership owners) who want automated Meta ads without managing campaigns, budgets, or creative design.

**What users get:** Fully automated Meta advertising that syncs inventory, generates creatives, and publishes campaigns without manual intervention. Users only need to activate campaigns in Meta Ads Manager when ready.

---

## 2. Core Capabilities

- **Inventory ingestion:** Crawls customer websites to extract inventory items (title, price, images, URLs). Stores items in database with eligibility flags for ads.
- **Creative generation:** Automatically generates ad images with overlays (logo, price, title, mileage) in multiple formats (feed 1.91:1, story/reel 9:16). Images stored in Supabase Storage with public URLs.
- **Ads automation:** Publishes campaigns, adsets, and ads to Meta using generated creatives. Handles catalog creation, item sync, and ad linking automatically.
- **Meta publishing model:** All campaigns created in PAUSED state by default. No spend occurs until user manually activates in Meta Ads Manager.
- **Billing via credits:** Customers purchase credits (SEK) that are consumed daily based on plan (time-based daily burn or impression-based CPM). Balance and consumption visible; Meta spend hidden.
- **Internal test mode:** Designated test customers can use Project Auto's Meta ad account instead of their own. Uses system user token with ad account override. Real writes remain paused.

---

## 3. User Journey (Actual)

### Signup → Login

1. User signs up with email, organization name, password. System creates customer account and onboarding state.
2. User logs in with email and password. Session cookie set. Redirected to dashboard or onboarding if incomplete.

### Onboarding Steps (6 steps, sequential)

**Gate:** Users cannot access dashboard or any app routes until all 5 core steps (inventory, templates, meta, ads, billing) are complete. Exception: Settings page is accessible during onboarding.

**Step 1: Start** (`/onboarding/start`)
- Welcome screen with reassurance banner
- "Get started" button proceeds to Step 2

**Step 2: Inventory** (`/onboarding/inventory`)
- User connects website URL OR runs crawl if website already connected
- Success: At least 1 inventory item detected from crawl
- Failure: No items found, must run crawl or connect website

**Step 3: Templates** (`/onboarding/preview`)
- User selects template, configures brand name/color/logo, saves config
- Success: Template status is "approved"
- Failure: Template not approved, must approve before continuing

**Step 4: Meta** (`/onboarding/meta`)
- User connects Meta account, selects ad account, verifies partner access
- Success: Meta connected, ad account selected, partner access verified
- Failure: Any step incomplete, must complete in Settings → Meta

**Step 5: Ads** (`/onboarding/ads`)
- User configures geo targeting (radius or regions), selects formats, sets CTA
- Success: Ads settings saved (has ID)
- Failure: Settings not saved, must complete form

**Step 6: Budget** (`/onboarding/budget`)
- User views billing status, sets monthly budget amount
- Success: Plan exists OR balance exists without errors
- Failure: No plan and no balance, must set budget

**Completion:** Onboarding complete when all 5 core steps show "ok" status. User redirected to dashboard. LocalStorage flag set to persist completion state.

---

## 4. Onboarding Steps (Explicit)

### Step 1: Start
- **Route:** `/onboarding/start`
- **User action:** Clicks "Get started" button
- **Success:** Proceeds to Step 2
- **Failure:** None (entry point)

### Step 2: Inventory
- **Route:** `/onboarding/inventory`
- **User action:** Connects website URL or runs crawl, waits for items to appear
- **Success:** `hasWebsiteUrl && inventoryCount >= 1`
- **Failure:** No website connected or no items found. User must connect website and run crawl.

### Step 3: Templates
- **Route:** `/onboarding/preview`
- **User action:** Selects template, configures brand name/color/logo, saves config, approves template
- **Success:** `templateConfig.status === "approved"`
- **Failure:** Template not configured or not approved. User must save config and approve.

### Step 4: Meta
- **Route:** `/onboarding/meta`
- **User action:** Navigates to Settings → Meta, connects Meta account (OAuth or dev fake connect), selects ad account from dropdown, verifies partner access
- **Success:** `metaConnected && hasAdAccount && metaPartnerVerified`
- **Failure:** Any of the three steps incomplete. User must complete all three in Settings.

### Step 5: Ads
- **Route:** `/onboarding/ads`
- **User action:** Fills geo targeting (center text + radius OR regions), selects at least one format (feed/stories/reels), selects CTA, optionally sets budget override, clicks "Save and Continue"
- **Success:** `adsSettings.id` exists (settings saved)
- **Failure:** Form validation fails or save fails. User must correct form and save again.

### Step 6: Budget
- **Route:** `/onboarding/budget`
- **User action:** Views billing status, sets monthly budget amount, clicks "Finish"
- **Success:** `hasPlan || (hasBalance && !hint)`
- **Failure:** No plan and no balance. User must set budget amount or request admin setup.

---

## 5. Main App Sections

### Dashboard (`/dashboard`)

**Purpose:** Overview of performance, credits, ads status, and inventory count.

**Data shown:**
- Performance snapshot: Impressions, clicks, CTR, reach (last 7 days)
- Credits remaining: Balance in SEK
- Credits used: Month-to-date consumption
- Ads status: Campaign status, last sync date
- Inventory count: Total items

**Actions:**
- Navigate to Ads, Performance, Billing, Inventory, Settings
- View upsell banners (low credits, scale suggestion, inventory increase)

**Hidden:** Spend data, CPC, CPM, Meta currency, margin, internal budget caps

---

### Inventory (`/inventory`)

**Purpose:** View and manage scraped inventory items, select items for ads.

**Data shown:**
- Table of items: Title, price, status, first/last seen dates
- Source website URL
- Item count and filters (active, new, removed)

**Actions:**
- Search by title or external ID
- Filter by status
- Sort by recent, price, title
- Toggle "Include in ads" checkbox per item
- Bulk actions: Include all, Exclude all, Include top 10 newest
- Run manual crawl sync

**Hidden:** Internal item IDs, scrape metadata, validation errors

---

### Ads (`/ads`)

**Purpose:** View ads status, prerequisites, settings, and publish campaigns.

**Data shown:**
- Prerequisites status: Website, inventory, templates, Meta (ok/pending/fail)
- Current ads settings: Geo mode, formats, CTA
- Meta ad objects: Campaign ID, adset ID, status
- Last publish runs: Status, finished date, error messages
- Eligible items count

**Actions:**
- Navigate to Preview & Publish, Setup, Campaign, Diagnostics
- View test mode banner (if internal test mode active)

**Hidden:** Meta API errors, internal validation details, partner access technical details

---

### Ads Preview (`/ads/preview`)

**Purpose:** Preview items that will be published, generate creatives, and publish campaigns.

**Data shown:**
- QA gate status: Scrape quality validation (30% invalid threshold)
- Projected items: Up to 2 items with images (generated or source)
- Creative status per item: Pending, generated, or failed with error
- Needs creatives flag

**Actions:**
- Generate creatives (triggers job, polls status every 2s for 60s)
- View per-item creative status
- Proceed to publish (disabled until creatives ready)

**Hidden:** Individual item validation failures (only aggregate shown), creative generation job details, Meta API responses

---

### Performance (`/performance`)

**Purpose:** View delivery metrics (impressions, clicks, CTR, reach) over time.

**Data shown:**
- Totals: Impressions, clicks, CTR, reach
- Daily breakdown: Last 7 days or last 30 days
- Date range selector

**Actions:**
- Toggle preset (last 7d / last 30d)
- Refresh data

**Hidden:** Spend data, CPC, CPM, cost per conversion, Meta currency, margin

---

### Billing (`/billing`)

**Purpose:** View credit balance, plan, usage, and delivery summary.

**Data shown:**
- Credits remaining: Balance in SEK
- Plan details: Billing mode, monthly price, status
- Delivery summary: Impressions, clicks, CTR, reach
- Credits used: Last 7 days, last 30 days, month-to-date
- Usage period selector

**Actions:**
- Toggle preset (last 7 days / last 30 days)
- Self-service top-up (if dev flag enabled)

**Hidden:** Meta spend, CPC, CPM, cost per conversion, margin, internal pricing (meta_monthly_cap, margin_percent)

---

### Settings → Meta (`/settings`)

**Purpose:** Manage Meta connection, ad account selection, partner access, logo discovery.

**Data shown:**
- Website URL and last crawled date
- Meta connection status
- Available ad accounts (dropdown)
- Selected ad account
- Partner access status
- Logo preview (if discovered)

**Actions:**
- Update website URL
- Connect/disconnect Meta account
- Select ad account
- Verify partner access
- Run smoke test
- Discover logo from website

**Hidden:** OAuth tokens, system user tokens, Business Manager IDs, technical error details

---

## 6. Ads & Creatives Model

### How Inventory Becomes Ads

1. **Ingestion:** User connects website URL. System crawls website and stores items in database with `isAdEligible` flag (default: true).
2. **Selection:** User can toggle "Include in ads" checkbox per item or use bulk actions. Updates `isAdEligible` boolean.
3. **Validation:** System validates items for Meta (price >= 50k SEK, valid image URL, valid HTTPS URL, title present). QA gate checks 30% invalid threshold.
4. **Projection:** System selects latest N items (N=2) with `isAdEligible=true` and projects them for Meta format.
5. **Creative Generation:** User clicks "Generate Creatives". System downloads source images, overlays logo/text, uploads to Supabase Storage, stores URLs in database.
6. **Publish:** User clicks "Proceed to Publish". System creates catalog, catalog items, campaign (PAUSED), adset (PAUSED), ad creative, and ad in Meta.

### How Creatives Are Generated

**Process:**
1. Download source image from inventory item (from `detailsJson.primaryImageUrl` or `detailsJson.images[0]`)
2. Resize/crop to target aspect ratio:
   - Feed: 1200x628 (1.91:1)
   - Story/Reel: 1080x1920 (9:16)
   - Square: 1080x1080 (1:1, optional)
3. Overlay logo (top-left, from customer branding if exists)
4. Overlay text (bottom): Title, price, mileage (if available)
5. Overlay badge (optional): "NYINKOMMEN" / "New" if item is new
6. Render with image processing library (sharp + SVG composition)
7. Upload to Supabase Storage bucket "creatives"
8. Store public URL in database (`creative_assets.generated_image_url`)

**Storage:** Supabase Storage, public URLs format: `{supabaseUrl}/storage/v1/object/public/creatives/{path}`

### What Users Can Control

- **Item selection:** Toggle "Include in ads" per item, bulk actions
- **Creative generation trigger:** Click "Generate Creatives" button
- **Publish trigger:** Click "Proceed to Publish" button
- **Campaign activation:** Manual activation in Meta Ads Manager (campaigns are paused)

### What Users Cannot Control

- **Creative design:** Overlay layout, font, colors are fixed
- **Image selection:** Uses source image from inventory item
- **Format generation:** All selected variants generated (feed, story)
- **Campaign status:** Always created as PAUSED (cannot publish as active)
- **Meta targeting:** Uses geo settings from ads settings (cannot customize per campaign)

### How "Paused by Default" Works

- All campaigns created with `status: "PAUSED"` in Meta
- No spend occurs until user manually activates in Meta Ads Manager
- User sees campaign status as "paused" in dashboard
- User must go to Meta Ads Manager to activate campaign
- System does not provide activation control in UI

---

## 7. Billing & Upsell Logic

### Credits Model

**Credits:** Customers purchase credits (SEK) that are stored as balance. Credits are consumed based on plan:
- **Time-based:** Daily charge = `customer_monthly_price / 30` SEK
- **Impression-based:** Charge = `(impressions / 1000) * customer_cpm_sek` SEK per day per campaign

**Balance:** Sum of ledger entries (`customer_ledger_entries.amount_sek`). Types: topup, consumption, adjustment.

**Consumption:** Tracked in ledger entries. Visible to customers as "credits used" (last 7d, last 30d, MTD).

### What Users See

- Credits remaining: Balance in SEK
- Credits used: Consumption from ledger (last 7d, last 30d, MTD)
- Plan details: Billing mode, monthly price, status
- Delivery summary: Impressions, clicks, CTR, reach

### What Users Don't See

- Meta spend: Never exposed
- CPC, CPM, cost per conversion: Never exposed
- Margin: Admin-only
- Meta currency: Not shown
- Internal pricing: meta_monthly_cap, margin_percent are admin-only

### When Ads Pause

- Campaigns are always created as PAUSED (by design)
- No automatic pausing based on credits (campaigns remain paused until user activates)
- User must manually activate in Meta Ads Manager

### Upsell Banner Triggers

**Low credits banner:** Shown when `runwayDays < 7 && runwayDays > 0` (credits remaining / daily burn rate < 7 days). Links to Billing.

**Scale suggestion banner:** Shown when `ctr > 2.5% && runwayDays > 10` (high CTR with good runway). Links to Billing.

**Inventory increase banner:** Shown when inventory count increased since last visit. Informational only.

---

## 8. Constraints & Non-Negotiables

### No Spend/CPM/CPC Exposure

- Customer endpoints never return spend-like fields: `spend`, `CPC`, `CPM`, `cost_per_*`
- Customer UI shows only: Credits remaining, credits used, delivery metrics (impressions, clicks, CTR, reach)
- Performance routes request Meta insights with `fields: "impressions,reach,clicks,ctr"` only (no `spend`)
- Admin routes expose spend data separately

### No Backend Changes Allowed

- This export describes current system as implemented
- No suggestions for backend modifications
- Routes and endpoints are source of truth

### One-Time Onboarding Assumption

- Onboarding is completed once per customer
- Completion state persisted in LocalStorage
- No re-onboarding flow (users cannot reset onboarding)

### Non-Technical Users

- All UI must be understandable by non-technical advertisers
- Technical concepts (OAuth, system user, Business Manager) should be abstracted
- Error messages should be user-friendly, not technical

### Meta Partner Access Requirement

- Real Meta writes (`ALLOW_REAL_META_WRITE=true`) require partner access verification
- Partner access uses system user token to verify Business Manager access
- Users must verify partner access in Settings → Meta before publishing
- Dev/test modes can bypass this requirement

---

**End of export**
