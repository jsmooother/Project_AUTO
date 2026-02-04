# UI ↔ Backend Coverage Audit

**Date:** 2025-02-05  
**Scope:** Verify all existing backend functionality is reachable, wired, and usable through the current Web UI (customer + admin). No new features; gaps and wiring only.

---

## A) Coverage table

| Backend feature | UI location | Status | Notes |
|-----------------|-------------|--------|--------|
| **Ads** | | | |
| GET /ads/status | /ads, /ads/setup, /ads/campaign, /ads/diagnostics | OK | Used across Ads pages |
| POST /ads/settings | /ads, /ads/setup | OK | Wired |
| POST /ads/sync | /ads | OK | Sync button |
| POST /ads/publish | /ads | OK | Publish button |
| GET /ads/runs | /ads/diagnostics | OK | Ad run history |
| GET /ads/objects | (via /ads/status) | OK | Objects in status payload |
| **Meta** | | | |
| GET /meta/status | /settings, /dashboard | OK | Connection status |
| GET /meta/oauth/connect-url | /settings, /dashboard | OK | OAuth start |
| GET /meta/oauth/callback | (redirect) | OK | Redirect to /settings?meta=… |
| POST /meta/disconnect | /settings, /dashboard | OK | Disconnect button |
| POST /meta/dev-connect | /settings, /dashboard | OK | Dev-only when ALLOW_DEV_META=true |
| GET /meta/debug/smoke | /settings | OK | Smoke test in Settings |
| GET /meta/ad-accounts | /settings | OK | Ad account list |
| POST /meta/ad-accounts/select | /settings | OK | Select ad account |
| **Inventory (customer)** | | | |
| POST /inventory/source | /connect-website, /settings | OK | Single website source |
| GET /inventory/items | /inventory, /templates, /dashboard, /settings, /runs | OK | List items |
| **Crawl (customer)** | | | |
| POST /runs/crawl | /dashboard, /inventory, /runs | OK | Run crawl CTA |
| GET /runs?type=crawl | /runs | OK | Crawl run list |
| GET /runs?type=preview | /runs | OK | Preview run list |
| GET /runs?type=ads | /runs | **Partial** | Backend supports type=ads; UI only offers Crawl / Preview tabs. Ads runs visible on /ads and /ads/diagnostics, not in /runs list |
| **Performance** | | | |
| GET /performance/summary | /performance | OK | Summary + byDay, preset 7d/30d |
| GET /performance/insights | — | **Partial** | Backend supports level=campaign\|adset\|ad; no UI calls it. Summary is sufficient for current UX |
| Sim vs real mode | /performance | OK | Hint + empty state for disabled/paused |
| **Billing (customer)** | | | |
| GET /billing/status | /billing | OK | Balance, plan, credits used (7d/30d/MTD), delivery summary |
| POST /billing/topup | — | OK | Dev-only (ALLOW_DEV_BILLING_TOPUP); no customer UI by design |
| **Billing (admin)** | | | |
| GET /admin/customers/:id/billing/ledger | Admin → Customers → [customer] | OK | Ledger + balance on customer page |
| POST /admin/customers/:id/billing/topup | Admin → Customers → [customer] | OK | Top-up form |
| POST /admin/customers/:id/billing/burn | Admin → Customers → [customer] | OK | “Run burn for today” |
| Budget plan controls (POST …/ads/budget) | Admin → Customers → [customer] | OK | Budget section with levers |
| GET /admin/customers/:id/performance/spend | Admin → Customers → [customer] | OK | Spend view (admin-only) |
| **Admin surface** | | | |
| GET /admin/ads | /admin/ads | OK | Campaigns + Meta connections + summary |
| GET /admin/customers | /admin/customers | OK | Customer list |
| GET /admin/customers/:id | /admin/customers/[customerId] | OK | Customer detail |
| GET /admin/runs | /admin/runs | **Partial** | Lists crawl + preview only; no ads runs in list |
| GET /admin/runs/:runId | /admin/runs/[runId] | OK | Detail supports crawl, preview, ads (by ID) |
| POST /admin/customers/:id/runs/crawl | Admin → Customers → [customer] | OK | Trigger crawl |
| POST /admin/customers/:id/runs/preview | Admin → Customers → [customer] | OK | Trigger preview |
| POST /admin/customers/:id/ads/sync | — | **Missing** | Backend exists; no admin UI button |
| POST /admin/customers/:id/ads/publish | — | **Missing** | Backend exists; no admin UI button |
| POST /admin/customers/:id/crawl/real | — | **Missing** | Backend exists; no admin UI (real ivars crawl) |
| GET /admin/inventory-sources | /admin/inventory-sources | OK | Table of sources |
| GET /admin/customers/:id/inventory/sample | Admin → Customers → [customer] | OK | Inventory sample (QA) |
| **Other backend** | | | |
| /v1/data-sources, /v1/items | — | **Missing** | Different model (dataSources/items); no UI. Customer flow uses inventory_sources + inventory_items |
| Support cases routes | — | Not audited | Not in prompt scope |

---

## B) Gaps

1. **Admin Billing page (/admin/billing)**  
   - Stub only: “Billing not implemented.” All real admin billing (ledger, top-up, burn, budget) lives under **Admin → Customers → [customer]** (Billing section).  
   - **Gap:** Admin nav “Billing” is a dead end; no aggregate billing view.

2. **Admin runs list does not include ads runs**  
   - GET /admin/runs returns only crawl and preview types. Ads runs exist in DB and are shown in GET /admin/runs/:runId when opening by ID (e.g. from customer page).  
   - **Gap:** No way to list or filter ads runs from Admin → Runs.

3. **Customer Runs page has no “Ads runs” tab**  
   - GET /runs?type=ads is implemented; /runs UI only has “Crawl runs” and “Preview runs.” Ads runs are visible on /ads and /ads/diagnostics.  
   - **Gap:** Unified run history on /runs does not expose ads runs (consistency/polish).

4. **Admin: no UI to trigger ads sync/publish or real crawl**  
   - POST /admin/customers/:id/ads/sync, POST …/ads/publish, POST …/crawl/real exist; admin customer page has buttons for crawl and preview only.  
   - **Gap:** Backend capabilities not reachable from admin UI.

5. **GET /performance/insights (level=campaign|adset|ad)**  
   - Backend supports level and preset; customer Performance page only uses /performance/summary.  
   - **Gap:** No UI for campaign vs adset vs ad breakdown (optional enhancement).

6. **/v1/data-sources and /v1/items**  
   - Backend exists; no Web UI uses it. Customer flow is inventory_sources + inventory_items (connect-website, inventory).  
   - **Gap:** Either future surface or legacy; currently no UI entry point.

---

## C) Blocking vs non-blocking

| Item | Classification | Reason |
|------|----------------|--------|
| Admin Billing page stub | **NON-BLOCKER** | All actions available under Admin → Customers → [customer]. Only nav entry is misleading. |
| Admin runs list missing ads runs | **NON-BLOCKER** | Admin can open ads run by ID from customer context; listing is diagnostic. |
| Customer /runs missing “Ads runs” tab | **NON-BLOCKER** | Ads runs visible on /ads and /ads/diagnostics; polish/consistency. |
| Admin no buttons for ads/sync, ads/publish, crawl/real | **NON-BLOCKER** | Customer can trigger sync/publish from /ads; admin triggers are ops convenience. |
| GET /performance/insights not used | **NON-BLOCKER** | Summary covers current needs; level breakdown is enhancement. |
| /v1/data-sources and /v1/items no UI | **NON-BLOCKER** | Separate model; current product uses inventory_*; not required for e2e. |

**No BLOCKERs identified.** All critical customer and admin flows (connect website → inventory → templates → ads → performance → billing; admin customer detail with ledger, top-up, burn, budget, spend) are wired and reachable. Gaps are polish, diagnostics, or alternate backends without UI.

---

## D) Summary

- **Customer UI:** Ads, Meta (connect, ad account, OAuth, dev-connect), inventory (source + items), crawl (trigger + runs), preview runs, templates (config, previews, approve), performance summary (sim/real/empty), and billing status (credits, delivery) are all reachable and wired.  
- **Admin UI:** Customers, customer detail (billing ledger, top-up, burn, budget, spend, crawl/preview triggers, inventory sample), admin ads overview, admin runs (crawl/preview list + detail for any run type), and inventory-sources list are wired. Admin Billing page is a stub; real billing is per-customer.  
- **Identified gaps:** Stub admin Billing page, no ads runs in admin/customer run lists, no admin UI for ads sync/publish/real crawl, no use of /performance/insights by level, no UI for /v1/data-sources. All classified non-blocking.

---

**System is ready for full end-to-end UI testing.**  
No BLOCKERs; remaining gaps are non-blocking (admin polish, optional insights, and unused v1 APIs).
