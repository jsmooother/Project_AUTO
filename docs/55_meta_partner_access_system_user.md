# Meta Option 1: Partner Access + System User Token

This document describes the **production-grade** Meta architecture for Project Auto: ads are created in the **customer’s** Meta Ad Account; customers grant access once by adding Project Auto’s Business Manager as a **Partner**; the platform uses **Project Auto’s System User token** for all Graph API calls (not the customer’s OAuth token).

## Overview

- **Customer OAuth** = optional bootstrap UX (ad account discovery / selection).
- **System User token** = source of truth for all Graph API writes and insights fetch.
- **Partner access** = customer adds Project Auto as a partner to their Business Manager and grants access to the selected ad account; we verify with `GET /meta/permissions/check`.

Customer UI never shows spend/CPC/CPM; admin can view spend separately (existing rule).

## Environment variables

Required for Option 1:

| Variable | Description |
|----------|-------------|
| `META_BUSINESS_MANAGER_ID` | Project Auto’s Meta Business Manager ID |
| `META_SYSTEM_USER_ACCESS_TOKEN` | System User access token (long-lived) |
| `META_APP_ID` | Meta App ID (optional but recommended for OAuth discovery) |
| `META_APP_SECRET` | Meta App Secret |
| `META_REDIRECT_URL` | OAuth callback URL (e.g. `https://your-domain.com/meta/oauth/callback`) |
| `META_GRAPH_VERSION` | e.g. `v21.0` (already exists) |

Optional:

| Variable | Description |
|----------|-------------|
| `META_PARTNER_NAME` | Display name for “Add partner” instructions (e.g. `Project Auto`) |

## Server setup

### 1. Create or use a Meta Business Manager (BM)

- Go to [business.facebook.com](https://business.facebook.com).
- Create a Business Account (or use an existing one) for “Project Auto”.
- Note the **Business Manager ID** (Settings → Business Info) and set `META_BUSINESS_MANAGER_ID`.

### 2. Create a Meta App (if not already)

- Go to [developers.facebook.com/apps](https://developers.facebook.com/apps).
- Create an app (or use existing). Add **Facebook Login** and **Marketing API** products.
- Note **App ID** and **App Secret** → `META_APP_ID`, `META_APP_SECRET`.

### 3. Create a System User

- In **Business Manager** → **Business Settings** → **Users** → **System Users**.
- Click **Add** and create a system user (e.g. “Project Auto API”).
- **Assign assets**: give this system user **No access** to ad accounts by default; access will be granted per customer via **Partners** (see below).

### 4. Generate System User token

- Open the system user → **Generate New Token**.
- Select your **App**.
- Permissions: `ads_management`, `business_management`, and any other required for your flows.
- Choose token expiry (e.g. 60 days; rotate before expiry).
- Copy the token → set `META_SYSTEM_USER_ACCESS_TOKEN` on the server (never in client or repo).

### 5. Add app to Business Manager

- In Business Manager → **Business Settings** → **Accounts** → **Apps**.
- Add your app to the business if not already.
- Ensure the system user is associated with this business.

## Customer flow: Grant Partner Access

1. **Connect Meta (optional)**  
   Customer logs in with Facebook (OAuth). We use this to **list their ad accounts** and let them pick one. No ongoing use of their token.

2. **Select ad account**  
   Customer selects the ad account they want to use in Settings → Meta (Step 2).

3. **Grant Partner Access**  
   - Customer goes to **Meta Business Manager** → **Business Settings** → **Users** → **Partners**.
   - Clicks **Add** → **Give a partner access to your assets**.
   - Selects **Ad accounts** (and optionally other assets).
   - Chooses the ad account they selected in Project Auto.
   - Assigns **Project Auto** (your partner business) **Admin** or **Advertiser** access.
   - Saves.

4. **Verify**  
   In Project Auto **Settings → Meta**, Step 3, customer clicks **Verify**.  
   The app calls `GET /meta/permissions/check`, which uses the **system user token** to call `GET /act_{ad_account_id}?fields=id,name,account_status,currency`.  
   - If 200 → **Partner access verified**.  
   - If 403/400 → **Access not granted yet** with an actionable hint.

Once verified, Ads pages proceed normally (create/sync campaigns in that ad account using the system user token).

### Non-technical customer steps (Settings → Meta, Step 3)

The Step 3 UI is written so non-technical customers can complete partner access without confusion:

1. **Copy-paste ready**  
   Step 3 shows **Partner name** (e.g. “Project Auto”, from `META_PARTNER_NAME`) and **Partner Business Manager ID** (from `META_BUSINESS_MANAGER_ID`) in dedicated rows. A **Copy** button next to the Business Manager ID lets the customer copy the full ID when the server exposes it (e.g. in development or when `META_EXPOSE_FULL_BM_ID_FOR_SETTINGS=true`); otherwise a masked value is shown and copied.

2. **Direct link**  
   A link to [Meta Business Settings](https://business.facebook.com/settings) is shown so the customer can open the right page.

3. **Explicit instructions**  
   The UI lists exactly what to do in plain language:
   - Add partner using the Partner Name and Partner Business Manager ID shown.
   - Grant access to the selected ad account for the partner.
   - Grant permission to manage ads and view performance (manage ads + view performance).

4. **Verify**  
   After completing the steps in Meta, the customer clicks **Verify** in Project Auto. If the Business Manager ID is not configured on the server, a banner “Meta not configured for production” is shown and **Verify** is disabled.

## API behaviour

- **Token resolution** (`getEffectiveMetaAccessToken(customerId)`):
  - If `ALLOW_DEV_META` and connection has dev placeholder → use dev token (sim).
  - If `META_TEST_MODE` and customer matches test customer → use **system user token** (ad account override only).
  - Otherwise → use **system user token**.
  - If no system token → mode `none` (no Meta calls).

- **Writes** (publish, sync, creatives): always use the resolved token (system user in production).
- **Insights** (customer scope): use system user token; **do not expose spend/CPC/CPM** to customer endpoints.
- **Admin** insights: can continue to use spend; same token resolution.

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| “Meta not configured for production” | `META_SYSTEM_USER_ACCESS_TOKEN` not set on API/worker. |
| “Access not granted yet” | Customer has not added Project Auto as partner, or has not assigned the correct ad account to the partner. |
| “Select an ad account in Settings” | Customer has not completed Step 2 (or OAuth did not return ad accounts). |
| Token expired | Regenerate system user token in Business Manager and update `META_SYSTEM_USER_ACCESS_TOKEN`. |

## Compatibility

- **Dev / test mode**: `ALLOW_DEV_META`, `META_TEST_MODE`, sandbox connect, and test ad account override continue to work; test mode uses **system user token** for API calls (ad account override only).
- **Ads prerequisite**: Ads flow still requires connection + selected ad account; **Verify** (Step 3) is the recommended step before publishing so that system user actually has access.

---

## How to go live (ops checklist)

Use this checklist when deploying to production (e.g. Railway, Vercel, or your host).

### 1. Set environment variables

On the API and Worker (Railway/Vercel/host):

- **Required for Option 1**
  - `META_SYSTEM_USER_ACCESS_TOKEN` — System User token (long-lived; rotate before expiry).
  - `META_BUSINESS_MANAGER_ID` — Project Auto Business Manager ID (optional for display in UI).
- **Optional**
  - `META_PARTNER_NAME` — Display name in Settings (e.g. `Project Auto`).
- **OAuth (recommended for ad account discovery)**
  - `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URL` — Set to your production app and callback URL (e.g. `https://your-domain.com/meta/oauth/callback`).
- **Real writes**
  - `ALLOW_REAL_META_WRITE=true` — Only when you are ready to create real (paused) campaigns.

Do **not** commit tokens or secrets; use the platform’s secret/env UI.

### 2. Meta App configuration

- In [developers.facebook.com](https://developers.facebook.com/apps) → your app:
  - **Facebook Login → Settings**: add production **Valid OAuth Redirect URIs** (e.g. `https://your-domain.com/meta/oauth/callback`).
- Ensure the app has **Marketing API** and required permissions (`ads_management`, `business_management`) for the System User.

### 3. Customer onboarding flow

1. Customer signs up and logs in.
2. **Settings → Meta**
   - **Step 1 (optional):** Connect Meta — customer uses OAuth to list ad accounts.
   - **Step 2:** Select the ad account to use.
   - **Step 3:** Grant partner access — customer adds your Business Manager as a partner in [Meta Business Settings](https://business.facebook.com/settings) and grants access to the selected ad account.
3. Customer clicks **Verify** — the app checks access with the system user token and shows **Verified** or a hint.
4. Once verified, customer can use **Ads** to publish (real writes only if `ALLOW_REAL_META_WRITE=true`).

### 4. Verify before launch

- In production, open **Settings → Meta** as a test customer and complete all three steps.
- Confirm **Verify** returns **Partner access verified**.
- Run a test publish (with `ALLOW_REAL_META_WRITE=true`) and confirm a paused campaign appears in the customer’s ad account in Meta Ads Manager.
