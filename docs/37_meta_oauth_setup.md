# Meta OAuth Setup Guide

This document explains how to set up real Meta (Facebook) OAuth integration for the MVP.

## Overview

The Meta OAuth flow allows users to connect their Meta accounts to enable ad creation. The implementation uses Meta's Graph API OAuth 2.0 flow.

## Prerequisites

1. **Meta App**: You need a Meta App configured in the [Meta App Dashboard](https://developers.facebook.com/apps/)
2. **Tunnel URL**: For local development, you need a tunnel service (cloudflared or ngrok) to expose your local API server
3. **Environment Variables**: Configure the required env vars (see below)

## Meta App Configuration

1. Go to [Meta App Dashboard](https://developers.facebook.com/apps/) and create a new app (or use an existing one)
2. Add **Facebook Login** product to your app
3. In **Settings > Basic**, note your:
   - **App ID** (`META_APP_ID`)
   - **App Secret** (`META_APP_SECRET`)
4. In **Facebook Login > Settings**, add your OAuth redirect URL:
   - Format: `https://your-tunnel-url.ngrok-free.app/meta/oauth/callback`
   - Example: `https://abc123.ngrok-free.app/meta/oauth/callback`
   - **Important**: The URL must match exactly (including protocol and path)

## Required Scopes

Default scopes: `ads_read,business_management`

- `ads_read`: Read ads data
- `business_management`: Manage business assets

You can override these via `META_OAUTH_SCOPES` env var.

## Environment Variables

### API Server (`apps/api/.env`)

```bash
# Meta OAuth Configuration
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_REDIRECT_URL=https://your-tunnel-url.ngrok-free.app/meta/oauth/callback
META_OAUTH_SCOPES=ads_read,business_management
META_GRAPH_VERSION=v21.0  # Optional, defaults to v21.0
META_STATE_SECRET=  # Optional, defaults to COOKIE_SECRET

# Web app URL for redirects after OAuth
NEXT_PUBLIC_APP_URL=http://localhost:3000  # For local dev
```

### Web App (`apps/web/.env.local`)

```bash
# Enable Meta OAuth in UI
NEXT_PUBLIC_META_ENABLED=true

# Web app URL (must match API's NEXT_PUBLIC_APP_URL)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Tunnel Setup

### Option 1: Cloudflared (Recommended)

```bash
# Install cloudflared
brew install cloudflared  # macOS
# or download from https://github.com/cloudflare/cloudflared/releases

# Start tunnel (exposes localhost:3001)
cloudflared tunnel --url http://localhost:3001
```

Copy the HTTPS URL (e.g., `https://abc123.trycloudflare.com`) and use it in `META_REDIRECT_URL`.

### Option 2: Ngrok

```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com/download

# Start tunnel
ngrok http 3001
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`) and use it in `META_REDIRECT_URL`.

## Testing Steps

**Important:** Set up the tunnel **before** testing the OAuth callback, but you can implement most of the code without it.

1. **Start tunnel** (in a separate terminal):
   ```bash
   # Option 1: Cloudflared (recommended)
   cloudflared tunnel --url http://localhost:3001
   
   # Option 2: Ngrok
   ngrok http 3001
   ```

2. **Copy the tunnel URL** (e.g., `https://abc123.trycloudflare.com` or `https://abc123.ngrok-free.app`)

3. **Set environment variables**:
   ```bash
   # In apps/api/.env
   META_APP_ID=your_app_id
   META_APP_SECRET=your_app_secret
   META_REDIRECT_URL=https://your-tunnel-url.trycloudflare.com/meta/oauth/callback
   # ⚠️ IMPORTANT: The redirect_uri must match EXACTLY in both:
   #   1. The initial connect URL (GET /meta/oauth/connect-url)
   #   2. The token exchange (GET /meta/oauth/callback)
   # That's why we store it as META_REDIRECT_URL and reuse it.
   ```

4. **Configure Meta App**:
   - Go to Meta App Dashboard > Facebook Login > Settings
   - Add redirect URL: `https://your-tunnel-url.trycloudflare.com/meta/oauth/callback`
   - Must match `META_REDIRECT_URL` **exactly** (including protocol, domain, and path)

5. **Start development servers**:
   ```bash
   pnpm dev:up
   ```

6. **Test the flow**:
   - Log in to the web app
   - Go to Dashboard or Settings
   - Click "Connect Meta"
   - You should be redirected to Meta's OAuth dialog
   - Grant permissions
   - You should be redirected back to `/settings?meta=connected`
   - The Meta connection status should show as "Connected"

## Troubleshooting

### Invalid redirect_uri

**Error**: "Invalid redirect_uri" from Meta

**Solution**:
- **Critical**: `META_REDIRECT_URL` must match **exactly** (byte-for-byte) in:
  1. Meta App Dashboard > Facebook Login > Settings (redirect URL)
  2. Your API's `META_REDIRECT_URL` env var
  3. Both the initial connect URL AND the token exchange callback
- Check that the tunnel URL hasn't changed (restart tunnel and update env vars if needed)
- Ensure the path is `/meta/oauth/callback` (not `/meta/oauth/callback/`)
- Ensure protocol matches (`https://` not `http://`)
- No trailing slashes
- Case-sensitive (must match exactly)

### State mismatch

**Error**: "invalid_state" in redirect

**Solution**:
- Ensure `COOKIE_SECRET` or `META_STATE_SECRET` is set and consistent
- State tokens expire after 10 minutes - try connecting again
- Check that session cookie is being sent (browser DevTools > Application > Cookies)

### Missing scopes

**Error**: Token exchange succeeds but API calls fail with permission errors

**Solution**:
- Verify `META_OAUTH_SCOPES` includes required scopes (`ads_read`, `business_management`)
- Check Meta App Dashboard > Permissions to ensure scopes are approved
- Some scopes require app review for production use

### No ad accounts

**Warning**: Connection succeeds but `adAccountId` is null

**Solution**:
- User may not have any ad accounts associated with their Meta account
- User may need to grant `business_management` scope
- Check Meta Business Manager to ensure user has ad accounts

### Session cookie not sent

**Error**: Redirected to login page after OAuth callback (session not found)

**Solution**:
- **Check cookie settings**: Ensure `sameSite: "lax"` (not `"strict"`) in `apps/api/src/routes/auth.ts`
  - `SameSite=Strict` will **block** cookies on OAuth redirects
  - `SameSite=Lax` is required for OAuth flows
- Verify tunnel domain allows cookies (cloudflared/ngrok should work)
- Check browser DevTools > Application > Cookies to verify session cookie exists
- Ensure `secure: false` in dev (allows HTTP) or `secure: true` in prod (HTTPS-only)
- If using a custom domain, ensure CORS and cookie settings are correct
- Clear cookies and try again if cookie was set with wrong `sameSite` value

## Security Notes

- **Access tokens are stored in plaintext** in the database (MVP limitation)
- **TODO**: Encrypt tokens at rest in production
- Tokens are never returned from `/meta/status` endpoint
- State tokens are signed with HMAC-SHA256 and expire after 10 minutes
- OAuth callback validates both state signature and session cookie

## Cookie SameSite Setting

The API uses `SameSite=Lax` for session cookies (see `apps/api/src/routes/auth.ts`). This is **required** for OAuth flows to work correctly.

**Current Cookie Settings:**
```typescript
{
  httpOnly: true,                                    // Prevents XSS access
  secure: process.env["NODE_ENV"] === "production", // HTTPS-only in production
  sameSite: "lax",                                 // Required for OAuth redirects
  maxAge: 7 * 24 * 60 * 60,                       // 7 days
  path: "/"
}
```

**Why SameSite=Lax is Required:**
- OAuth redirects are **cross-site top-level navigations** (Meta → Your API)
- `SameSite=Strict` would **block** cookies on OAuth callback, breaking the flow
- `SameSite=Lax` allows cookies on:
  - Same-site requests (normal API calls)
  - Top-level navigations (OAuth redirects)
  - But NOT cross-site subrequests (CSRF protection still works)

**Dev vs Prod:**
- **Dev**: `secure: false` (allows HTTP for localhost)
- **Prod**: `secure: true` (HTTPS-only)
- **Both**: `sameSite: "lax"` (required for OAuth)

**Important:** If you change `sameSite` to `"strict"`, OAuth callbacks will fail because the session cookie won't be sent when Meta redirects back to your callback URL.

## What's Not Implemented (Future)

- Token refresh daemon (tokens expire after ~60 days)
- Ad account selection UI (currently uses first ad account)
- Full scope management UI
- Token encryption at rest
- OAuth state stored in database (currently in-memory signed token)

## Related Documentation

- [Meta OAuth Dev Mode](./36_meta_connection_dev_mode.md) - Dev-only fake connect endpoint
- [Meta Graph API Docs](https://developers.facebook.com/docs/graph-api) - Official Meta API documentation
