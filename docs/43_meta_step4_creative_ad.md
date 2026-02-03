# Meta Step 4: Create Ad Creative + Ad (PAUSED, additive-only)

## Overview

Step 4 extends the real publish flow to create an **Ad Creative** (link ad) and an **Ad** using template context, without starting delivery or spend. Campaign and ad set remain PAUSED; the new creative and ad are created in PAUSED state. Catalog/product ads are out of scope for this step.

- **Additive-only:** Step 3 (campaign + ad set) unchanged; Step 4 runs after Step 3 or when campaign/adset already exist.
- **Prereqs (enforced):** Step 3 succeeded (meta_ad_objects has campaign_id + adset_id), Meta connected + selectedAdAccountId, template config approved and at least one preview exists, inventory or META_DESTINATION_URL for link.

---

## Environment Variables

### Required for Step 4 (real write)

```bash
# Step 3 (if not already set)
ALLOW_REAL_META_WRITE=true
META_OAUTH_SCOPES=ads_management,business_management

# Step 4: Ad Creative + Ad
META_PAGE_ID=<your-facebook-page-id>   # Required. Facebook Page ID for the ad creative.
META_DESTINATION_URL=                   # Optional. Destination URL for the ad link. Fallback: inventory source website URL.
```

- **META_PAGE_ID:** Required to create ad creatives. The Page must be linked to the ad account; the Meta user must have Admin or Editor role on the Page.
- **META_DESTINATION_URL:** Optional. If set, used as the link URL in the creative. If not set, the worker uses the customer’s first inventory source `website_url` (connect a website first).

---

## Prerequisites (enforced by worker)

1. **Step 3 succeeded:** `meta_ad_objects` has `campaign_id` and `adset_id` (worker runs Step 3 if missing).
2. **Meta:** Connection status `connected` and `selected_ad_account_id` set.
3. **Template:** Config approved and at least one preview exists for that config.
4. **Link URL:** Either `META_DESTINATION_URL` is set or the customer has at least one inventory source with `website_url`.

---

## Worker Behavior (real mode)

1. **Step 3 (if needed):** If `campaign_id` or `adset_id` is missing, create PAUSED campaign and ad set as in Step 3; update `meta_ad_objects` with `last_publish_step = 'adset'`.
2. **Ad Creative:**  
   - POST `act_{adAccountId}/adcreatives`  
   - Body: link ad with `object_story_spec.page_id`, `link_data.link` (META_DESTINATION_URL or inventory source URL), `link_data.message` (brandName or "New arrivals"), `call_to_action` LEARN_MORE.  
   - Store `creative_id`; set `meta_ad_objects.last_publish_step = 'creative'`.
3. **Ad:**  
   - POST `act_{adAccountId}/ads`  
   - Body: `adset_id`, `creative: { creative_id }`, `status: "PAUSED"`.  
   - Store `ad_id`; set `meta_ad_objects.last_publish_step = 'ad'`.
4. **Status:** `meta_ad_objects.status` stays `"paused"`; `ad_settings.status` stays `"active"`. On failure, worker sets `meta_ad_objects.last_publish_error` and fails the ad run with `error_message` + hint.

---

## API

- No new endpoints.  
- **GET /ads/objects** and **GET /ads/status** (`objects`) return `creativeId`, `adId`, `lastPublishStep`, `lastPublishError` from `meta_ad_objects`.

---

## Web UI

- **/ads/campaign:** Meta Object IDs section includes **Creative ID** and **Ad ID** when present. Pause/Resume remains disabled for MVP.

---

## Test Steps

1. Ensure Step 3 is done (campaign + ad set exist and are PAUSED).
2. Set worker env: `META_PAGE_ID`, optionally `META_DESTINATION_URL` (or connect a website for inventory source URL).
3. Ensure template is approved and at least one preview exists.
4. Trigger **Publish Campaign** (POST /ads/publish or UI).
5. **Verify:**  
   - Latest ad run is **success**.  
   - `GET /ads/objects` or `/ads/status` shows `creativeId` and `adId`.  
   - In Meta Ads Manager, the ad creative and ad exist and are **PAUSED**.

---

## Related Docs

- `docs/42_meta_step3_real_write.md` – Step 3 (campaign + ad set)
- `docs/40_ads_ui_api_contract.md` – Ads API contract
- `docs/37_meta_oauth_setup.md` – OAuth setup
