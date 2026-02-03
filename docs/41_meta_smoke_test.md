# Meta Smoke Test — Step 1: Read-Only API Validation

## Overview

The Meta smoke test is a read-only diagnostic endpoint that validates your Meta OAuth connection by making test calls to the Meta Graph API. It verifies that:

1. Your access token is valid and not expired
2. The token has the required permissions
3. The API can retrieve your user profile (`/me`)
4. The API can retrieve your ad accounts (`/me/adaccounts`)

This is **additive-only** and does not modify any existing OAuth flow, Ads module, or database structure.

---

## Environment Variables

Required environment variables (already set for OAuth):

```bash
# Meta Graph API version (defaults to v21.0)
META_GRAPH_VERSION=v21.0

# Optional: For dev mode testing
ALLOW_DEV_META=true
```

The smoke test uses the same `META_GRAPH_VERSION` as the OAuth flow.

---

## API Endpoint

### `GET /meta/debug/smoke`

**Authentication:** Requires session cookie + `x-customer-id` header (same as other `/meta` endpoints)

**Response (Success):**
```json
{
  "ok": true,
  "me": {
    "id": "123456789",
    "name": "John Doe"
  },
  "adAccounts": [
    {
      "id": "act_123456789",
      "name": "My Ad Account",
      "account_status": 1,
      "currency": "USD"
    }
  ],
  "hint": "Optional hint message"
}
```

**Response (Error):**
```json
{
  "error": "CONFIG_ERROR" | "MISSING_PREREQUISITE",
  "message": "Human-readable error message",
  "hint": "Actionable hint (e.g., 'Reconnect Meta in Settings')"
}
```

**Error Codes:**
- `MISSING_PREREQUISITE`: No Meta connection found, or connection status is not "connected", or access token is missing
- `CONFIG_ERROR`: Meta API call failed (invalid token, expired token, missing permissions, network error, timeout)

**Timeout:** 10 seconds per API call (both `/me` and `/me/adaccounts`)

---

## Browser Testing Steps

### Prerequisites

1. **Meta connection exists:**
   - Go to `/settings`
   - Connect Meta account (either via "Connect Meta" OAuth or "🔧 Dev: Fake Connect" for dev mode)
   - Verify status shows "Connected" with green badge

### Running the Smoke Test

1. **Navigate to Settings:**
   - Go to `/settings` in your browser
   - Scroll to the "Connected Meta account" section

2. **Run the test:**
   - Click the "Run Meta smoke test" button
   - Wait for the test to complete (should take 1-2 seconds)

3. **Verify results:**
   - **Success:** Green panel showing:
     - "Connection successful" with checkmark
     - Your Meta user name and ID
     - Number of ad accounts found
     - List of first 5 ad accounts with status and currency
   - **Error:** Red error banner with message and hint

### Expected Successful Output

```
✓ Connection successful

Me: John Doe (123456789)

Ad Accounts: 2 found
  • My Ad Account (act_123456789) Active USD
  • Test Account (act_987654321) Active EUR
```

---

## Common Errors

### 1. "No Meta connection found"

**Cause:** No `meta_connections` row exists for the customer.

**Fix:** Connect Meta account in Settings first.

---

### 2. "Meta connection status is 'disconnected', expected 'connected'"

**Cause:** Connection exists but status is not "connected".

**Fix:** Reconnect Meta account in Settings.

---

### 3. "Meta access token is missing"

**Cause:** Connection exists but `access_token` is null.

**Fix:** Reconnect Meta account in Settings to refresh the token.

---

### 4. "Access token is invalid or expired"

**Cause:** Token was revoked, expired, or is malformed.

**Error Code:** Meta API error code `190` or type `OAuthException`

**Fix:** Reconnect Meta account in Settings. The hint will say: "Reconnect Meta in Settings."

---

### 5. "Missing required permissions"

**Cause:** Token doesn't have the required scopes (e.g., `ads_read`, `business_management`).

**Error Code:** Meta API error code `200`

**Fix:** Reconnect Meta account and ensure you grant all requested permissions during OAuth.

---

### 6. "Request to Meta API timed out"

**Cause:** Network issue or Meta API is slow/unreachable.

**Fix:** Check your network connection and try again. If it persists, check Meta API status.

---

### 7. "User data retrieved, but ad accounts fetch failed"

**Cause:** `/me` call succeeded but `/me/adaccounts` failed (likely permissions issue).

**Fix:** Reconnect Meta account and ensure `ads_read` scope is granted.

---

## Dev Mode Behavior

When `ALLOW_DEV_META=true` and using "Dev: Fake Connect":

- The smoke test will return placeholder data:
  ```json
  {
    "ok": true,
    "me": { "id": "dev-user", "name": "Dev User" },
    "adAccounts": [{ "id": "dev-account-123", "name": "Dev Account", "account_status": 1, "currency": "USD" }],
    "hint": "Dev mode: using placeholder data. Use real OAuth for actual API testing."
  }
  ```
- No actual Meta API calls are made
- Useful for testing the UI flow without a real Meta app

---

## Implementation Details

### Helper Library: `apps/api/src/lib/metaGraph.ts`

- `fetchMeta(path, token, options?)`: Shared function for Meta Graph API calls
- Handles timeouts (default 10s)
- Maps Meta API errors to `{ message, hint }` format
- Uses `META_GRAPH_VERSION` environment variable

### API Route: `apps/api/src/routes/meta.ts`

- `GET /meta/debug/smoke`: Endpoint implementation
- Validates connection status and token existence
- Calls `/me` and `/me/adaccounts` sequentially
- Returns structured success/error responses
- Never exposes access tokens to the frontend

### Web UI: `apps/web/src/app/(app)/settings/page.tsx`

- "Run Meta smoke test" button (only visible when connected)
- Results panel showing:
  - Success: User info + ad accounts list (first 5)
  - Error: ErrorBanner with message and hint
- Loading state during test execution

---

## Security Notes

- Access tokens are **never** exposed to the frontend
- All API calls are server-side only
- Timeouts prevent hanging requests
- Error messages are sanitized (no stack traces)

---

## Future Enhancements

Potential additions (not in scope for Step 1):

- Token refresh detection
- Scope validation
- Rate limit handling
- Historical test results
- Admin-level smoke tests for all customers

---

## Related Documentation

- `docs/37_meta_oauth_setup.md` — Meta OAuth setup guide
- `docs/36_meta_connection_dev_mode.md` — Dev mode testing
- `docs/40_ads_ui_api_contract.md` — Ads module API contract
