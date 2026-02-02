#!/usr/bin/env bash
# Happy-path API test: signup → connect website → run crawl → save template config → run preview → approve.
# Requires: API running (e.g. pnpm --filter @repo/api dev), worker running, Redis + DB (e.g. docker compose up -d).
# Usage: ./scripts/happy-path-api.sh [API_URL]
# Example: API_URL=http://localhost:3001 ./scripts/happy-path-api.sh

set -e
API_URL="${1:-${API_URL:-http://localhost:3001}}"
COOKIE_FILE="${COOKIE_FILE:-/tmp/happy-path-cookies.txt}"
EMAIL="happy-path-$(date +%s)@test.local"

echo "API_URL=$API_URL"
echo "Signup..."
SIGNUP_RESP=$(curl -s -c "$COOKIE_FILE" -b "$COOKIE_FILE" -X POST "$API_URL/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"name\":\"Happy Path User\",\"password\":\"password123\"}")
CUSTOMER_ID=$(echo "$SIGNUP_RESP" | grep -o '"customerId":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CUSTOMER_ID" ]; then
  echo "Signup failed or missing customerId: $SIGNUP_RESP"
  exit 1
fi
echo "customerId=$CUSTOMER_ID"

echo "Connect website..."
curl -s -b "$COOKIE_FILE" -X POST "$API_URL/inventory/source" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{"websiteUrl":"https://example.com/inventory"}' | head -c 200
echo ""

echo "Run crawl..."
CRAWL_RESP=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/runs/crawl" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{}')
echo "$CRAWL_RESP" | head -c 200
echo ""

echo "Save template config..."
curl -s -b "$COOKIE_FILE" -X POST "$API_URL/templates/config" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{"templateKey":"grid_4","brandName":"Test Brand","primaryColor":"#0070f3"}' | head -c 200
echo ""

echo "Run preview..."
curl -s -b "$COOKIE_FILE" -X POST "$API_URL/templates/previews/run" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{}' | head -c 200
echo ""

echo "Waiting 15s for worker to finish preview run..."
sleep 15

echo "Approve..."
APPROVE_RESP=$(curl -s -b "$COOKIE_FILE" -X POST "$API_URL/templates/approve" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{}')
if echo "$APPROVE_RESP" | grep -q '"message":"Approved"\|"message":"Already approved"'; then
  echo "OK: Approve succeeded."
else
  echo "Approve response: $APPROVE_RESP"
  echo "If worker did not finish in time, run approve again or increase sleep."
fi

echo "Done. Log in at $API_URL (web on 3000) with $EMAIL / password123"
