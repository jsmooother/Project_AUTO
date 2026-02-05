#!/usr/bin/env bash
# List Meta ad accounts for the given access token.
# Use this to find the correct ad account ID for META_TEST_AD_ACCOUNT_ID.
# Usage: ./scripts/list-meta-ad-accounts.sh [ACCESS_TOKEN]
# With no args: uses META_SANDBOX_ACCESS_TOKEN from .env

set -e

# Load .env from project root so token can be read from there
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
if [ -f "$PROJECT_ROOT/.env" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$PROJECT_ROOT/.env"
  set +a
fi

ACCESS_TOKEN="${1:-${META_SANDBOX_ACCESS_TOKEN:-}}"
if [ -z "$ACCESS_TOKEN" ]; then
  echo "Usage: ./scripts/list-meta-ad-accounts.sh <ACCESS_TOKEN>"
  echo "   Or set META_SANDBOX_ACCESS_TOKEN and run without arguments."
  echo ""
  echo "Get a token from: https://developers.facebook.com/tools/explorer/"
  echo "  - Select your app, then Get Token → User Token"
  echo "  - Add permission: ads_management"
  echo "  - Copy the generated token and run: ./scripts/list-meta-ad-accounts.sh <token>"
  exit 1
fi

GRAPH_VERSION="${META_GRAPH_VERSION:-v21.0}"
URL="https://graph.facebook.com/${GRAPH_VERSION}/me/adaccounts?fields=id,name,account_status&access_token=${ACCESS_TOKEN}"

echo "Fetching ad accounts from Meta Graph API..."
RESPONSE=$(curl -s "$URL")

if echo "$RESPONSE" | grep -q '"error"'; then
  echo "Meta API error:"
  echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo ""
echo "Ad accounts this token can use:"
echo "--------------------------------"
echo "$RESPONSE" | jq -r '.data[]? | "  \(.id)  \(.name // "—")  (status: \(.account_status // "—"))"' 2>/dev/null || echo "$RESPONSE"
echo ""
echo "Use one of the IDs above (with or without 'act_' prefix) in .env:"
echo "  META_TEST_AD_ACCOUNT_ID=act_<number>"
echo ""
echo "If the list is empty, the token may not have ads_management permission."
