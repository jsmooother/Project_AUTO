# Onboarding & Dashboard UI QA Checklist

Run this in one pass with **DevTools → Network tab (Preserve log ON)**. Use one dedicated test customer (e.g. ivarsbil source, `META_TEST_MODE` override, preview/publish in PAUSED mode) for deterministic checks.

---

## 1) Full UI test (customer journey)

### A. Auth + Gate

- [ ] Go to `/dashboard` while **logged out** → should land on `/login`
- [ ] Log in → should be redirected into onboarding if not complete

**Pass if:** No infinite redirects, no 401 loops, no blank screens.

---

### B. Onboarding Wizard (happy path)

1. [ ] **/onboarding/start** → Click "Get started"
2. [ ] **Inventory** – Enter URL → Save → Run crawl → Wait until items > 0
3. [ ] **Templates** – Approve templates
4. [ ] **Meta** – Connect / select ad account / verify partner access (or dev-mode sim path)
5. [ ] **Ads** – Fill geo, radius, formats, CTA → Save → confirm gate passes → Continue
6. [ ] **Budget** – Billing status loads → Finish → land on `/dashboard`

**Pass if:** Each step shows “OK” and the Continue button unlocks as expected.

---

### C. Post-onboarding dashboard

- [ ] Dashboard shows **metrics + upsell banners**, not onboarding checklists
- [ ] Check links: Ads, Performance, Billing, Settings

**Pass if:** No spend leakage anywhere customer-scoped (no CPM/CPC/spend on customer pages).

---

## 2) Admin checks (~5 min)

- [ ] **/admin/customers** → Open test customer
- [ ] **Billing tab:** Top up → Run burn → Verify ledger updates
- [ ] Verify **spend is visible only in admin**, never on customer pages

**Pass if:** Admin-only spend never appears in customer UI.

---

## 3) When something fails – capture this

1. **Network:** The request that failed – URL, status code, response body (or JSON error)
2. **UI:** Screenshot of the state
3. **Step:** Which checklist step you were on

Paste that (especially failing step + network response) to get an exact patch (UI or API).

---

## 4) Suggested local test accounts

- **One dedicated test customer:**
  - Crawl source (e.g. ivarsbil) working
  - `META_TEST_MODE` override (your ad account)
  - Can run preview + publish in PAUSED mode

This keeps UI checks deterministic and repeatable.
