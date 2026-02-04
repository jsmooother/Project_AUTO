# UI E2E Test Script — Customer & Admin Journey

**Purpose:** Confirm that every required step in the customer (and admin) journey can be completed using **only the UI**, and that every required backend call is triggered somewhere in the UI.

**Scope:** Click-by-click test steps; expected UI result; endpoint(s) that should fire; common failure mapping. No new features.

---

## 1) Customer journey — click-by-click

### Step 1 — Signup → Login → Dashboard

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 1.1 | Open app, go to **Sign up** (e.g. from home or /signup). | Signup form (email, name, password). | — |
| 1.2 | Submit signup form. | Redirect to /dashboard; session established. | **POST /signup** (cookie set) |
| 1.3 | If already signed up: go to **Login** (/login), submit email + password. | Redirect to /dashboard. | **POST /auth/login** (cookie set) |
| 1.4 | Land on **Dashboard** (/dashboard). | Dashboard loads; status cards (website, inventory, template, Meta). | **GET /auth/me** (AuthProvider on load), **GET /onboarding/status**, **GET /inventory/items**, **GET /templates/config**, **GET /meta/status** |

**Note:** AuthProvider runs `GET /auth/me` when any (app) page loads; cookie must be sent.

---

### Step 2 — Connect Website

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 2.1 | From dashboard: click **“Connect website”** (or open **Connect website** from sidebar /connect-website). | Connect-website page with URL input. | — |
| 2.2 | Enter website URL, click **Connect** (or **Save**). | Success; redirect to /dashboard (or stay with success). | **POST /inventory/source** |
| 2.3 | Return to Dashboard. | “Website” prerequisite shows connected (or inventory step visible). | GET /inventory/items (and others on load) |

---

### Step 3 — Run Crawl → Runs → Inventory

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 3.1 | From dashboard: click **“Run crawl”** (or go to **Automation** /runs, click **Run crawl** when source exists). | Crawl queued; redirect to /runs or stay with feedback. | **POST /runs/crawl** |
| 3.2 | Open **Automation** (/runs). Ensure **Crawl runs** tab is selected. | List of crawl runs; status (queued / running / success / failed). | **GET /runs?type=crawl&limit=50** (and GET /inventory/items if crawl tab) |
| 3.3 | Open **Inventory** (/inventory). | List of items from active source (after crawl completes). | **GET /inventory/items** |

---

### Step 4 — Templates: Save config → Generate previews → Approve

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 4.1 | Open **Templates** (/templates). | Templates page; format/style options; config loaded if exists. | **GET /templates**, **GET /templates/config**, **GET /templates/previews**, **GET /inventory/items** |
| 4.2 | Choose format + style, set brand/color if shown, click **Apply** (or equivalent “Save config”). | Config saved; UI reflects current config. | **POST /templates/config** |
| 4.3 | Click **Generate previews** / **Generate more** (or equivalent). | Preview run queued; redirect to /runs?type=preview or success message. | **POST /templates/previews/run** (and often **POST /templates/config** before it) |
| 4.4 | After preview(s) exist, click **Approve**. | Config status becomes approved; UI updates. | **POST /templates/approve** |

---

### Step 5 — Meta: Connect → Select ad account → Status reflects

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 5.1 | Open **Settings** (/settings). | Settings page; Meta section. | **GET /meta/status**, **GET /inventory/items** (for website block) |
| 5.2 | Click **Connect** (Meta). If OAuth: redirect to Meta → authorize → redirect back to /settings?meta=connected. If dev: **Connect with dev** (when NEXT_PUBLIC_META_ENABLED not true). | Meta shows “Connected”; ad account list may load. | **GET /meta/oauth/connect-url** then redirect, or **POST /meta/dev-connect** |
| 5.3 | After connect: ensure ad account list is shown; select an account, click **Select** / **Save**. | Selected ad account stored; status shows selected. | **GET /meta/ad-accounts** (when connected), **POST /meta/ad-accounts/select** |
| 5.4 | Reload or re-open Settings (or Dashboard). | Meta status shows connected and selected ad account. | **GET /meta/status** |

**Note:** OAuth callback goes to /settings (or dashboard); GET /meta/status is called after redirect.

---

### Step 6 — Ads: Setup → Save settings

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 6.1 | Open **Ads** (/ads). | Ads page; prerequisites; Configuration section (expandable) or link to setup. | **GET /ads/status** |
| 6.2 | Either: expand **Configuration** on /ads, set geo/formats/budget, click **Save**. Or: open **/ads/setup** (no sidebar link; use URL), fill form, click **Save**. | Settings saved; success or return to /ads. | **POST /ads/settings** |

---

### Step 7 — Ads: Publish → Run history (Ads Diagnostics)

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 7.1 | On **Ads** (/ads): click **Publish** (when prerequisites met). | Publish run queued; status/UI refreshes. | **POST /ads/publish** |
| 7.2 | On /ads: confirm **last runs** or run history is visible (from status). | Recent ad runs listed (from GET /ads/status). | **GET /ads/status** (includes lastRuns) |
| 7.3 | Open **Ads Diagnostics** to verify full run history and that GET /ads/runs is used. | Diagnostics page; list of ad runs. | **GET /ads/status**, **GET /ads/runs** |

**Note:** There is **no in-app link** to Ads Diagnostics; use URL **/ads/diagnostics**. See BLOCKERS.

---

### Step 8 — Performance

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 8.1 | Open **Performance** (/performance). | Performance page; preset (7d/30d); summary or empty state. | **GET /performance/summary?preset=…** |
| 8.2 | Check: if Meta + campaign set up and live: delivery metrics (impressions, clicks, CTR, reach). If not: clear empty state (e.g. “Connect Meta”, “Publish campaign”). | Correct mode (real/sim/disabled) and hint; no spend shown. | Same |

---

### Step 9 — Billing

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| 9.1 | Open **Billing** (/billing). | Billing page; credits remaining; plan; credits used (7d/30d/MTD); delivery summary. | **GET /billing/status?preset=…** |
| 9.2 | Confirm: **no spend** (no SEK cost, no Meta spend) — only balance, credits used, delivery (impressions, clicks, CTR, reach). | No spend fields visible. | — |

---

## 2) Admin journey — click-by-click

### Step A — Admin → Customers → [customer] → Billing

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| A.1 | Log in as **admin**; open **Admin** → **Customers**. | Customer list. | **GET /admin/customers** (or equivalent) |
| A.2 | Click a customer (e.g. customer name or row) to open **Customer detail** (/admin/customers/[customerId]). | Customer overview; tabs (Overview, Runs, Inventory, Billing). | **GET /admin/customers/:customerId** |
| A.3 | Open **Billing** tab. | Ledger entries; balance; Top up; Run burn; Plan controls. | **GET /admin/customers/:customerId/billing/ledger?limit=20** |
| A.4 | Top up: enter amount + optional note, submit. | Balance updates; new ledger entry. | **POST /admin/customers/:customerId/billing/topup** |
| A.5 | Run burn: click “Run burn for today” (or equivalent). | Job accepted; feedback. | **POST /admin/customers/:customerId/billing/burn** |
| A.6 | Change plan levers (billing mode, CPM, meta cap, margin) if shown; save. | Plan updated. | **POST /admin/customers/:customerId/ads/budget** |

### Step B — Admin spend view (admin-only, not from customer UI)

| # | Action | Expected UI result | Endpoint(s) |
|---|--------|--------------------|-------------|
| B.1 | On **Customer detail** → **Billing** tab: spend block loads (if implemented). | Spend (SEK) and/or insights for date range. | **GET /admin/customers/:customerId/performance/spend?since=…&until=…** |
| B.2 | Confirm: **Customer** Performance and Billing pages never link to or show this spend view. | Spend only visible in admin context. | — |

---

## 3) Common failure mapping

| Symptom | Likely cause | Where to look |
|---------|--------------|----------------|
| Dashboard never loads / 401 | Session missing or invalid; cookie not sent. | Network: GET /auth/me; Cookie header; CORS/credentials. |
| “Connect website” does nothing or 400 | Invalid URL; validation error. | Network: POST /inventory/source; response body (error, hint). |
| Crawl never starts / 400 | No active inventory source. | Complete Step 2 first; check GET /inventory/items has source. |
| Crawl stuck queued/running | Worker not running or job not picked. | Worker logs; queue (Redis); Runs page status. |
| No inventory after crawl | Crawl failed or source misconfigured. | **Runs** page: run status, errorMessage; **Ads diagnostics** (or run detail) for crawl logs. |
| Template config save fails | Invalid templateKey or validation. | Network: POST /templates/config; response issues. |
| Preview run not created | No template config or wrong config. | POST /templates/previews/run response; **Runs** page (type=preview). |
| Meta connect fails (OAuth) | Redirect/callback URL wrong; state invalid. | Redirect URL; /settings?meta=error; API logs (meta/oauth/callback). |
| Meta dev-connect 403 | ALLOW_DEV_META not true. | API env. |
| Ad account list empty / select fails | Token scope; ad account not returned. | GET /meta/ad-accounts response; **Settings** or **Meta smoke test** in Settings. |
| Ads publish disabled or fails | Prerequisites not met (website, inventory, templates, meta). | **Ads** page prerequisites; GET /ads/status. |
| Publish stuck queued | Ads worker not running. | Worker logs; **Ads Diagnostics** run status. |
| Performance empty / wrong mode | Meta not connected; ad account not selected; no campaign. | **Performance** hint; GET /performance/summary response (mode, hint). |
| Billing shows nothing / no plan | No budget plan for customer (e.g. not yet created). | GET /billing/status; **Admin** → Customer → Billing: create/plan. |
| Admin customer load 403 | Not admin; wrong headers. | **Admin** layout: getAdminHeaders(); cookie/session. |
| Ledger/topup/burn 404 or 400 | Wrong customerId or body. | Network: URL and body; API route. |

**Where to look (short):**

- **Runs:** /runs (crawl/preview status, errors).
- **Ads diagnostics:** /ads/diagnostics (ad run history, GET /ads/runs).
- **Admin QA:** Admin → Customers → [customer] (Billing tab: ledger, spend, triggers).
- **Health:** GET /health (API up).

---

## 4) BLOCKERS (missing UI steps required to complete the journey)

1. **No in-app link to Ads Diagnostics**  
   - **GET /ads/runs** is only triggered when **/ads/diagnostics** is opened.  
   - There is **no sidebar or in-app link** to /ads/diagnostics; the user cannot reach “Ads Diagnostics” using only the UI (must type URL).  
   - **Impact:** Journey step “Ads Diagnostics shows run history (GET /ads/runs)” is not completable by “UI only” unless we consider the main **Ads** page (which shows lastRuns via GET /ads/status) sufficient for “run history”. If the requirement is that the **Ads Diagnostics** page must be reachable by UI, this is a BLOCKER.

---

## 5) Conclusion

- **BLOCKER:** No in-app navigation to Ads Diagnostics (/ads/diagnostics). The journey step “Ads Diagnostics shows run history (GET /ads/runs)” requires opening that page; GET /ads/runs is only fired when /ads/diagnostics loads. Without a link, the step cannot be completed using only the UI.
- **All other** customer and admin journey steps are completable via the UI, and the listed backend calls are triggered as documented.

**Not READY** until the Ads Diagnostics BLOCKER is resolved (add an in-app link to /ads/diagnostics, or explicitly accept run history on main /ads via GET /ads/status as sufficient and remove the requirement to open Ads Diagnostics via UI).
