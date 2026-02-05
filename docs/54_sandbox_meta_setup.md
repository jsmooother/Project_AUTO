# Meta Sandbox Account Setup (Alternative to OAuth)

This guide shows how to use a Meta Sandbox ad account with a direct access token for testing, without going through the full OAuth flow.

## Why Sandbox?

- **No OAuth setup required** - Use a token directly from Graph API Explorer
- **Perfect for testing** - Sandbox accounts don't spend real money
- **Faster setup** - No need to configure redirect URLs, app secrets, etc.
- **Same functionality** - Works exactly like OAuth for testing purposes

## Step 1: Get Sandbox Access Token

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app (e.g., "Agentic_ADs")
3. Click **"Generate Token"** or **"Get Token"**
4. Select permissions:
   - `ads_management`
   - `business_management`
   - `ads_read`
5. Copy the access token (long string starting with something like `EAAB...`)

**Note:** Sandbox tokens typically don't expire, but if yours does, you'll need to regenerate it.

## Step 2: Get Sandbox Ad Account ID

1. In Graph API Explorer, use your access token
2. Query: `me/adaccounts`
3. Find your sandbox ad account in the results
4. Copy the `id` field (format: `act_123456789` or just `123456789`)

## Step 3: Connect Using Script

Use the provided script to connect:

```bash
./scripts/connect-sandbox-meta.sh \
  http://localhost:3001 \
  81be90e1-fbfb-41d0-a7a2-eb4dfa6c9f3c \
  <your-access-token> \
  act_<your-ad-account-id>
```

Or set environment variables:

```bash
export META_TEST_CUSTOMER_ID=81be90e1-fbfb-41d0-a7a2-eb4dfa6c9f3c
export META_SANDBOX_ACCESS_TOKEN=<your-token>
export META_TEST_AD_ACCOUNT_ID=act_<your-ad-account-id>

./scripts/connect-sandbox-meta.sh
```

## Step 4: Verify Connection

1. Check API response - should show `"status":"connected"`
2. Go to Settings → Meta in the web UI
3. Verify it shows "Connected" status
4. If ad accounts are listed, select your sandbox account

## Step 5: Test Setup

Run the test script:

```bash
./scripts/test-meta-setup.sh
```

Should show:
- ✅ Meta connection is active
- ✅ Test mode is active (if META_TEST_MODE=true)

## Using Sandbox Token in .env (Optional)

You can also store the token in `.env` for convenience:

```bash
META_SANDBOX_ACCESS_TOKEN=<your-token>
```

Then use it in the script:

```bash
./scripts/connect-sandbox-meta.sh
```

## API Endpoint

You can also call the endpoint directly:

```bash
curl -X POST http://localhost:3001/meta/sandbox-connect \
  -H "Content-Type: application/json" \
  -H "x-customer-id: <customer-id>" \
  -d '{
    "accessToken": "<your-token>",
    "adAccountId": "act_<account-id>"
  }'
```

## Differences from OAuth

- **No redirect URL needed** - Direct token usage
- **No app secret needed** - Token is pre-generated
- **No page ID needed** - Can be set later if needed for ad creatives
- **Token doesn't expire** - Sandbox tokens typically last indefinitely
- **Same API access** - All Meta API calls work the same way

## Troubleshooting

### "Failed to verify access token"

**Cause:** Token is invalid or expired

**Solution:**
- Regenerate token in Graph API Explorer
- Ensure you selected the correct app
- Check token has required permissions

### "No ad accounts found"

**Cause:** Token doesn't have access to ad accounts

**Solution:**
- Regenerate token with `ads_management` and `business_management` scopes
- Ensure you're using a Sandbox ad account token (not a regular user token)

### Connection works but publish fails

**Cause:** Missing META_PAGE_ID or other settings

**Solution:**
- Set `META_PAGE_ID` in `.env` (get from Facebook Page settings)
- Ensure `ALLOW_REAL_META_WRITE=true` is set
- Check worker logs for specific errors

## Next Steps

After connecting:
1. ✅ Meta connection established
2. Run a crawl to get inventory
3. Configure ads settings
4. Test preview page
5. Publish and verify PAUSED campaign in Ads Manager

## Security Note

**Never commit access tokens to git!** They're stored in `.env` which should be in `.gitignore`. Sandbox tokens are safer than production tokens, but still treat them as sensitive.
