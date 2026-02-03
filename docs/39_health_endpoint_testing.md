# Health Endpoint Testing Guide

This document describes how to test the `/health` endpoint to ensure it never crashes the API, even when dependencies are down.

## Overview

The `/health` endpoint is designed to:
- **Never crash the API** - All errors are caught and handled gracefully
- **Return quickly** - Uses 1000ms timeouts for both DB and Redis checks
- **Always respond** - Returns HTTP 200 or 503, never throws exceptions
- **Be safe** - Can be called frequently without impacting performance

## Endpoint Behavior

**URL:** `GET http://localhost:3001/health`

**Response Format:**
```json
{
  "ok": boolean,
  "db": boolean,
  "redis": boolean
}
```

**Status Codes:**
- `200 OK` - All services healthy (`ok: true, db: true, redis: true`)
- `503 Service Unavailable` - One or more services unhealthy (`ok: false`)

## Manual Smoke Tests

### Test 1: Normal Operation (All Services Up)

**Setup:**
```bash
# Ensure all services are running
pnpm dev:up
```

**Test:**
```bash
curl -s http://localhost:3001/health | jq
```

**Expected Result:**
```json
{
  "ok": true,
  "db": true,
  "redis": true
}
```

**Status Code:** `200`

---

### Test 2: Database Down (API Should Stay Running)

**Setup:**
```bash
# Stop PostgreSQL container
docker compose stop postgres
```

**Test:**
```bash
# Health check should still respond
curl -s http://localhost:3001/health | jq

# Verify API is still running (try another endpoint)
curl -s http://localhost:3001/health | jq
```

**Expected Result:**
```json
{
  "ok": false,
  "db": false,
  "redis": true
}
```

**Status Code:** `503`

**Verification:**
- API server should **still be running**
- Other endpoints should still work (if they don't need DB)
- No crashes or uncaught exceptions in logs

**Cleanup:**
```bash
# Restart PostgreSQL
docker compose start postgres
sleep 2

# Verify recovery
curl -s http://localhost:3001/health | jq
# Should return: {"ok": true, "db": true, "redis": true}
```

---

### Test 3: Redis Down (API Should Stay Running)

**Setup:**
```bash
# Stop Redis container
docker compose stop redis
```

**Test:**
```bash
curl -s http://localhost:3001/health | jq
```

**Expected Result:**
```json
{
  "ok": false,
  "db": true,
  "redis": false
}
```

**Status Code:** `503`

**Verification:**
- API server should **still be running**
- No crashes or uncaught exceptions

**Cleanup:**
```bash
# Restart Redis
docker compose start redis
sleep 2

# Verify recovery
curl -s http://localhost:3001/health | jq
```

---

### Test 4: Both Services Down

**Setup:**
```bash
docker compose stop postgres redis
```

**Test:**
```bash
curl -s http://localhost:3001/health | jq
```

**Expected Result:**
```json
{
  "ok": false,
  "db": false,
  "redis": false
}
```

**Status Code:** `503`

**Verification:**
- API server should **still be running**
- Health endpoint responds quickly (< 2 seconds)

**Cleanup:**
```bash
docker compose start postgres redis
sleep 3
curl -s http://localhost:3001/health | jq
```

---

### Test 5: Timeout Behavior

**Purpose:** Verify health checks timeout quickly and don't hang

**Test:**
```bash
# Stop services
docker compose stop postgres redis

# Time the health check response
time curl -s http://localhost:3001/health | jq
```

**Expected:**
- Response time should be **< 2 seconds** (timeouts are 1000ms each)
- Should not hang or take 30+ seconds

---

### Test 6: Rapid Health Checks

**Purpose:** Verify health endpoint can handle frequent requests

**Test:**
```bash
# Run 10 health checks in quick succession
for i in {1..10}; do
  curl -s http://localhost:3001/health > /dev/null && echo "Check $i: OK" || echo "Check $i: FAILED"
done
```

**Expected:**
- All checks should succeed (return HTTP 200 or 503)
- No crashes or errors
- API should remain responsive

---

## Automated Test Script

Save this as `scripts/test-health.sh`:

```bash
#!/bin/bash
set -e

API_URL="${API_URL:-http://localhost:3001}"
HEALTH_URL="$API_URL/health"

echo "🧪 Testing /health endpoint..."
echo ""

# Test 1: Normal operation
echo "Test 1: All services up"
RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
BODY=$(echo "$RESPONSE" | head -1)
STATUS=$(echo "$RESPONSE" | tail -1)

if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS"
  echo "$BODY" | jq .
else
  echo "❌ Unexpected status: $STATUS"
  echo "$BODY"
  exit 1
fi

echo ""

# Test 2: Database down
echo "Test 2: Database down (API should stay running)"
docker compose stop postgres
sleep 1

RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
BODY=$(echo "$RESPONSE" | head -1)
STATUS=$(echo "$RESPONSE" | tail -1)

if [ "$STATUS" = "503" ]; then
  echo "✅ Status: $STATUS (expected)"
  echo "$BODY" | jq .
  DB_STATUS=$(echo "$BODY" | jq -r '.db')
  if [ "$DB_STATUS" = "false" ]; then
    echo "✅ Database correctly reported as down"
  else
    echo "❌ Database should be false"
    exit 1
  fi
else
  echo "❌ Unexpected status: $STATUS (expected 503)"
  exit 1
fi

# Verify API is still running
if curl -s "$HEALTH_URL" > /dev/null; then
  echo "✅ API is still running (good!)"
else
  echo "❌ API crashed (bad!)"
  exit 1
fi

echo ""

# Test 3: Recovery
echo "Test 3: Restart database and verify recovery"
docker compose start postgres
sleep 3

RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
BODY=$(echo "$RESPONSE" | head -1)
STATUS=$(echo "$RESPONSE" | tail -1)

if [ "$STATUS" = "200" ]; then
  echo "✅ Status: $STATUS (recovered)"
  echo "$BODY" | jq .
else
  echo "❌ Status: $STATUS (expected 200 after recovery)"
  exit 1
fi

echo ""
echo "✅ All health endpoint tests passed!"
```

**Usage:**
```bash
chmod +x scripts/test-health.sh
./scripts/test-health.sh
```

## Implementation Details

### Timeouts

- **Database check:** 1000ms timeout
- **Redis check:** 1000ms timeout
- **Total max response time:** ~2000ms (checks run in parallel)

### Error Handling

- All database errors are caught and return `db: false`
- All Redis errors are caught and return `redis: false`
- Unexpected errors in the health route handler are caught and return `503` with all services `false`
- **No uncaught exceptions** - the endpoint never crashes the API

### Performance

- Checks run in parallel using `Promise.all()`
- Each check has its own timeout
- Redis connections are created fresh and cleaned up after each check
- Database uses connection pool (no new connections per check)

## Monitoring

The health endpoint can be used for:
- **Load balancer health checks** - Returns 200/503 appropriately
- **Monitoring systems** - Simple JSON response easy to parse
- **Debugging** - Quickly identify which service is down

## Related Documentation

- [Development Process Management](./38_dev_process_stability.md)
- [Local Development Setup](./18_local_dev_setup.md)
