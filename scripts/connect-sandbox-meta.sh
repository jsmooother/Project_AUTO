#!/usr/bin/env bash
# Connect Meta using Sandbox access token
# Usage: ./scripts/connect-sandbox-meta.sh [API_URL] [CUSTOMER_ID] [ACCESS_TOKEN] [AD_ACCOUNT_ID]
# With no args: reads META_TEST_CUSTOMER_ID, META_SANDBOX_ACCESS_TOKEN, META_TEST_AD_ACCOUNT_ID from .env

set -e

# Load .env from project root so token/customer/ad account can be read from there
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.env"
  set +a
fi

API_URL="${1:-${API_URL:-http://localhost:3001}}"
CUSTOMER_ID="${2:-${META_TEST_CUSTOMER_ID:-}}"
ACCESS_TOKEN="${3:-${META_SANDBOX_ACCESS_TOKEN:-}}"
AD_ACCOUNT_ID="${4:-${META_TEST_AD_ACCOUNT_ID:-}}"

if [ -z "$CUSTOMER_ID" ]; then
  echo "ERROR: CUSTOMER_ID is required"
  echo "Usage: ./scripts/connect-sandbox-meta.sh [API_URL] [CUSTOMER_ID] [ACCESS_TOKEN] [AD_ACCOUNT_ID]"
  echo "Or set: META_TEST_CUSTOMER_ID and META_SANDBOX_ACCESS_TOKEN"
  exit 1
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo "ERROR: ACCESS_TOKEN is required"
  echo "Get it from: https://developers.facebook.com/tools/explorer/"
  echo "Or set: META_SANDBOX_ACCESS_TOKEN"
  exit 1
fi

echo "Connecting Meta Sandbox account..."
echo "Customer ID: $CUSTOMER_ID"
echo "Ad Account ID: ${AD_ACCOUNT_ID:-<will-auto-detect>}"
echo ""

RESPONSE=$(curl -s -X POST "${API_URL}/meta/sandbox-connect" \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"${CUSTOMER_ID}\",
    \"accessToken\": \"${ACCESS_TOKEN}\",
    \"adAccountId\": \"${AD_ACCOUNT_ID}\"
  }")

if echo "$RESPONSE" | grep -q '"status":"connected"'; then
  echo "✅ Meta Sandbox connection successful!"
  echo ""
  echo "$RESPONSE" | grep -o '"adAccounts":\[[^]]*\]' | head -1 || echo "Ad accounts: (check response)"
  echo ""
  echo "Next steps:"
  echo "1. Go to Settings → Meta and verify connection status"
  echo "2. Select an ad account if needed"
  echo "3. Run a crawl to get inventory"
  echo "4. Test preview: http://localhost:3000/ads/preview"
else
  echo "❌ Connection failed"
  echo "Response: $RESPONSE"
  exit 1
fi
