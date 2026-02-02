# Local Dev Environment Standardization Guide

This guide standardizes the local development environment to use Docker Postgres on port 5432 and ensures the API runs consistently on port 3001.

## A) Diagnose Current State

Run these commands to identify what's using ports 5432 and 3001:

```bash
# Check port 5432 (Postgres)
lsof -i :5432

# Check port 3001 (API)
lsof -i :3001
```

**What to look for:**
- **Port 5432**: If you see a `postgres` process owned by your user (not Docker), that's local Postgres that needs to be stopped.
- **Port 3001**: If you see a `node` process, it's likely a leftover dev server. Note the PID for stopping.

**Expected output after cleanup:**
- Port 5432: Only Docker container `project-auto-postgres` should be listening
- Port 3001: Should be free (nothing listening)

---

## B) Stop Local Postgres on 5432 (macOS)

Run these commands in order to safely stop local Postgres:

```bash
# 1. Check if Postgres is running via Homebrew services
brew services list | grep postgres

# 2. Stop Homebrew Postgres (try common service names)
brew services stop postgresql@16 2>/dev/null || true
brew services stop postgresql@15 2>/dev/null || true
brew services stop postgresql@14 2>/dev/null || true
brew services stop postgresql 2>/dev/null || true

# 3. Check for Postgres.app (if installed)
if pgrep -f "Postgres.app" > /dev/null; then
  echo "Postgres.app detected. Please quit Postgres.app manually from Applications."
  open -a "Postgres.app" 2>/dev/null || true
fi

# 4. Find and stop any manual postgres processes
POSTGRES_PIDS=$(lsof -ti :5432 | grep -v "$(docker ps -q --filter name=project-auto-postgres)")
if [ -n "$POSTGRES_PIDS" ]; then
  echo "Found postgres processes: $POSTGRES_PIDS"
  echo "Attempting graceful stop (SIGTERM)..."
  kill -TERM $POSTGRES_PIDS 2>/dev/null || true
  sleep 2
  # Force kill if still running
  kill -KILL $POSTGRES_PIDS 2>/dev/null || true
fi

# 5. Verify port 5432 is free (should show only Docker or nothing)
echo "Checking port 5432..."
lsof -i :5432
```

**Expected result:** Only Docker container should be on port 5432, or the port should be free.

---

## C) Ensure Docker Compose is Configured Correctly

The `docker-compose.yml` is already correctly configured. Verify and start:

```bash
# 1. Stop any existing containers
docker compose down

# 2. Start Postgres and Redis
docker compose up -d

# 3. Check container status
docker compose ps

# 4. Verify Postgres is healthy (wait a few seconds if just started)
docker compose logs postgres | tail -20

# 5. Verify Redis is healthy
docker compose logs redis | tail -20

# 6. Test Postgres connection
docker exec project-auto-postgres psql -U postgres -d project_auto -c "SELECT version();"
```

**Expected output:**
- Both containers should show `Up` status
- Postgres logs should show "database system is ready to accept connections"
- Redis logs should show "Ready to accept connections"
- Postgres version query should return PostgreSQL 16.x

---

## D) Fix API Port 3001 Conflict

```bash
# 1. Identify what's using port 3001
lsof -i :3001

# 2. If you see a node process, get its PID and stop it gracefully
PID=$(lsof -ti :3001)
if [ -n "$PID" ]; then
  echo "Found process $PID on port 3001. Stopping..."
  kill -TERM $PID 2>/dev/null || true
  sleep 2
  # Force kill if still running
  kill -KILL $PID 2>/dev/null || true
  echo "Process stopped."
fi

# 3. Verify port 3001 is free
lsof -i :3001
```

**Note:** The API reads `PORT` from root `.env` (which is set to 3001). The env loader uses `override: false`, so if you set `PORT=3001` in your shell, it won't be overwritten. The API defaults to 3001 if PORT is not set.

---

## E) Standardize Environment Variables

The root `.env` file should have these values. Verify:

```bash
# Check current .env values
grep -E "^(PORT|DATABASE_URL|REDIS_URL|NEXT_PUBLIC_API_URL)=" .env
```

**Required values:**
- `PORT=3001` (for API)
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/project_auto`
- `REDIS_URL=redis://localhost:6379`
- `NEXT_PUBLIC_API_URL=http://localhost:3001` (for web app)

If `NEXT_PUBLIC_API_URL` is missing, add it to `.env`.

---

## F) Re-run Migrations Against Docker Postgres

```bash
# 1. Ensure Docker Postgres is running
docker compose ps | grep postgres

# 2. Run migrations
pnpm --filter @repo/db db:migrate

# 3. Verify migrations applied (check for onboarding_states table)
docker exec project-auto-postgres psql -U postgres -d project_auto -c "\dt onboarding_states"

# 4. Verify a known table exists
docker exec project-auto-postgres psql -U postgres -d project_auto -c "SELECT COUNT(*) FROM onboarding_states;"
```

**Expected output:**
- Migrations should show "Applied: 0016_onboarding_states.sql" (if not already applied)
- `\dt onboarding_states` should show the table exists
- `SELECT COUNT(*)` should return a number (may be 0 if no data)

---

## G) End-to-End Verification

### Start Services

```bash
# Terminal 1: Start API
pnpm --filter @repo/api dev

# Terminal 2: Start Web
pnpm --filter @repo/web dev

# Terminal 3: Start Worker (optional for onboarding)
pnpm --filter @repo/worker dev
```

### Browser Verification Checklist

1. **Signup**
   - Navigate to: http://localhost:3000/signup
   - Fill in email and organization name
   - Submit form
   - Should redirect to `/dashboard`

2. **Refresh Dashboard**
   - After signup, refresh the page (F5 or Cmd+R)
   - Status should show: `not_started`
   - Both steps should show "❌ Not completed"

3. **Complete Company Step**
   - Click "Add Company Information"
   - Fill in company name (required) and website (optional)
   - Click Save
   - Should redirect back to dashboard

4. **Refresh Dashboard**
   - Refresh the page
   - Status should show: `in_progress`
   - Company Info should show "✅ Completed"
   - Budget Info should show "❌ Not completed"

5. **Complete Budget Step**
   - Click "Add Budget Information"
   - Fill in monthly budget amount
   - Select currency (defaults to USD)
   - Click Save
   - Should redirect back to dashboard

6. **Final Refresh**
   - Refresh the page
   - Status should show: `completed`
   - Both steps should show "✅ Completed"
   - Should see completion message

### curl Verification (Alternative)

```bash
# Set API base URL
API_URL="http://localhost:3001"

# 1. Signup
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test Org"}')
echo "$SIGNUP_RESPONSE"

# Extract customerId (requires jq or manual copy)
CUSTOMER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"customerId":"[^"]*"' | cut -d'"' -f4)
echo "Customer ID: $CUSTOMER_ID"

# 2. Check initial status (refresh 1)
curl -s "$API_URL/onboarding/status" -H "x-customer-id: $CUSTOMER_ID" | jq .

# 3. Complete company step
curl -s -X POST "$API_URL/onboarding/company" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{"companyName":"Acme Corp","companyWebsite":"https://acme.com"}' | jq .

# 4. Check status after company (refresh 2)
curl -s "$API_URL/onboarding/status" -H "x-customer-id: $CUSTOMER_ID" | jq .

# 5. Complete budget step
curl -s -X POST "$API_URL/onboarding/budget" \
  -H "Content-Type: application/json" \
  -H "x-customer-id: $CUSTOMER_ID" \
  -d '{"monthlyBudgetAmount":5000,"budgetCurrency":"USD"}' | jq .

# 6. Check final status (refresh 3)
curl -s "$API_URL/onboarding/status" -H "x-customer-id: $CUSTOMER_ID" | jq .
```

**Expected curl outputs:**
- Step 2: `"status": "not_started"`
- Step 4: `"status": "in_progress"`, `"companyInfoCompleted": true`
- Step 6: `"status": "completed"`, both steps completed

---

## Troubleshooting

### Port 5432 still in use after stopping local Postgres

```bash
# Check if Docker is using it
docker ps | grep postgres

# If Docker is not running, start it
docker compose up -d postgres

# If something else is using it, find and kill it
sudo lsof -i :5432
# Then kill the PID shown (replace PID with actual number)
sudo kill -9 PID
```

### API still not starting on 3001

```bash
# Check if PORT is set correctly
grep PORT .env

# Check if something is still using 3001
lsof -i :3001

# Start API with explicit PORT
PORT=3001 pnpm --filter @repo/api dev
```

### Web app can't connect to API

```bash
# Verify API is running
curl http://localhost:3001/health

# Check NEXT_PUBLIC_API_URL in .env
grep NEXT_PUBLIC_API_URL .env

# Restart web app after setting NEXT_PUBLIC_API_URL
NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm --filter @repo/web dev
```

---

## Summary

After completing all steps:
- ✅ Docker Postgres owns port 5432
- ✅ API runs on port 3001 consistently
- ✅ Web app calls API on port 3001
- ✅ Migrations run against Docker Postgres
- ✅ Refresh-proof behavior verified
