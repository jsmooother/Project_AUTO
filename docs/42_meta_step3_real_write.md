# Meta Step 3: First Real Write Call (PAUSED Test Campaign)

## Overview

Step 3 adds a **real** Meta API write path for the Ads publish flow. When `ALLOW_REAL_META_WRITE=true`, the ADS_PUBLISH worker job creates a **PAUSED** campaign and ad set in the user's selected Meta ad account. No spend occurs; campaigns are created in a paused state only.

- **Additive-only:** Existing OAuth, ad account selection, and sim mode unchanged.
- **Safe:** Campaigns and ad sets are created with `status: "PAUSED"`.
- **Minimal:** Step 3 does not create ads/creatives (that’s Step 4).

---

## Environment Variables

### Required for real write

```bash
# Enable real Meta API calls for campaign creation (default: false)
ALLOW_REAL_META_WRITE=true

# Meta OAuth – recommended scopes for creating campaigns
META_OAUTH_SCOPES=ads_management,business_management
```

**Important:** Changing `META_OAUTH_SCOPES` requires users to **reconnect** their Meta account so a new token is issued with the new scopes.

### Optional

```bash
# Graph API version (default: v21.0)
META_GRAPH_VERSION=v21.0
```

### Mode precedence

1. **Real mode:** `ALLOW_REAL_META_WRITE=true` → create real PAUSED campaign + ad set in Meta.
2. **Sim mode:** `ALLOW_DEV_ADS_PUBLISH_SIM=true` (and real mode off) → placeholder IDs only.
3. **Disabled:** Neither flag → publish fails with a clear hint.

---

## Required Scopes

- **ads_management** – Required to create campaigns and ad sets.
- **business_management** – Access to ad accounts and business assets.

Reconnect is required after changing scopes. Document this for users (e.g. in Settings or docs).

---

## Tunnel / Redirect URL Reminder

For real OAuth (not dev-connect):

- Use a tunnel (e.g. ngrok, cloudflared) if testing from localhost.
- Set `META_REDIRECT_URL` to the **exact** callback URL (e.g. `https://your-tunnel.ngrok.io/meta/oauth/callback`).
- Meta requires the redirect_uri to match byte-for-byte.

---

## Step-by-Step Browser Test

### 1. Connect Meta

- Go to **Settings → Connected Meta account**.
- Connect via OAuth (or Dev: Fake Connect if testing without real Meta).
- Ensure status is **Connected**.

### 2. Select ad account

- In **Settings → Meta**, open **Ad Account Selection**.
- Choose an ad account from the dropdown and click **Save Selection**.
- Confirm “Selected account” is shown.

### 3. Configure Ads settings

- Go to **Ads** (or **Ads → Setup**).
- Set **Geo** (e.g. radius: Stockholm, 25 km – stored but Step 3 uses a simple geo stub).
- Enable at least one **format** (e.g. Feed).
- Save settings.

### 4. Enable real write mode

- In the environment where the **worker** runs, set:
  ```bash
  ALLOW_REAL_META_WRITE=true
  ```
- Restart the worker so it picks up the new env.

### 5. Publish

- Go to **Ads** overview.
- Click **Publish Campaign** (or equivalent CTA).
- Wait for the ADS_PUBLISH job to complete.

### 6. Verify

- **Ad runs:** In **Ads → Diagnostics** (or **Runs**), the latest run should be **success**.
- **Meta objects:** In **Ads → Campaign** (or status response), confirm:
  - `meta_ad_objects.campaign_id` is set (real Meta ID).
  - `meta_ad_objects.adset_id` is set (real Meta ID).
  - Status can be `paused` (campaign/ad set are PAUSED in Meta).
- **Meta Ads Manager:** Open [Ads Manager](https://business.facebook.com/adsmanager/manage/campaigns) and confirm a **PAUSED** campaign named “Project Auto - Test Campaign” and ad set “Project Auto - Test Ad Set”.

---

## API and Worker Behavior

### GET /ads/status

Response includes:

- **derived.metaWriteMode:** `"real"` | `"sim"` | `"disabled"` (from env flags, no secrets).

### POST /ads/publish

- Unchanged: still enqueues the **ADS_PUBLISH** job.
- Error shapes remain consistent.

### ADS_PUBLISH job (worker)

- **Real mode:**  
  - Loads `meta_connections` (connected + `selected_ad_account_id` + valid access token).  
  - Creates PAUSED campaign via `POST /act_{ad_account_id}/campaigns`.  
  - Creates PAUSED ad set via `POST /act_{ad_account_id}/adsets` with simple targeting (e.g. `countries: ["SE"]` for Step 3).  
  - Writes returned IDs to `meta_ad_objects` and sets `ad_settings.last_published_at`, clears `last_error`.  
  - On Meta API error: sets `ad_runs.status = failed`, `error_message`, and `meta_ad_objects.status = error` / `ad_settings.last_error` as appropriate.

- **Sim mode:**  
  - Unchanged: placeholder IDs, no Meta API calls.

- **Disabled:**  
  - Job fails with a clear message: enable `ALLOW_REAL_META_WRITE` or `ALLOW_DEV_ADS_PUBLISH_SIM`.

---

## Targeting Note (Step 3)

Step 3 uses **minimal targeting** (e.g. `geo_locations.countries: ["SE"]`) to avoid validation issues. User-facing geo settings (radius/regions) are saved and can be used in later steps; the worker may log “geo stub” for Step 3.

---

## Troubleshooting

| Issue | Check |
|-------|--------|
| Publish fails with “Ads publish is disabled” | Set `ALLOW_REAL_META_WRITE=true` or `ALLOW_DEV_ADS_PUBLISH_SIM=true` and restart worker. |
| “No ad account selected” | Select an ad account in Settings → Meta and save. |
| “Invalid Meta access token” | Reconnect Meta in Settings. |
| Meta API 100 / validation error | Check Meta docs for required fields; Step 3 uses minimal campaign + ad set fields and simple targeting. |
| Campaign not visible in Ads Manager | Confirm correct ad account and that the run succeeded; check `meta_ad_objects` and `ad_runs` in DB. |

---

---

## Expected Success Criteria

- **Health:** `GET /health` returns `ok: true`, `db: true`, `redis: true`.
- **Meta:** `GET /meta/status` returns `status: "connected"` and `selectedAdAccountId` set.
- **Ads status:** `GET /ads/status` returns `derived.metaWriteMode: "real"` (or `"sim"` for dev) and prerequisites met as needed for publish.
- **Publish:** `POST /ads/publish` returns `runId` and `jobId` (or deduped).
- **Run outcome:** The latest ad run reaches `status: "success"` within the poll window; on failure, `error_message` is set and visible.
- **Objects:** After success, `GET /ads/objects` (or `objects` in `GET /ads/status`) has `campaignId` and `adsetId` set; campaign/ad set are PAUSED in Meta.

---

## One-Command Smoke Script

**Script:** `scripts/meta-step3-smoke.sh`

**What it does:**

1. Calls `GET /health` and exits with failure if `db` or `redis` is false.
2. Resolves session: logs in with `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`, or uses `SESSION_COOKIE` + `CUSTOMER_ID`, or uses `COOKIE_FILE` and gets `CUSTOMER_ID` from `GET /auth/me` (e.g. after logging in in browser).
3. Calls `GET /meta/status` and fails if not connected or `selectedAdAccountId` is missing.
4. Calls `GET /ads/status` and prints `derived.metaWriteMode` and prerequisites.
5. Triggers `POST /ads/publish`.
6. Polls `GET /ads/runs` until the latest publish run is `success` or `failed` (max 90s).
7. If **failed:** prints `error_message` and exits 1.
8. If **success:** prints `meta_ad_objects` `campaign_id` and `adset_id` (from `GET /ads/objects`).

**How to run:**

```bash
# API and worker must be running; DB and Redis up (e.g. docker compose up -d).

# Option A: Login with credentials
TEST_USER_EMAIL=you@example.com TEST_USER_PASSWORD=yourpassword ./scripts/meta-step3-smoke.sh

# Option B: Session cookie + customer ID (e.g. from browser or previous run)
SESSION_COOKIE=<session-id> CUSTOMER_ID=<uuid> ./scripts/meta-step3-smoke.sh

# Option C: Cookie file only (script gets CUSTOMER_ID from GET /auth/me)
# After logging in in browser, save the session cookie to a file, then:
COOKIE_FILE=/path/to/cookies.txt ./scripts/meta-step3-smoke.sh
```

Optional: `API_URL` (default `http://localhost:3001`), `COOKIE_FILE` (default `/tmp/meta-step3-smoke-cookies.txt`).

The user must have Meta connected and an ad account selected (Settings → Meta); for real writes, worker must have `ALLOW_REAL_META_WRITE=true`.

---

## Related Docs

- `docs/37_meta_oauth_setup.md` – OAuth setup
- `docs/41_meta_smoke_test.md` – Smoke test (read-only)
- `docs/40_ads_ui_api_contract.md` – Ads API contract
