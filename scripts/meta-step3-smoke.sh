#!/usr/bin/env bash
# Meta Step 3 smoke: health → (login or cookie) → meta/status → ads/status → publish → poll runs → objects.
# Requires: API + worker running, DB + Redis up. Optionally TEST_USER_EMAIL + TEST_USER_PASSWORD, or SESSION_COOKIE + CUSTOMER_ID.
# Usage: ./scripts/meta-step3-smoke.sh
#   With login: TEST_USER_EMAIL=you@example.com TEST_USER_PASSWORD=secret ./scripts/meta-step3-smoke.sh
#   With cookie: SESSION_COOKIE=<session-id> CUSTOMER_ID=<uuid> $0
#   With cookie file (after logging in in browser): COOKIE_FILE=/path/to/cookies.txt $0  (CUSTOMER_ID from GET /auth/me)

set -e
API_URL="${API_URL:-http://localhost:3001}"
COOKIE_FILE="${COOKIE_FILE:-/tmp/meta-step3-smoke-cookies.txt}"
MAX_POLL=90
POLL_INTERVAL=3

echo "=== Meta Step 3 smoke ==="
echo "API_URL=$API_URL"

# 1) Health
echo ""
echo "1) GET /health"
HEALTH=$(curl -s "$API_URL/health")
OK=$(echo "$HEALTH" | grep -o '"ok":[^,}]*' | cut -d':' -f2)
DB=$(echo "$HEALTH" | grep -o '"db":[^,}]*' | cut -d':' -f2)
REDIS=$(echo "$HEALTH" | grep -o '"redis":[^,}]*' | cut -d':' -f2)
if [ "$OK" != "true" ] || [ "$DB" != "true" ] || [ "$REDIS" != "true" ]; then
  echo "FAIL: health ok=$OK db=$DB redis=$REDIS"
  echo "$HEALTH"
  exit 1
fi
echo "OK: db=$DB redis=$REDIS"

# 2) Session + customerId
CUSTOMER_ID="${CUSTOMER_ID:-}"
if [ -n "${TEST_USER_EMAIL:-}" ] && [ -n "${TEST_USER_PASSWORD:-}" ]; then
  echo ""
  echo "2) POST /auth/login"
  LOGIN_RESP=$(curl -s -c "$COOKIE_FILE" -b "$COOKIE_FILE" -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$TEST_USER_PASSWORD\"}")
  if echo "$LOGIN_RESP" | grep -q '"customerId"'; then
    CUSTOMER_ID=$(echo "$LOGIN_RESP" | grep -o '"customerId":"[^"]*"' | cut -d'"' -f4)
  fi
  if [ -z "$CUSTOMER_ID" ]; then
    echo "FAIL: login failed or missing customerId"
    echo "$LOGIN_RESP" | head -c 500
    exit 1
  fi
  echo "OK: customerId=$CUSTOMER_ID"
elif [ -n "${SESSION_COOKIE:-}" ] && [ -n "${CUSTOMER_ID:-}" ]; then
  echo ""
  echo "2) Using SESSION_COOKIE and CUSTOMER_ID"
  printf 'session=%s\n' "$SESSION_COOKIE" > "$COOKIE_FILE"
  echo "OK: customerId=$CUSTOMER_ID"
elif [ -r "$COOKIE_FILE" ] && [ -s "$COOKIE_FILE" ]; then
  echo ""
  echo "2) GET /auth/me (cookie file)"
  ME_RESP=$(curl -s -b "$COOKIE_FILE" "$API_URL/auth/me")
  if echo "$ME_RESP" | grep -q '"customerId"'; then
    CUSTOMER_ID=$(echo "$ME_RESP" | grep -o '"customerId":"[^"]*"' | cut -d'"' -f4)
  fi
  if [ -z "$CUSTOMER_ID" ]; then
    echo "FAIL: cookie file present but /auth/me failed or missing customerId. Log in in browser, then run with COOKIE_FILE and optional CUSTOMER_ID."
    echo "$ME_RESP" | head -c 400
    exit 1
  fi
  echo "OK: customerId=$CUSTOMER_ID (from /auth/me)"
else
  echo ""
  echo "2) No session. Log in at $API_URL (or web app), then run with:"
  echo "   TEST_USER_EMAIL=... TEST_USER_PASSWORD=... $0"
  echo "   Or: SESSION_COOKIE=<session-id> CUSTOMER_ID=<uuid> $0"
  echo "   Or: save session cookie to a file and run: COOKIE_FILE=/path/to/cookies.txt $0"
  exit 1
fi

# 3) GET /meta/status
echo ""
echo "3) GET /meta/status"
META_STATUS=$(curl -s -b "$COOKIE_FILE" -H "x-customer-id: $CUSTOMER_ID" "$API_URL/meta/status")
META_STAT=$(echo "$META_STATUS" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
SEL_ACC=$(echo "$META_STATUS" | grep -o '"selectedAdAccountId":[^,}]*' | cut -d':' -f2- | tr -d '"')
if [ "$META_STAT" != "connected" ]; then
  echo "FAIL: meta status=$META_STAT (expected connected)"
  echo "$META_STATUS"
  exit 1
fi
if [ -z "$SEL_ACC" ] || [ "$SEL_ACC" = "null" ]; then
  echo "FAIL: selectedAdAccountId not set. Select an ad account in Settings → Meta."
  echo "$META_STATUS"
  exit 1
fi
echo "OK: status=connected selectedAdAccountId=$SEL_ACC"

# 4) GET /ads/status
echo ""
echo "4) GET /ads/status"
ADS_STATUS=$(curl -s -b "$COOKIE_FILE" -H "x-customer-id: $CUSTOMER_ID" "$API_URL/ads/status")
META_WRITE_MODE=$(echo "$ADS_STATUS" | grep -o '"metaWriteMode":"[^"]*"' | cut -d'"' -f4)
echo "derived.metaWriteMode=$META_WRITE_MODE"
echo "prerequisites: $ADS_STATUS" | grep -o '"prerequisites":{[^}]*}' | head -c 300
echo ""

# 5) POST /ads/publish
echo ""
echo "5) POST /ads/publish"
PUBLISH_RESP=$(curl -s -b "$COOKIE_FILE" -H "x-customer-id: $CUSTOMER_ID" -X POST "$API_URL/ads/publish" -H "Content-Type: application/json" -d '{}')
echo "$PUBLISH_RESP" | head -c 300
echo ""

# 6) Poll GET /ads/runs until latest run is success or failed (max 90s)
echo ""
echo "6) Polling GET /ads/runs (max ${MAX_POLL}s)"
ELAPSED=0
LAST_STATUS=""
LAST_ERROR=""
while [ $ELAPSED -lt $MAX_POLL ]; do
  RUNS_JSON=$(curl -s -b "$COOKIE_FILE" -H "x-customer-id: $CUSTOMER_ID" "$API_URL/ads/runs?limit=5")
  # First run in data array is latest (ordered by createdAt desc)
  LAST_STATUS=$(echo "$RUNS_JSON" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
  LAST_ERROR=$(echo "$RUNS_JSON" | grep -o '"errorMessage":[^,}]*' | head -1 | cut -d':' -f2- | tr -d '"')
  echo "  run status=$LAST_STATUS (${ELAPSED}s)"
  if [ "$LAST_STATUS" = "success" ]; then
    break
  fi
  if [ "$LAST_STATUS" = "failed" ]; then
    echo "FAIL: publish run failed."
    echo "error_message: $LAST_ERROR"
    echo "runs response (first 600 chars): ${RUNS_JSON:0:600}"
    exit 1
  fi
  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

if [ "$LAST_STATUS" != "success" ]; then
  echo "FAIL: run did not reach success within ${MAX_POLL}s (status=$LAST_STATUS)"
  exit 1
fi
echo "OK: run status=success"

# 7) GET /ads/objects -> campaign_id, adset_id
echo ""
echo "7) GET /ads/objects"
OBJECTS=$(curl -s -b "$COOKIE_FILE" -H "x-customer-id: $CUSTOMER_ID" "$API_URL/ads/objects")
CAMPAIGN_ID=$(echo "$OBJECTS" | grep -o '"campaignId":"[^"]*"' | cut -d'"' -f4)
ADSET_ID=$(echo "$OBJECTS" | grep -o '"adsetId":"[^"]*"' | cut -d'"' -f4)
echo "campaign_id=$CAMPAIGN_ID"
echo "adset_id=$ADSET_ID"
echo ""
echo "=== Meta Step 3 smoke OK ==="
