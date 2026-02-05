# Internal Meta Test Mode — Step-by-Step Guide

This document describes how to use the internal Meta test mode for E2E testing with Project Auto's own Meta ad account.

## Overview

Internal test mode allows designated test customers to publish ads using Project Auto's Meta ad account instead of their own. This enables safe E2E testing without requiring customers to connect their own Meta accounts or risk spending their own ad budget.

**Key Features:**
- Uses Project Auto's ad account (`META_TEST_AD_ACCOUNT_ID`) for test customers only
- Real Meta API writes remain **PAUSED** (campaigns are created but not active)
- Other customers continue using their own selected ad accounts
- Safe, gated, and reversible via environment flags

## Prerequisites

1. **Meta Developer Account** with:
   - A Meta App created
   - `ads_management` and `business_management` scopes
   - A Meta ad account ID (format: `act_123456789` or just `123456789`)

2. **Environment Setup:**
   - API server running
   - Worker running
   - Database and Redis running
   - Meta OAuth configured (see [Meta OAuth Setup](#meta-oauth-setup))

## Step 1: Create Test Customer

### Option A: Using the Script (Recommended)

Run the provided script to create a test customer:

```bash
./scripts/create-test-customer.sh
```

This will:
- Create a new test customer via the signup endpoint
- Output the `customerId` (UUID) that you need
- Display the email and password for login

**Example output:**
```
✅ Test customer created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add these to your .env file:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

META_TEST_MODE=true
META_TEST_CUSTOMER_ID=12345678-1234-1234-1234-123456789abc
META_TEST_AD_ACCOUNT_ID=act_<your_ad_account_id>
ALLOW_REAL_META_WRITE=true

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test customer details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Customer ID: 12345678-1234-1234-1234-123456789abc
Email: test-customer-1234567890@test.local
Password: test-password-123
```

### Option B: Manual Signup via UI

1. Go to `http://localhost:3000/signup`
2. Fill in the form:
   - Email: `test-customer-<timestamp>@test.local`
   - Name: `Test Customer`
   - Password: `test-password-123`
3. After signup, check the browser console or network tab for the `customerId` in the response
4. Or go to **Admin → Customers** and find the newly created customer

### Option C: Using Admin Demo Seed

1. Go to **Admin → Customers** (`http://localhost:3000/admin/customers`)
2. Click **"Create demo customer"** (dev only)
3. Copy the `customerId` from the result

## Step 2: Configure Environment Variables

Add these to your `.env` file (or set them in your deployment environment):

```bash
# Enable internal test mode
META_TEST_MODE=true

# UUID of the test customer (from Step 1)
META_TEST_CUSTOMER_ID=<your-test-customer-uuid>

# Meta ad account ID (with or without act_ prefix)
META_TEST_AD_ACCOUNT_ID=act_123456789
# OR
META_TEST_AD_ACCOUNT_ID=123456789  # Will be normalized to act_123456789

# Enable real Meta writes (required for test mode to work)
ALLOW_REAL_META_WRITE=true

# Meta OAuth credentials (required)
META_APP_ID=<your-app-id>
META_APP_SECRET=<your-app-secret>
META_REDIRECT_URL=<your-callback-url>
META_OAUTH_SCOPES=ads_management,business_management

# Meta Page ID (required for ad creatives)
META_PAGE_ID=<your-facebook-page-id>
```

**Important:** Restart both API and Worker servers after setting these environment variables.

## Step 3: Connect Meta OAuth (for Test Customer)

Even in test mode, the customer needs a Meta connection (for access token). The ad account selection will be overridden, but the connection is still required.

1. **As the test customer**, go to **Settings → Connected Meta account**
2. Click **Connect Meta**
3. Complete OAuth flow (authorize the app)
4. Verify status shows **Connected**

**Note:** The customer can select any ad account in Settings, but when publishing, the system will use `META_TEST_AD_ACCOUNT_ID` instead.

## Step 4: Run Real Crawl

1. **Connect a website** (if not already connected):
   - Go to **Settings → Website** or `/connect-website`
   - Enter a real website URL (e.g., `https://ivarsbil.se`)
   - Save

2. **Run a crawl**:
   - Go to **Automation** or **Inventory**
   - Click **Run Manual Sync** or trigger via API: `POST /runs/crawl`
   - Wait for crawl to complete (check **Runs** page)

3. **Verify inventory items**:
   - Go to **Inventory** page
   - Confirm items are present with valid data (price >= 50k SEK, images, URLs)

## Step 5: Configure Ads Settings

1. Go to **Ads** page (`/ads`)
2. Configure:
   - **Geo targeting**: Select radius or regions
   - **Ad formats**: Enable at least one (Feed, Reels, etc.)
   - **CTA type**: Select call-to-action
3. Click **Save Configuration**

## Step 6: Preview Before Publishing

1. Go to **Ads** page
2. Click **Preview Ads** button (next to Launch Campaign)
3. Review the preview page (`/ads/preview`):
   - **QA Gate Status**: Should show green/passed (if items are valid)
   - **Items to be published**: Should show 1–2 items with:
     - Title
     - Price (formatted in SEK)
     - Image preview
     - Destination URL
4. If QA gate fails:
   - Check **Scrape QA panel** (Admin → Inventory QA)
   - Ensure items have: price >= 50k SEK, valid image URL, valid HTTPS URL, title
   - Re-run crawl if needed

## Step 7: Publish Campaign

1. On the preview page, click **Proceed to Publish**
   - OR go back to **Ads** page and click **Launch Campaign**
2. Wait for publish job to complete (check **Ads → Diagnostics** or **Runs**)
3. Verify success:
   - Status should be **success**
   - No error messages

## Step 8: Verify PAUSED Campaign in Meta Ads Manager

1. Open [Meta Ads Manager](https://business.facebook.com/adsmanager/manage/campaigns)
2. Select the ad account specified in `META_TEST_AD_ACCOUNT_ID`
3. Look for campaign named **"Project Auto - Test Campaign"**
4. Verify:
   - Campaign status: **PAUSED** ✅
   - Ad set status: **PAUSED** ✅
   - Ad status: **PAUSED** ✅
   - Campaign contains 1–2 ads (one per projected item)

## Verification Checklist

- [ ] Test customer created and `customerId` copied
- [ ] Environment variables set (`META_TEST_MODE=true`, `META_TEST_CUSTOMER_ID`, `META_TEST_AD_ACCOUNT_ID`)
- [ ] API and Worker restarted after env changes
- [ ] Test customer identified/created
- [ ] Meta OAuth connected (Settings shows "Connected")
- [ ] Real crawl completed with valid items
- [ ] Ads settings configured
- [ ] Preview page shows valid items
- [ ] Publish job completed successfully
- [ ] Campaign appears in Meta Ads Manager as PAUSED
- [ ] Test mode banner visible on `/ads` and `/settings` pages

## Troubleshooting

### Preview shows "No items found to publish"

**Cause:** Items don't meet Meta requirements (price < 50k, missing image, invalid URL, etc.)

**Solution:**
- Check item quality in **Inventory** page
- Ensure items have `details_json` with `priceAmount >= 50000`, `primaryImageUrl`, and valid `url`
- Re-run crawl if needed

### QA Gate failing

**Cause:** Too many invalid items in sample (invalid rate > 30%)

**Solution:**
- Check **Scrape QA panel** (Admin → Inventory QA)
- Fix scraping issues or improve source website data quality
- Ensure at least 70% of items pass validation

### "No ad account selected" error

**Cause:** Meta connection not established or test mode not properly configured

**Solution:**
- Verify `META_TEST_MODE=true` and `META_TEST_AD_ACCOUNT_ID` are set
- Verify customer UUID matches `META_TEST_CUSTOMER_ID`
- Ensure Meta OAuth is connected (Settings → Meta)
- Restart worker after setting env vars

### Campaign not appearing in Ads Manager

**Cause:** Wrong ad account selected or API error

**Solution:**
- Verify `META_TEST_AD_ACCOUNT_ID` matches the ad account you're checking
- Check worker logs for Meta API errors
- Verify `ALLOW_REAL_META_WRITE=true` is set
- Check `META_PAGE_ID` is set correctly

## Safety Notes

- **Real Meta writes are PAUSED**: Campaigns are created but not active, so no spend occurs
- **Test mode only applies to designated customer**: Other customers use their own ad accounts
- **No spend data exposed**: Customer endpoints never return CPC, CPM, cost_per_*, or spend fields
- **Reversible**: Set `META_TEST_MODE=false` to disable test mode

## API Endpoints

### GET /ads/publish-preview

Preview what would be published (no DB writes).

**Response:**
```json
{
  "ok": true,
  "qaGate": {
    "total": 10,
    "invalid": 1,
    "invalidRate": 0.1,
    "threshold": 0.3,
    "failures": [...]
  },
  "projectedItems": [
    {
      "title": "2023 Volvo XC60",
      "priceAmount": 450000,
      "currency": "SEK",
      "imageUrl": "https://example.com/image.jpg",
      "destinationUrl": "https://example.com/item/123",
      "vehicleId": "item-uuid"
    }
  ],
  "hint": null
}
```

### GET /ads/status

Returns test mode status in `derived.metaAccountMode`:
- `"internal_test"` when test mode is active for this customer
- `"customer_selected"` for normal customers

Also includes `derived.effectiveAdAccountIdLast4` (masked) when in test mode.

## Related Documentation

- [Meta OAuth Setup](42_meta_step3_real_write.md)
- [Ads Testing Guide](42_meta_step3_real_write.md)
- [Admin Testing](29_admin_testing.md)
