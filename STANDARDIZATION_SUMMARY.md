# Local Dev Environment Standardization - Summary

## Quick Start

Run the standardization script:

```bash
./scripts/standardize-local-dev.sh
```

Or follow the manual steps in `docs/25_local_dev_standardization.md`.

---

## File Changes Made

### 1. `.env` - Added NEXT_PUBLIC_API_URL

```diff
# Redis: required for queue (API enqueues, worker consumes).
# Local: start with `docker run -p 6379:6379 redis:7` then use redis://localhost:6379
REDIS_URL=redis://localhost:6379

+# Web app API base URL (for Next.js client-side calls)
+NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. `.env.example` - Added PORT and NEXT_PUBLIC_API_URL

```diff
# Shared
NODE_ENV=development

+# API port (defaults to 3001 if not set)
+PORT=3001
+
# Database (local Docker: postgres://postgres:postgres@localhost:5432/project_auto)
DATABASE_URL=postgres://postgres:postgres@localhost:5432/project_auto

# Redis (local Docker: redis://localhost:6379)
REDIS_URL=redis://localhost:6379

+# Web app API base URL (for Next.js client-side calls)
+NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. `docker-compose.yml` - Already Correct ✓

No changes needed. Already configured:
- Postgres 16 on port 5432
- Redis on port 6379
- Named volumes for persistence
- Health checks configured

### 4. `apps/api/src/lib/env.ts` - Already Correct ✓

Already uses `override: false`, so shell PORT env vars are respected.

### 5. `apps/web/src/app/*` - Already Correct ✓

All pages already use `process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"`.

---

## Manual Command Sequence

If you prefer to run commands manually:

### Step 1: Diagnose Ports

```bash
lsof -i :5432
lsof -i :3001
```

### Step 2: Stop Local Postgres

```bash
# Stop Homebrew services
brew services stop postgresql@16 2>/dev/null || true
brew services stop postgresql@15 2>/dev/null || true
brew services stop postgresql@14 2>/dev/null || true
brew services stop postgresql 2>/dev/null || true

# Stop manual processes
POSTGRES_PIDS=$(lsof -ti :5432 | grep -v "$(docker ps -q --filter name=project-auto-postgres)")
if [ -n "$POSTGRES_PIDS" ]; then
  kill -TERM $POSTGRES_PIDS 2>/dev/null || true
  sleep 2
  kill -KILL $POSTGRES_PIDS 2>/dev/null || true
fi
```

### Step 3: Start Docker Services

```bash
docker compose down
docker compose up -d
docker compose ps
```

### Step 4: Stop Process on Port 3001

```bash
PID=$(lsof -ti :3001)
if [ -n "$PID" ]; then
  kill -TERM $PID 2>/dev/null || true
  sleep 2
  kill -KILL $PID 2>/dev/null || true
fi
```

### Step 5: Verify .env

```bash
grep -E "^(PORT|DATABASE_URL|REDIS_URL|NEXT_PUBLIC_API_URL)=" .env
```

If `NEXT_PUBLIC_API_URL` is missing, add it:

```bash
echo "" >> .env
echo "# Web app API base URL (for Next.js client-side calls)" >> .env
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" >> .env
```

### Step 6: Run Migrations

```bash
pnpm --filter @repo/db db:migrate
```

### Step 7: Verify Setup

```bash
# Check Postgres
docker exec project-auto-postgres psql -U postgres -d project_auto -c "SELECT COUNT(*) FROM onboarding_states;"

# Check API (after starting it)
curl http://localhost:3001/health
```

---

## Verification Checklist

After running standardization:

- [ ] Port 5432 is free (or only Docker Postgres is listening)
- [ ] Port 3001 is free
- [ ] Docker containers are running: `docker compose ps`
- [ ] `.env` has `NEXT_PUBLIC_API_URL=http://localhost:3001`
- [ ] Migrations ran successfully
- [ ] API starts on port 3001: `pnpm --filter @repo/api dev`
- [ ] API health check works: `curl http://localhost:3001/health`
- [ ] Web app can call API (test signup flow)

---

## Troubleshooting

### Port 5432 still in use

```bash
# Check what's using it
sudo lsof -i :5432

# If it's not Docker, kill it
sudo kill -9 <PID>
```

### Port 3001 still in use

```bash
# Find and kill
PID=$(lsof -ti :3001)
kill -9 $PID
```

### API not starting on 3001

```bash
# Check .env
grep PORT .env

# Start with explicit PORT
PORT=3001 pnpm --filter @repo/api dev
```

### Web can't connect to API

```bash
# Verify API is running
curl http://localhost:3001/health

# Check env var
grep NEXT_PUBLIC_API_URL .env

# Restart web with env var
NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm --filter @repo/web dev
```

---

## New Files Created

1. `docs/25_local_dev_standardization.md` - Comprehensive guide
2. `scripts/standardize-local-dev.sh` - Automated script
3. `STANDARDIZATION_SUMMARY.md` - This file
