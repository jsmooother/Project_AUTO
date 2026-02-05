#!/usr/bin/env bash
# Test script to verify Meta test mode setup
# Usage: ./scripts/test-meta-setup.sh [API_URL] [CUSTOMER_ID]

set -e

API_URL="${1:-${API_URL:-http://localhost:3001}}"
CUSTOMER_ID="${2:-${META_TEST_CUSTOMER_ID:-}}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Meta Test Mode Setup Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check environment variables
echo "1. Checking environment variables..."
if [ -f .env ]; then
  source .env 2>/dev/null || true
fi

MISSING_VARS=()

if [ -z "$META_TEST_MODE" ] || [ "$META_TEST_MODE" != "true" ]; then
  MISSING_VARS+=("META_TEST_MODE=true")
fi

if [ -z "$META_TEST_CUSTOMER_ID" ]; then
  MISSING_VARS+=("META_TEST_CUSTOMER_ID=<uuid>")
fi

if [ -z "$META_TEST_AD_ACCOUNT_ID" ]; then
  MISSING_VARS+=("META_TEST_AD_ACCOUNT_ID=act_<id>")
fi

if [ -z "$META_REDIRECT_URL" ]; then
  MISSING_VARS+=("META_REDIRECT_URL=<ngrok-url>/meta/oauth/callback")
fi

if [ -z "$META_APP_ID" ]; then
  MISSING_VARS+=("META_APP_ID=<your-app-id>")
fi

if [ -z "$META_APP_SECRET" ]; then
  MISSING_VARS+=("META_APP_SECRET=<your-app-secret>")
fi

if [ -z "$META_PAGE_ID" ]; then
  MISSING_VARS+=("META_PAGE_ID=<your-page-id>")
fi

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
  echo "   ✅ All required environment variables are set"
  echo "      META_TEST_MODE=$META_TEST_MODE"
  echo "      META_TEST_CUSTOMER_ID=$META_TEST_CUSTOMER_ID"
  echo "      META_TEST_AD_ACCOUNT_ID=$META_TEST_AD_ACCOUNT_ID"
  echo "      META_REDIRECT_URL=$META_REDIRECT_URL"
  echo "      META_APP_ID=${META_APP_ID:0:10}..."
  echo "      META_APP_SECRET=${META_APP_SECRET:0:10}..."
  echo "      META_PAGE_ID=$META_PAGE_ID"
else
  echo "   ❌ Missing environment variables:"
  for var in "${MISSING_VARS[@]}"; do
    echo "      - $var"
  done
  echo ""
  echo "   Please add these to your .env file"
fi

echo ""
echo "2. Checking API server..."
if curl -s "${API_URL}/health" > /dev/null 2>&1; then
  echo "   ✅ API server is running at $API_URL"
else
  echo "   ❌ API server is not responding at $API_URL"
  echo "      Make sure the API server is running: pnpm --filter @repo/api dev"
  exit 1
fi

echo ""
echo "3. Checking test customer..."

if [ -z "$CUSTOMER_ID" ]; then
  CUSTOMER_ID="$META_TEST_CUSTOMER_ID"
fi

if [ -z "$CUSTOMER_ID" ]; then
  echo "   ⚠️  No customer ID provided. Skipping customer-specific tests."
  echo "      Run: ./scripts/create-test-customer.sh to create one"
else
  echo "   Using customer ID: $CUSTOMER_ID"
  
  echo ""
  echo "4. Testing GET /ads/status (should show test mode)..."
  STATUS_RESP=$(curl -s -X GET "${API_URL}/ads/status" \
    -H "x-customer-id: ${CUSTOMER_ID}" \
    -H "Content-Type: application/json")
  
  if echo "$STATUS_RESP" | grep -q "metaAccountMode"; then
    META_MODE=$(echo "$STATUS_RESP" | grep -o '"metaAccountMode":"[^"]*"' | cut -d'"' -f4 || echo "")
    if [ "$META_MODE" = "internal_test" ]; then
      echo "   ✅ Test mode is active (metaAccountMode: internal_test)"
    else
      echo "   ⚠️  Test mode not active (metaAccountMode: $META_MODE)"
      echo "      Check that META_TEST_MODE=true and customer ID matches"
    fi
  else
    echo "   ⚠️  Could not determine test mode status"
  fi
  
  echo ""
  echo "5. Testing Meta connection status..."
  META_STATUS_RESP=$(curl -s -X GET "${API_URL}/meta/status" \
    -H "x-customer-id: ${CUSTOMER_ID}" \
    -H "Content-Type: application/json")
  
  if echo "$META_STATUS_RESP" | grep -q "status"; then
    CONN_STATUS=$(echo "$META_STATUS_RESP" | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo "")
    if [ "$CONN_STATUS" = "connected" ]; then
      echo "   ✅ Meta connection is active (status: connected)"
    else
      echo "   ⚠️  Meta connection not active (status: $CONN_STATUS)"
      echo "      Go to Settings → Meta and connect your account"
    fi
  else
    echo "   ⚠️  Could not check Meta connection status"
  fi
  
  echo ""
  echo "6. Testing GET /ads/publish-preview..."
  PREVIEW_RESP=$(curl -s -X GET "${API_URL}/ads/publish-preview" \
    -H "x-customer-id: ${CUSTOMER_ID}" \
    -H "Content-Type: application/json")
  
  if echo "$PREVIEW_RESP" | grep -q "ok"; then
    PREVIEW_OK=$(echo "$PREVIEW_RESP" | grep -o '"ok":[^,}]*' | cut -d':' -f2 | tr -d ' ' || echo "")
    if [ "$PREVIEW_OK" = "true" ]; then
      echo "   ✅ Preview endpoint works (ok: true)"
      ITEM_COUNT=$(echo "$PREVIEW_RESP" | grep -o '"projectedItems":\[[^]]*\]' | grep -o '{' | wc -l | tr -d ' ' || echo "0")
      echo "      Found $ITEM_COUNT projected items"
    else
      echo "   ⚠️  Preview endpoint returned ok: false"
      HINT=$(echo "$PREVIEW_RESP" | grep -o '"hint":"[^"]*"' | cut -d'"' -f4 || echo "")
      if [ -n "$HINT" ]; then
        echo "      Hint: $HINT"
      fi
    fi
  else
    echo "   ⚠️  Could not parse preview response"
  fi
fi

echo ""
echo "7. Checking ngrok tunnel..."
if curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  if [ -n "$NGROK_URL" ]; then
    echo "   ✅ ngrok is running"
    echo "      Public URL: $NGROK_URL"
    EXPECTED_REDIRECT="${NGROK_URL}/meta/oauth/callback"
    if [ "$META_REDIRECT_URL" = "$EXPECTED_REDIRECT" ]; then
      echo "   ✅ META_REDIRECT_URL matches ngrok URL"
    else
      echo "   ⚠️  META_REDIRECT_URL doesn't match current ngrok URL"
      echo "      Current: $META_REDIRECT_URL"
      echo "      Expected: $EXPECTED_REDIRECT"
      echo "      Update .env if ngrok URL changed"
    fi
  else
    echo "   ⚠️  ngrok is running but couldn't get URL"
  fi
else
  echo "   ⚠️  ngrok is not running"
  echo "      Start with: ngrok http 3000"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Summary & Next Steps"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To complete setup:"
echo "1. Ensure all environment variables are set in .env"
echo "2. Restart API and Worker servers after .env changes"
echo "3. Add redirect URL to Meta App:"
echo "   - Go to https://developers.facebook.com/apps/"
echo "   - Select your app → Settings → Basic"
echo "   - Add to 'Valid OAuth Redirect URIs':"
echo "     $META_REDIRECT_URL"
echo "4. Connect Meta account as test customer (Settings → Meta)"
echo "5. Run a crawl to get inventory items"
echo "6. Test preview: http://localhost:3000/ads/preview"
echo ""
