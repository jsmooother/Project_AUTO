# Meta Connection Dev Mode

This document describes the dev-only "fake connect" feature for testing Meta OAuth connection flow without setting up a real Meta App.

## Overview

Milestone 4.1A implements Meta connection state management with a dev-only endpoint that simulates OAuth connection. This allows testing the full UI flow and database state machine without requiring Meta App setup.

## Enabling Dev Mode

### Backend (API)

Set `ALLOW_DEV_META=true` in your `.env` file:

```bash
ALLOW_DEV_META=true
```

### Frontend (Web)

Set `NEXT_PUBLIC_ALLOW_DEV_META=true` in your `.env` file:

```bash
NEXT_PUBLIC_ALLOW_DEV_META=true
```

**Note:** Both must be set to `true` for the dev connect button to appear in the UI.

## API Endpoints

### GET /meta/status

Returns the current Meta connection status for the authenticated customer.

**Response:**
```json
{
  "status": "disconnected" | "connected" | "error",
  "metaUserId": "string | null",
  "adAccountId": "string | null",
  "scopes": "string[] | null"
}
```

### POST /meta/dev-connect

**DEV ONLY** - Creates or updates a fake Meta connection.

**Requirements:**
- `ALLOW_DEV_META=true` must be set
- Requires authenticated session + `x-customer-id` header

**Request Body (all optional):**
```json
{
  "metaUserId": "string (optional, defaults to 'dev-user-123')",
  "adAccountId": "string (optional, defaults to 'dev-account-123')",
  "scopes": ["string"] (optional, defaults to ["ads_management", "business_management"])
}
```

**Response:**
```json
{
  "status": "connected",
  "metaUserId": "dev-user-123",
  "adAccountId": "dev-account-123",
  "scopes": ["ads_management", "business_management"]
}
```

**Errors:**
- `403 CONFIG_ERROR`: Dev mode not enabled
- `400 VALIDATION_ERROR`: Invalid request body

### POST /meta/disconnect

Disconnects the Meta account (clears connection data, sets status to "disconnected").

**Response:**
```json
{
  "success": true
}
```

## Database Schema

The `meta_connections` table stores connection state:

```sql
CREATE TABLE meta_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID UNIQUE NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'disconnected', -- disconnected|connected|error
  meta_user_id TEXT,
  access_token TEXT, -- dev placeholder only
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  ad_account_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Expected Values After Dev Connect

After calling `/meta/dev-connect` with defaults:

- `status`: `"connected"`
- `meta_user_id`: `"dev-user-123"`
- `ad_account_id`: `"dev-account-123"`
- `scopes`: `["ads_management", "business_management"]`
- `access_token`: `"dev-token-placeholder"`
- `token_expires_at`: 90 days from connection time

## Browser Test Steps

1. **Start services:**
   ```bash
   pnpm dev:up
   ```

2. **Set environment variables:**
   ```bash
   # In .env
   ALLOW_DEV_META=true
   NEXT_PUBLIC_ALLOW_DEV_META=true
   ```

3. **Restart dev servers** to pick up env changes

4. **Sign up / Log in** at http://localhost:3000/login

5. **Navigate to Dashboard:**
   - Should see "Meta Ads" card in System status
   - Should show "Not connected" status
   - If dev mode enabled, should see "Dev: Fake connect" button

6. **Click "Dev: Fake connect":**
   - Button should show "Connecting..." state
   - Status should update to "Connected"
   - Should display ad account ID and user ID
   - "Disconnect" button should appear

7. **Click "Disconnect":**
   - Status should return to "Not connected"
   - Connection data should be cleared

8. **Verify in Settings page:**
   - Navigate to /settings
   - Meta section should show same state as dashboard
   - Connect/disconnect should work from settings too

9. **Verify database:**
   ```sql
   SELECT * FROM meta_connections WHERE customer_id = '<your-customer-id>';
   ```
   - After connect: should see row with status='connected'
   - After disconnect: status='disconnected', tokens cleared

## UI Locations

- **Dashboard** (`/dashboard`): System status card shows Meta connection state
- **Settings** (`/settings`): Dedicated Meta account section with connect/disconnect

## What's NOT Implemented (Milestone 4.1B)

- Real OAuth flow with Meta App
- OAuth callback handling
- Token refresh
- Actual Meta API calls
- Ad account selection during OAuth
- Scope management

## Troubleshooting

**"Dev: Fake connect" button not showing:**
- Check `NEXT_PUBLIC_ALLOW_DEV_META=true` in `.env`
- Restart web dev server
- Check browser console for errors

**403 error when clicking connect:**
- Check `ALLOW_DEV_META=true` in `.env` (API server)
- Restart API dev server
- Verify API logs show the env var is set

**Connection not persisting:**
- Check database migration ran: `pnpm db:migrate`
- Verify `meta_connections` table exists
- Check API logs for database errors
