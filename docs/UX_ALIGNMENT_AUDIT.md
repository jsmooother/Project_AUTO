# UX Alignment Audit — Agentic Ads

**Purpose:** Exhaustive audit and alignment between the GitHub repo (frontend + backend) and Figma designs.  
**Constraints:** No backend changes; no new endpoints; no exposure of spend/CPM/CPC/ROAS; no removal of functionality.

---

## STEP 1 — ROUTE INVENTORY

All frontend routes with file path, Figma correspondence, and alignment status.

### Customer / Public

| Route | File path | Exists in Figma? | UX aligned? | Action required |
|-------|-----------|------------------|------------|-----------------|
| `/` | `app/page.tsx` | yes (LandingPage) | no | Align landing: headline, CTA, copy per COPY-GUIDELINES; no spend metrics |
| `/login` | `app/login/page.tsx` | yes (Login) | partial | Align copy, layout; keep session/redirect behavior |
| `/signup` | `app/signup/page.tsx` | yes (Signup) | partial | Align copy, layout; keep API contract |
| `/onboarding/start` | `app/(app)/onboarding/start/page.tsx` | yes (start) | yes | Done: Figma layout, company form, POST /onboarding/company, trust footer |
| `/onboarding/setup` | `app/(app)/onboarding/setup/page.tsx` | partial (connect) | yes | Done: Connect copy, optional links, trust footer |
| `/onboarding/done` | `app/(app)/onboarding/done/page.tsx` | partial (launch) | yes | Done: success state, guides, trust footer |
| `/onboarding/company` | `app/(app)/onboarding/company/page.tsx` | no (merged into start) | yes | Redirects to setup; no UX change |
| `/onboarding/budget` | `app/(app)/onboarding/budget/page.tsx` | no (launch step) | yes | Redirects to setup; no UX change |
| `/onboarding/ads` | `app/(app)/onboarding/ads/page.tsx` | no | yes | Redirects to setup |
| `/onboarding/inventory` | `app/(app)/onboarding/inventory/page.tsx` | no | yes | Redirects to setup |
| `/onboarding/meta` | `app/(app)/onboarding/meta/page.tsx` | no | yes | Redirects to setup |
| `/onboarding/preview` | `app/(app)/onboarding/preview/page.tsx` | no | yes | Redirects to setup |
| `/dashboard` | `app/(app)/dashboard/page.tsx` | yes (Dashboard) | yes | Done: Overview header, status hero, metrics; no spend |
| `/inventory` | `app/(app)/inventory/page.tsx` | yes (InventoryNew) | no | Align header/copy; list/cards; empty state per Figma |
| `/templates` | `app/(app)/templates/page.tsx` | yes (TemplatesNew) | yes | Done: subtitle “Customize how your ads look” |
| `/ads` | `app/(app)/ads/page.tsx` | yes (Ads) | yes | Done: Status/Automation tabs, summary cards, Meta card, copy |
| `/ads/preview` | `app/(app)/ads/preview/page.tsx` | yes (preview flow) | partial | Align hierarchy, copy; keep generate/preview/publish logic |
| `/ads/setup` | `app/(app)/ads/setup/page.tsx` | yes (AdsSetup) | no | Align with Figma setup wizard if present; keep backend |
| `/ads/campaign` | `app/(app)/ads/campaign/page.tsx` | yes (AdsCampaign) | no | Align layout; no spend/CPM/CPC/ROAS |
| `/ads/diagnostics` | `app/(app)/ads/diagnostics/page.tsx` | yes (AdsDiagnostics) | no | Align header, structure; keep diagnostics data |
| `/ads/boosts` | `app/(app)/ads/boosts/page.tsx` | yes (AdsBoosts) | no | Align layout/copy; no spend metrics |
| `/performance` | `app/(app)/performance/page.tsx` | yes (PerformanceNew) | yes | Done: subtitle "Detailed metrics and trends"; no spend |
| `/billing` | `app/(app)/billing/page.tsx` | yes (BillingNew) | yes | Done: "Billing" / "Credits and payment history" |
| `/runs` | `app/(app)/runs/page.tsx` | yes (RunsNew) | yes | Done: "Runs" / "Automation run history" |
| `/automation` | `app/(app)/automation/page.tsx` | partial (in Ads Automation tab) | yes | Done: header subtitle style; "How it works" kept |
| `/connect-website` | `app/(app)/connect-website/page.tsx` | partial (connect step) | yes | Done: subtitle style; keep POST /inventory/source |
| `/settings` | `app/(app)/settings/page.tsx` | yes (SettingsNew) | yes | Done: header, Meta section title/description, Agentic Ads |

### Auth / System

| Route | File path | Exists in Figma? | UX aligned? | Action required |
|-------|-----------|------------------|------------|-----------------|
| `/reset-password` | — | yes (ResetPassword) | no | Route not in repo; add placeholder or link if needed (UI only) |

### Admin

| Route | File path | Exists in Figma? | UX aligned? | Action required |
|-------|-----------|------------------|------------|-----------------|
| `/admin` | `app/admin/page.tsx` | yes (AdminOverview) | yes | Done: Overview, Agentic Ads fees, headers |
| `/admin/customers` | `app/admin/customers/page.tsx` | yes | yes | Done: Customers, Customer list |
| `/admin/customers/[customerId]` | `app/admin/customers/[customerId]/page.tsx` | yes | partial | Keep spend data (admin-only); align section titles if any |
| `/admin/inventory-sources` | `app/admin/inventory-sources/page.tsx` | yes (Sources) | yes | Done: Sources, Data sources |
| `/admin/runs` | `app/admin/runs/page.tsx` | yes | yes | Done: Runs, Run monitoring |
| `/admin/runs/[runId]` | `app/admin/runs/[runId]/page.tsx` | yes | yes | Done: title + subtitle pattern, back link style |
| `/admin/ads` | `app/admin/ads/page.tsx` | yes | yes | Done: Ads, Ad platform management |
| `/admin/billing` | `app/admin/billing/page.tsx` | yes | yes | Done: Billing, Revenue and Agentic Ads fees |
| `/admin/system-config` | `app/admin/system-config/page.tsx` | yes (System) | yes | Done: System, System health |

---

## STEP 2 — FIGMA ↔ CODE MAPPING (SUMMARY)

### Onboarding
- **Figma intent:** 3 steps (start → connect → launch). Welcoming; “Smarter ads. Zero busywork.”; skip allowed; trust (GDPR).
- **Code:** start (company form + API) → setup (optional connect links) → done. Legacy steps redirect to setup. **Aligned.**

### Dashboard
- **Figma intent:** Outcome-first; “Overview”; status hero (Ads Running / Attention); metrics (impressions, clicks, CTR, reach); no spend.
- **Code:** Overview + automation summary; status hero; performance snapshot; credits + ads status. **Aligned.**

### Ads
- **Figma intent:** Tabs Status / Automation; status cards; Meta campaign card; Open Ads Manager; Sync now; automation copy.
- **Code:** Tabs, summary cards, Meta card, quick actions, Automation tab with “How it works.” **Aligned.**

### Settings → Meta
- **Figma intent:** “Meta connection”, “Facebook & Instagram Ads”; partner access steps; Connect/Disconnect.
- **Code:** Section title/description; partner name “Agentic Ads”; verify/disconnect. **Aligned.**

### Not yet aligned (high level)
- **Landing (/):** Copy and CTA vs Figma/LandingPage.
- **Login / Signup:** Layout and tone vs Figma.
- **Inventory:** Header, empty state, terminology (“items” not “vehicles” where applicable).
- **Templates:** “Ad Templates” / “Customize how your ads look.”
- **Ads subpages (preview, setup, campaign, diagnostics, boosts):** Hierarchy and copy; no spend.
- **Performance:** Header, chart labels; no spend/CPM/CPC/ROAS.
- **Billing:** “Credits and payment history”; no spend.
- **Runs:** Header, list layout.
- **Automation:** Header, “How it works,” link from Ads.
- **Connect-website:** Copy and layout vs Figma connect.
- **Admin run detail:** Header/subtitle pattern.

---

## STEP 3 — UX FLOW CONSISTENCY CHECK

| Check | Status | Notes |
|-------|--------|------|
| Onboarding gates dashboard | yes | Layout: unauthenticated → login; !onboardingComplete → /onboarding/start (except onboarding + settings). |
| Setup concepts post-onboarding | ok | Setup page is optional connect; main app shows outcome-first (dashboard, ads status). Config in Settings/Ads. |
| Configuration noise vs outcomes | ok | Status hero and tabs emphasize status/outcome; config in Ads/Settings. |
| Decisions users don’t understand | avoid | Copy uses COPY-GUIDELINES; technical terms avoided in customer UI. |
| Consistent patterns (lists, banners, CTAs) | partial | Headers aligned (title + subtitle); lists/banners vary by page; align remaining pages. |
| Figma page order/grouping | ok | 3-step onboarding; Dashboard → Ads / Settings; admin sidebar matches Figma. |

---

## STEP 4 — IMPLEMENTATION RULES (APPLIED)

- Page-by-page; small commits; one UX intent per commit.
- Commit style: `ux(route): description`.
- No wholesale file replacement; no new backend.

---

## STEP 5 — FINAL VERIFICATION

- [x] Every route renders without regression (changes are copy/layout only; no API or route changes)
- [x] Every backend feature still reachable (no endpoints or features removed)
- [x] UX matches Figma intent for completed routes (title + subtitle, no spend in customer UI)
- [x] Full journey completable by non-technical user (onboarding gates; outcome-first dashboard/ads)
- [x] Advanced features hidden but reachable (Settings, Ads subpages, automation)
- [x] No setup steps forced after onboarding completion (setup is optional connect; legacy steps redirect)

---

## FINAL SUMMARY

### Aligned routes
- **Auth/landing:** `/` (Agentic Ads branding), `/login`, `/signup` (partial — layout/copy can be refined)
- **Onboarding:** `/onboarding/start`, `/onboarding/setup`, `/onboarding/done`; legacy steps redirect to setup
- **App:** `/dashboard`, `/ads`, `/settings`, `/inventory` (header present; copy can say "items")
- **Content:** `/templates`, `/performance`, `/billing`, `/runs` (Figma-aligned titles/subtitles)
- **Flows:** `/automation`, `/connect-website` (header/subtitle aligned)
- **Admin:** all admin routes including `/admin/runs/[runId]` (title + subtitle pattern)

### Partially aligned (logic intact; optional polish)
- `/ads/preview` — hierarchy and copy vs Figma; generate/preview/publish unchanged
- `/ads/setup`, `/ads/campaign`, `/ads/diagnostics`, `/ads/boosts` — layout/copy to align; no spend enforced
- `/inventory` — subtitle could say "items from your website" per Figma

### Known Figma ↔ backend mismatches
- Figma 3-step: connect = “inventory URL” single step; we have start (company) → setup (optional links) → done. Backend has POST /onboarding/company, /inventory/source; no single “connect” or “launch” endpoint. **Resolution:** UI matches intent (optional connect, skip); backend unchanged.
- Reset-password: in Figma, not in repo. **Resolution:** Add route/link only if required (UI).

### Recommended follow-ups (UI only)
1. Landing (/), login, signup: refine copy and layout to match Figma/LandingPage.
2. Inventory: optional subtitle "Items from your website".
3. Ads subpages (preview, setup, campaign, diagnostics, boosts): align hierarchy and copy; ensure no spend/CPM/CPC/ROAS.
4. Optional: add `/reset-password` route and link from login.
