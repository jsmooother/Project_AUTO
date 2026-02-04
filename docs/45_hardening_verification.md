# Hardening Verification Checklist

## Changes Implemented

### 1. CORS Allowlist (apps/api/src/server.ts)
- ✅ Added `CORS_ORIGIN` env var parsing (comma-separated origins)
- ✅ Implemented allowlist function: allows requests with Origin header in allowlist, or no Origin (server-to-server)
- ✅ Production behavior: if `CORS_ORIGIN` not set, CORS is disabled (`origin: false`) with warning
- ✅ Development behavior: if `CORS_ORIGIN` not set, all origins allowed (`origin: true`)
- ✅ Credentials remain enabled (`credentials: true`)
- ✅ Updated `.env.example` with `CORS_ORIGIN` documentation
- ✅ Added note to README.md about CORS_ORIGIN

### 2. Ads Run Dedupe (apps/api/src/routes/ads.ts)
- ✅ Added `inArray` import from drizzle-orm
- ✅ Updated `/ads/sync` dedupe to check both `"queued"` and `"running"` statuses
- ✅ Updated `/ads/publish` dedupe to check both `"queued"` and `"running"` statuses
- ✅ Response format unchanged: returns `{ runId, deduped: true }` when deduped

---

## Verification Steps

### CORS Allowlist

**Local Development (no CORS_ORIGIN set):**
1. Start API: `pnpm --filter @repo/api dev`
2. From browser console on `http://localhost:3000`, run:
   ```javascript
   fetch('http://localhost:3001/health', { credentials: 'include' })
   ```
3. ✅ Should succeed (all origins allowed in dev)

**Local Development (with CORS_ORIGIN set):**
1. Set `CORS_ORIGIN=http://localhost:3000` in `.env`
2. Restart API
3. From `http://localhost:3000`, run same fetch
4. ✅ Should succeed (origin in allowlist)
5. From `http://localhost:3001` (different origin), run fetch
6. ✅ Should fail CORS (origin not in allowlist)

**Production Mode (no CORS_ORIGIN set):**
1. Set `NODE_ENV=production` in `.env`
2. Start API: `pnpm --filter @repo/api dev`
3. Check logs: ✅ Should see warning: "CORS_ORIGIN is not set in production. CORS is disabled..."
4. From browser, run fetch with credentials
5. ✅ Should fail CORS (CORS disabled)

**Production Mode (with CORS_ORIGIN set):**
1. Set `NODE_ENV=production` and `CORS_ORIGIN=https://app.projectauto.com`
2. Restart API
3. From `https://app.projectauto.com`, run fetch
4. ✅ Should succeed (origin in allowlist)
5. From `https://evil.com`, run fetch
6. ✅ Should fail CORS (origin not in allowlist)

**Server-to-Server (no Origin header):**
1. Run: `curl -v http://localhost:3001/health`
2. ✅ Should succeed (no Origin header = allowed)

### Ads Run Dedupe

**Test 1: Quick double-click on Publish (queued dedupe)**
1. Go to Ads page
2. Click "Publish Campaign" button
3. Immediately click "Publish Campaign" again (< 1 second)
4. ✅ Second request should return `{ runId: "...", deduped: true }` (same runId as first)
5. Check API logs: ✅ Should see `event: "enqueue_deduped"`

**Test 2: Publish while run is running**
1. Click "Publish Campaign"
2. Wait 2-3 seconds (run should transition to "running")
3. Click "Publish Campaign" again (while first is still running)
4. ✅ Second request should return `{ runId: "...", deduped: true }` (same runId as first)
5. Check API logs: ✅ Should see `event: "enqueue_deduped"`

**Test 3: Same for /ads/sync**
1. Trigger `/ads/sync` twice quickly (via API or admin endpoint)
2. ✅ Second request should dedupe if first is queued or running

**Test 4: After 30+ seconds**
1. Click "Publish Campaign"
2. Wait 35+ seconds (dedupe window expires)
3. Click "Publish Campaign" again
4. ✅ Should create new run (not deduped)

---

## Manual Testing Commands

### CORS Testing

```bash
# Test from allowed origin (if CORS_ORIGIN set)
curl -H "Origin: http://localhost:3000" \
     -H "Cookie: session=..." \
     -v http://localhost:3001/health

# Test from disallowed origin
curl -H "Origin: https://evil.com" \
     -v http://localhost:3001/health

# Test server-to-server (no Origin)
curl -v http://localhost:3001/health
```

### Ads Dedupe Testing

```bash
# Get session cookie first (login via browser, copy cookie)
SESSION_COOKIE="your-session-id"
CUSTOMER_ID="your-customer-id"

# First publish
curl -X POST http://localhost:3001/ads/publish \
     -H "Cookie: session=$SESSION_COOKIE" \
     -H "x-customer-id: $CUSTOMER_ID" \
     -H "Content-Type: application/json"

# Immediately second publish (should dedupe)
curl -X POST http://localhost:3001/ads/publish \
     -H "Cookie: session=$SESSION_COOKIE" \
     -H "x-customer-id: $CUSTOMER_ID" \
     -H "Content-Type: application/json"
```

---

## Expected Behavior Summary

| Scenario | CORS Behavior | Ads Dedupe Behavior |
|----------|---------------|---------------------|
| Dev, no CORS_ORIGIN | ✅ All origins allowed | ✅ Dedupe queued + running |
| Dev, CORS_ORIGIN set | ✅ Only allowlist origins | ✅ Dedupe queued + running |
| Prod, no CORS_ORIGIN | ❌ CORS disabled (secure) | ✅ Dedupe queued + running |
| Prod, CORS_ORIGIN set | ✅ Only allowlist origins | ✅ Dedupe queued + running |
| Server-to-server (no Origin) | ✅ Always allowed | N/A |
