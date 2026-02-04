# Test Steps A–C: Full Feedback Report

**Date:** 2026-02-04  
**Scope:** Real crawl (ivarsbil) → Ads publish → Performance page (Meta fetch).

---

## Step A — Real crawl (ivarsbil)

### Actions
- **Customer:** `14c69a08-9852-4240-b14a-4f05300ecc10` (Foo AB)
- **Trigger:** `POST /admin/customers/:customerId/crawl/real` with body:
  `{"headUrl":"https://www.ivarsbil.se/bilar-i-lager/","limit":10,"site":"ivarsbil.se"}`
- **Result:** `runId=ac5f9510-b53a-4f87-a400-8cb193336922`, `jobId=21`
- **Poll:** Crawl run reached `status=success` within ~4 seconds.

### Verification (DB)
| Check | Result |
|-------|--------|
| Total items | 10 |
| With `details_json` | 10 |
| Price ≥ 50k (priceAmount or price) | 10 |
| Has image (primaryImageUrl or images) | 10 |
| URL is HTTPS | 10 |

### Sample rows (latest 5)
- Titles present and decoded (e.g. "Subaru Outback 2.5...", "SsangYong Musso KGM...").
- `price` / `details_json.priceAmount`: 324900, 623750, 119000, 69900, 109000 (SEK).
- `url`: all `https://www.ivarsbil.se/bil/...`.
- `primaryImageUrl`: all `https://d1tvhb2wb3kp6.cloudfront.net/...`.

### Outcome: **PASS**
- Real crawl for 10 items completed successfully.
- All items have price ≥ 50k, image (HTTPS), destination (HTTPS), and `details_json` populated.

---

## Step B — Publish campaign (PAUSED) with 1–2 ads

### Actions
- **Customer:** Same as Step A (`14c69a08-9852-4240-b14a-4f05300ecc10`).
- **Trigger:** `POST /admin/customers/:customerId/ads/publish` with body `{}`.

### Issue found and fix
- **First attempt:** API returned DB error:  
  `new row for relation "ad_runs" violates check constraint "ad_runs_trigger_check"`.  
  Cause: admin route inserted `trigger: "admin"` but `ad_runs` only allows `'manual'` or `'scheduled'`.
- **Fix:** In `apps/api/src/routes/admin.ts`, both:
  - `POST /admin/customers/:customerId/ads/publish`
  - `POST /admin/customers/:customerId/ads/sync`  
  now use `trigger: "manual"` instead of `trigger: "admin"`.

### After fix
- **Second attempt:** `POST .../ads/publish` returned `runId=4ee5dddb-9bcc-42db-8f5b-9e1ce901fea5`, `jobId=3`.
- **Ad run result:** `status=failed`, `error_message=Ad settings not found. Configure ads settings first.`
- **meta_ad_objects:** No row for this customer (campaign/adset/ad IDs not created).

### Interpretation
- **Flow:** Admin publish → ad_runs insert → ADS_PUBLISH job → validation fails (no ad_settings) → run marked failed. Behaviour is correct.
- **Step B for this customer:** **FAIL (expected)** — customer "Foo AB" has no ad_settings. To get a full pass for Step B on this customer you would:
  1. Create `ad_settings` (geo, formats, etc.) for the customer, and optionally connect Meta (real or dev).
  2. Re-run `POST .../ads/publish` and confirm run succeeds and `meta_ad_objects` is filled.

### Alternative customer (sim mode)
- **Customer** `1c0c0921-e837-4b7f-a402-006ee2744039` (Test Org) has:
  - `ad_settings` and `meta_connections` (connected).
  - `meta_ad_objects`: `campaign_id=dev-campaign-1c0c0921`, `adset_id=dev-adset-1c0c0921`, `ad_id=dev-ad-1c0c0921`, `status=active` (sim placeholders).
- So Step B has **already been run successfully** for this customer in sim mode; we use them for Step C.

### Outcome: **PARTIAL**
- Admin publish endpoint works after trigger fix.
- Step B **fails** for the Step A customer due to missing ad_settings (by design).
- Step B **succeeds** in sim for another customer (meta_ad_objects with dev-* IDs).

---

## Step C — Performance page (Meta fetch)

### Actions
- **Customer with campaign (sim):** `1c0c0921-e837-4b7f-a402-006ee2744039`
- **Request:** `GET /performance/summary?preset=last_7d` with `x-customer-id`.
- **Also tested:** `preset=last_30d` and customer without Meta/campaign.

### Response (customer with sim campaign, last_7d)
- **mode:** `"sim"`
- **meta:** `connected: true`, `selectedAdAccountId: "act_123456789"`
- **objects:** `campaignId`, `adsetId`, `adId` (dev-* IDs)
- **dateRange:** `preset=last_7d`, `since=2026-01-28`, `until=2026-02-04`
- **totals:** `impressions=10000`, `reach=8000`, `clicks=305`, `ctr=3.05` (no spend fields)
- **byDay:** 7 entries with `date`, `impressions`, `clicks`
- **hint:** "Dev/sim mode — showing synthetic metrics. Not real Meta spend."
- **_debug:** `adAccountId`, `campaignId`, `graphVersion=v21.0`, `hasData=true`

### Response (customer without campaign)
- **mode:** `"disabled"`
- **hint:** "Connect Meta account in Settings → Meta to view performance data."
- **totals:** all zeros; **dateRange** present.

### Response (last_30d)
- **mode:** `"sim"`, **byDay** length 30, **dateRange** preset `last_30d`, since/until correct.

### Outcome: **PASS**
- No errors; valid response structure.
- Sim mode: synthetic metrics and debug IDs as expected.
- Disabled mode: correct hint and zeros.
- Date presets and since/until correct; no spend exposed.

---

## Summary

| Step | Outcome | Notes |
|------|---------|--------|
| **A** | **PASS** | Real crawl 10 items; all with price≥50k, image https, url https, details_json. |
| **B** | **PARTIAL** | Publish works after trigger fix; fails for Step A customer (no ad_settings); sim customer already has meta_ad_objects. |
| **C** | **PASS** | Performance summary returns valid structure; sim/disabled behave as designed; debug panel data present. |

### Fix applied
- **Admin ads publish/sync:** use `trigger: "manual"` so `ad_runs` insert satisfies `CHECK (trigger IN ('manual', 'scheduled'))`.

### Recommended follow-up
1. **Step B full pass:** Create ad_settings (and optionally Meta connection) for the Step A customer, then re-run ads publish; confirm meta_ad_objects populated (real or sim).
2. **Real Meta:** With real OAuth + PAUSED campaign, call `GET /performance/summary` and confirm either zeros (PAUSED) or real insights, with no errors and correct _debug.
3. **UI:** Open `/performance` in browser for the sim customer; confirm cards, table, date selector, and (if enabled) Meta debug panel.
