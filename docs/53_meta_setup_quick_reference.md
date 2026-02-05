# Meta Setup Quick Reference

## Where to Find Missing Values

### 1. META_APP_SECRET

**Location:** Meta Developer Console → Your App → Settings → Basic

1. Go to https://developers.facebook.com/apps/
2. Select your app (e.g., "Agentic_ADs")
3. Go to **Settings → Basic**
4. Find **App Secret** section
5. Click **Show** (you may need to enter your password)
6. Copy the secret value

**Add to .env:**
```bash
META_APP_SECRET=<paste-the-secret-here>
```

### 2. META_PAGE_ID

**Location:** Meta Business Manager or Facebook Page Settings

**Option A: From Facebook Page**
1. Go to your Facebook Page
2. Click **Settings** (left sidebar)
3. Scroll down to **Page ID** section
4. Copy the Page ID (numeric, e.g., `123456789012345`)

**Option B: From Meta Business Manager**
1. Go to https://business.facebook.com/
2. Select your Business Account
3. Go to **Pages** section
4. Click on your page
5. Page ID is shown in the URL or page settings

**Option C: Using Graph API Explorer**
1. Go to https://developers.facebook.com/tools/explorer/
2. Select your app
3. Generate a User Access Token with `pages_read_engagement` permission
4. Query: `me/accounts` or `me/pages`
5. Find your page and copy the `id` field

**Add to .env:**
```bash
META_PAGE_ID=<paste-the-page-id-here>
```

### 3. META_TEST_AD_ACCOUNT_ID

**Important:** The ID must be an ad account that your **access token** can use. If you use a Sandbox token, use an ID from the list returned by the token (see below).

**Option A – List IDs for your token (recommended)**

Run the helper script with your access token to see exactly which ad accounts this token can use:

```bash
./scripts/list-meta-ad-accounts.sh <YOUR_ACCESS_TOKEN>
# Or if META_SANDBOX_ACCESS_TOKEN is set:
./scripts/list-meta-ad-accounts.sh
```

Use one of the printed IDs (e.g. `act_1261586745832738`) in `.env`. If you use an ID that is **not** in this list, publish/API calls for that account will fail.

**Option B – From Meta Ads Manager**

1. Go to https://business.facebook.com/adsmanager/
2. Select the ad account you want to use for testing
3. The ad account ID is in the URL: `...?act=123456789` — the number after `act=` is your ad account ID
4. Or go to **Account Settings** → **Account Info** → **Ad Account ID**

Ensure this same account is available to the token you use (e.g. same Meta user / app).

**Format:** Can be `act_123456789` or just `123456789` (will be normalized)

**Add to .env:**
```bash
META_TEST_AD_ACCOUNT_ID=act_123456789
# OR
META_TEST_AD_ACCOUNT_ID=123456789
```

### 4. META_REDIRECT_URL

**Current ngrok URL:** `https://blindly-chocolaty-lesa.ngrok-free.dev/meta/oauth/callback`

**To add in Meta App:**
1. Go to https://developers.facebook.com/apps/
2. Select your app → **Facebook Login** → **Settings**
3. Under **Valid OAuth Redirect URIs**, add:
   ```
   https://blindly-chocolaty-lesa.ngrok-free.dev/meta/oauth/callback
   ```
4. Click **Save Changes**

**Note:** If ngrok restarts and gets a new URL, update both `.env` and Meta App settings.

## Current Status Check

Run the test script to verify your setup:

```bash
./scripts/test-meta-setup.sh
```

## Complete .env Checklist

```bash
# ✅ Already set
META_TEST_MODE=true
META_TEST_CUSTOMER_ID=81be90e1-fbfb-41d0-a7a2-eb4dfa6c9f3c
META_TEST_AD_ACCOUNT_ID=act_1218445527083715
META_REDIRECT_URL=https://blindly-chocolaty-lesa.ngrok-free.dev/meta/oauth/callback
META_APP_ID=3891132367687511
ALLOW_REAL_META_WRITE=true

# ❌ Still need to set
META_APP_SECRET=<get-from-meta-app-settings>
META_PAGE_ID=<get-from-facebook-page-or-business-manager>
```

## After Setting Values

1. **Restart API server:**
   ```bash
   # Stop current API
   # Then restart:
   pnpm --filter @repo/api dev
   ```

2. **Restart Worker:**
   ```bash
   # Stop current worker
   # Then restart:
   pnpm --filter @repo/worker dev
   ```

3. **Verify setup:**
   ```bash
   ./scripts/test-meta-setup.sh
   ```

4. **Test Meta OAuth connection:**
   - Log in as test customer
   - Go to Settings → Meta
   - Click "Connect Meta"
   - Complete OAuth flow
