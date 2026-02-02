# Local Docker Setup Guide

This guide covers the **Hybrid Setup (Recommended)** where Postgres and Redis run in Docker, while API, worker, and web run locally for fast development iteration.

## Architecture Overview

### Setup A: Hybrid (Recommended)
- ✅ **Postgres**: Docker container (port 5432)
- ✅ **Redis**: Docker container (port 6379)
- ✅ **API**: Local Node.js (port 3001)
- ✅ **Worker**: Local Node.js
- ✅ **Web**: Local Next.js (port 3000)

**Why Hybrid?**
- Fast hot-reload for code changes
- Easy debugging with local breakpoints
- Simple to restart individual services
- Database persistence via Docker volumes

### Setup B: Full Compose (Future)
- All services containerized (Postgres, Redis, API, Worker, Web)
- Better for production-like testing
- Requires Dockerfile creation and more complex setup

---

## Step-by-Step Setup

### 1. Start Docker Services

```bash
# Start Postgres + Redis
docker-compose up -d

# Verify services are running
docker-compose ps

# Check logs if needed
docker-compose logs -f postgres
docker-compose logs -f redis
```

### 2. Set Up Environment

```bash
# Copy example env file
cp .env.example .env

# Verify DATABASE_URL and REDIS_URL point to localhost
# Defaults in .env.example:
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/project_auto
# REDIS_URL=redis://localhost:6379
```

### 3. Verify Database Connection

```bash
# Test Postgres connection
psql postgres://postgres:postgres@localhost:5432/project_auto -c "SELECT version();"

# Or using docker exec
docker exec -it project-auto-postgres psql -U postgres -d project_auto -c "SELECT version();"

# Test Redis connection
redis-cli -h localhost -p 6379 ping
# Should return: PONG
```

### 4. Run Migrations

```bash
# From repo root
pnpm --filter @repo/db db:migrate

# Expected output: "Skip (already applied):" for each migration
# Or "Applied:" for new migrations
```

### 5. Start Development Servers

Open **three separate terminals**:

**Terminal 1 - API Server:**
```bash
pnpm --filter @repo/api dev
# API runs on http://localhost:3001
# Health check: http://localhost:3001/health
```

**Terminal 2 - Worker:**
```bash
pnpm --filter @repo/worker dev
# Worker consumes jobs from Redis queue
```

**Terminal 3 - Web Frontend:**
```bash
pnpm --filter @repo/web dev
# Web runs on http://localhost:3000
```

### 6. Verify Everything Works

```bash
# Check API health
curl http://localhost:3001/health

# Check Postgres is accessible
psql postgres://postgres:postgres@localhost:5432/project_auto -c "\dt"

# Check Redis
redis-cli -h localhost -p 6379 INFO server
```

---

## Docker Commands Reference

### Start/Stop Services

```bash
# Start in background
docker-compose up -d

# Start with logs
docker-compose up

# Stop services (keeps volumes)
docker-compose down

# Stop and remove volumes (⚠️ deletes all data)
docker-compose down -v

# Restart a specific service
docker-compose restart postgres
```

### Database Management

```bash
# Connect to Postgres
docker exec -it project-auto-postgres psql -U postgres -d project_auto

# Or from host
psql postgres://postgres:postgres@localhost:5432/project_auto

# View database size
docker exec project-auto-postgres psql -U postgres -d project_auto -c "SELECT pg_size_pretty(pg_database_size('project_auto'));"

# List all tables
docker exec project-auto-postgres psql -U postgres -d project_auto -c "\dt"
```

### Redis Management

```bash
# Connect to Redis CLI
docker exec -it project-auto-redis redis-cli

# Or from host
redis-cli -h localhost -p 6379

# Check Redis info
docker exec project-auto-redis redis-cli INFO

# Flush all data (⚠️ destructive)
docker exec project-auto-redis redis-cli FLUSHALL
```

### Volume Management

```bash
# List volumes
docker volume ls | grep project-auto

# Inspect volume
docker volume inspect project-auto_postgres_data

# Backup Postgres data
docker exec project-auto-postgres pg_dump -U postgres project_auto > backup.sql

# Restore Postgres data
docker exec -i project-auto-postgres psql -U postgres project_auto < backup.sql
```

---

## Troubleshooting

### Port Already in Use

If ports 5432 or 6379 are already in use:

1. **Check what's using the port:**
   ```bash
   # macOS
   lsof -i :5432
   lsof -i :6379
   
   # Linux
   netstat -tulpn | grep :5432
   ```

2. **Option A: Stop conflicting service**
   ```bash
   # Stop local Postgres
   brew services stop postgresql
   
   # Stop local Redis
   brew services stop redis
   ```

3. **Option B: Change Docker ports** (edit `docker-compose.yml`):
   ```yaml
   ports:
     - "5433:5432"  # Use 5433 instead of 5432
   ```
   Then update `.env`:
   ```
   DATABASE_URL=postgres://postgres:postgres@localhost:5433/project_auto
   ```

### Database Connection Errors

```bash
# Verify Postgres is running
docker-compose ps postgres

# Check Postgres logs
docker-compose logs postgres

# Test connection
psql postgres://postgres:postgres@localhost:5432/project_auto -c "SELECT 1;"
```

### Migration Issues

```bash
# Check applied migrations
psql postgres://postgres:postgres@localhost:5432/project_auto -c "SELECT * FROM schema_migrations ORDER BY applied_at;"

# Reset database (⚠️ destructive)
docker-compose down -v
docker-compose up -d
pnpm --filter @repo/db db:migrate
```

### Redis Connection Issues

```bash
# Verify Redis is running
docker-compose ps redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping

# Check Redis logs
docker-compose logs redis
```

---

## Environment Variables

### Required for Local Dev

| Variable | Default (Docker) | Description |
|----------|------------------|-------------|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/project_auto` | Postgres connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |
| `NODE_ENV` | `development` | Node environment |

### Optional

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL (for storage/auth) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `META_ACCESS_TOKEN` | Meta API access token |
| `META_AD_ACCOUNT_ID` | Meta ad account ID |
| `AGENTQL_API_KEY` | AgentQL API key |

---

## Next Steps

- Run validation: `./scripts/validate-local.sh`
- See [Local Validation Guide](./22_local_validation.md)
- See [Architecture Overview](./02_architecture_overview.md)
