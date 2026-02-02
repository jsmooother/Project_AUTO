MILESTONE 4.1 — META CONNECT (OAUTH ONLY, NO ADS PUBLISHING)

We have a hardened MVP loop (website→crawl→templates→previews→approve) and deterministic web builds.
Now implement Meta account connection for a customer: OAuth → store token → show “Connected” in UI.

IMPORTANT: Do not implement campaign/ad creation, pixel, creative upload, or any spend actions in this milestone.
We only connect and store access info.

PHASE A — DB + API skeleton (works without real Meta)
1) Add DB migration: 0020_meta_connections.sql
Create table meta_connections:
- id uuid pk default gen_random_uuid()
- customer_id uuid unique not null references customers(id) on delete cascade
- status text not null default 'disconnected'  -- 'disconnected'|'connected'|'error'
- meta_user_id text null
- access_token text null  -- dev plaintext; TODO encrypt later
- token_expires_at timestamp null
- scopes text[] null
- ad_account_id text null
- created_at timestamp default now
- updated_at timestamp default now
Add updated_at trigger or update manually in code.

Update Drizzle schema accordingly.

2) API routes (apps/api/src/routes/meta.ts) mounted under /meta
All routes require normal auth + customer context (x-customer-id) like other customer endpoints.
Endpoints:
- GET /meta/status
  returns { status, metaUserId?, adAccountId?, tokenExpiresAt? }
- POST /meta/disconnect
  clears token fields, sets status 'disconnected'
- POST /meta/dev-connect (DEV ONLY; gated by NODE_ENV==='development' or ALLOW_DEV_META=true)
  body: { metaUserId?: string, adAccountId?: string }
  sets status connected and writes placeholder token "dev-token"
Purpose: lets us test UI state changes without OAuth.

Error shape must match existing conventions:
- VALIDATION_ERROR
- MISSING_PREREQUISITE
- CONFIG_ERROR (e.g. missing env)
- PROVIDER_ERROR (Meta issues; used later)

PHASE B — Real OAuth implementation (requires tunnel for callback)
3) Env vars (.env.example + docs)
Add to .env.example:
- META_APP_ID
- META_APP_SECRET
- META_REDIRECT_BASE_URL (public https base from tunnel, e.g. https://xxxx.trycloudflare.com)
- META_SCOPES (default "ads_read")
- META_OAUTH_STATE_SECRET (can reuse COOKIE_SECRET if preferred)

4) Implement OAuth endpoints
- GET /meta/connect-url
  returns { url } where url points to Meta OAuth dialog with:
    client_id, redirect_uri = META_REDIRECT_BASE_URL + "/meta/callback"
    scope = META_SCOPES
    state = signed payload binding to current session + customerId
- GET /meta/callback
  - validate state signature and that it matches current session/customer
  - exchange code for access_token via Meta Graph API
  - store access_token, token_expires_at (if available), scopes, status='connected'
  - redirect user back to web: NEXT_PUBLIC_APP_URL (or fallback http://localhost:3000) + "/dashboard?meta=connected"
If env vars missing, return CONFIG_ERROR with hint.

Use fetch to call Meta endpoints; ensure errors return PROVIDER_ERROR with hint.

NOTE: token exchange endpoints:
- /oauth/access_token (Graph API). Do not hardcode versions unless necessary; choose a stable version and put in one place.

PHASE C — Web UI integration (apps/web)
5) Add UI to match Figma concept:
- Dashboard status pill “Meta”
  - disconnected: “Meta: Not connected” + button “Connect Meta”
  - connected: “Meta: Connected” + button “Disconnect”
- Settings page: Meta connection card with same controls + explanation
Behavior:
- Connect button calls GET /meta/connect-url and window.location = url
- After callback redirect, show success toast/banner if query param meta=connected
- Disconnect calls POST /meta/disconnect and refreshes status

DEV mode:
- Show a small “Dev: Connect Meta (fake)” button only in development that calls POST /meta/dev-connect.

PHASE D — Docs + verification
6) Create docs/34_meta_oauth_local_testing.md with:
- Steps to create Meta Developer app (high-level)
- Using Cloudflare Tunnel or ngrok to obtain META_REDIRECT_BASE_URL
- Setting redirect URI in Meta app settings
- Env vars to set locally
- Browser test:
  login → dashboard → connect meta → callback → dashboard shows connected
- Troubleshooting:
  invalid redirect URI, missing env, state mismatch

Acceptance criteria
- With dev-connect: user sees connected state without OAuth.
- With real OAuth + tunnel: Meta connect completes and status flips to connected; token stored in DB.
- All endpoints use the standard error shapes and show message + hint in UI.
- Web build still passes.

Output required
- Migration + schema
- API route file + server registration
- Web UI changes
- New docs
- Short note: what’s deferred to Milestone 4.2 (ad account discovery, page selection, ads_management scope, publishing).
