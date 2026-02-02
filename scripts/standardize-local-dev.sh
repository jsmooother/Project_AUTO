#!/bin/bash
# Standardize Local Dev Environment
# This script ensures Docker Postgres owns port 5432 and API runs on port 3001

set -e

echo "=========================================="
echo "Local Dev Environment Standardization"
echo "=========================================="
echo ""

# A) Diagnose Current State
echo "A) Diagnosing current state..."
echo ""
echo "Checking port 5432 (Postgres):"
lsof -i :5432 || echo "  Port 5432 is free"
echo ""
echo "Checking port 3001 (API):"
lsof -i :3001 || echo "  Port 3001 is free"
echo ""

# B) Stop Local Postgres
echo "B) Stopping local Postgres..."
echo ""

# Check Homebrew services
echo "Checking Homebrew Postgres services..."
brew services list | grep postgres || echo "  No Homebrew Postgres services found"

# Stop Homebrew Postgres (try common names)
echo "Stopping Homebrew Postgres services..."
brew services stop postgresql@16 2>/dev/null && echo "  Stopped postgresql@16" || true
brew services stop postgresql@15 2>/dev/null && echo "  Stopped postgresql@15" || true
brew services stop postgresql@14 2>/dev/null && echo "  Stopped postgresql@14" || true
brew services stop postgresql 2>/dev/null && echo "  Stopped postgresql" || true

# Check for Postgres.app
if pgrep -f "Postgres.app" > /dev/null; then
  echo "  ⚠️  Postgres.app detected. Please quit Postgres.app manually from Applications."
  echo "  Opening Postgres.app..."
  open -a "Postgres.app" 2>/dev/null || true
fi

# Find and stop manual postgres processes (excluding Docker)
echo "Checking for manual postgres processes..."
POSTGRES_PIDS=$(lsof -ti :5432 2>/dev/null | grep -v "$(docker ps -q --filter name=project-auto-postgres 2>/dev/null || echo '')" || true)
if [ -n "$POSTGRES_PIDS" ]; then
  echo "  Found postgres processes: $POSTGRES_PIDS"
  echo "  Attempting graceful stop (SIGTERM)..."
  kill -TERM $POSTGRES_PIDS 2>/dev/null || true
  sleep 2
  # Force kill if still running
  kill -KILL $POSTGRES_PIDS 2>/dev/null || true
  echo "  Processes stopped"
else
  echo "  No manual postgres processes found"
fi

# Verify port 5432
echo ""
echo "Verifying port 5432 is free (should show only Docker or nothing):"
lsof -i :5432 || echo "  Port 5432 is free ✓"
echo ""

# C) Ensure Docker Compose is Running
echo "C) Ensuring Docker Compose is configured and running..."
echo ""

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Start containers
echo "Starting Docker containers..."
docker compose up -d

# Wait for containers to be ready
echo "Waiting for containers to be ready..."
sleep 3

# Check status
echo "Container status:"
docker compose ps

# Verify Postgres health
echo ""
echo "Checking Postgres health..."
docker compose logs postgres | tail -5

# Verify Redis health
echo ""
echo "Checking Redis health..."
docker compose logs redis | tail -5

# Test Postgres connection
echo ""
echo "Testing Postgres connection..."
docker exec project-auto-postgres psql -U postgres -d project_auto -c "SELECT version();" || echo "  ⚠️  Postgres not ready yet, wait a few seconds and try again"
echo ""

# D) Fix API Port 3001
echo "D) Fixing API port 3001 conflict..."
echo ""

# Find process on 3001
PID=$(lsof -ti :3001 2>/dev/null || true)
if [ -n "$PID" ]; then
  echo "  Found process $PID on port 3001. Stopping..."
  kill -TERM $PID 2>/dev/null || true
  sleep 2
  # Force kill if still running
  kill -KILL $PID 2>/dev/null || true
  echo "  Process stopped ✓"
else
  echo "  Port 3001 is free ✓"
fi

# Verify port 3001
echo ""
echo "Verifying port 3001 is free:"
lsof -i :3001 || echo "  Port 3001 is free ✓"
echo ""

# E) Verify Environment Variables
echo "E) Verifying environment variables..."
echo ""

if [ -f .env ]; then
  echo "Checking .env file:"
  grep -E "^(PORT|DATABASE_URL|REDIS_URL|NEXT_PUBLIC_API_URL)=" .env || echo "  ⚠️  Some required vars missing"
  echo ""
  
  # Check if NEXT_PUBLIC_API_URL is set
  if ! grep -q "NEXT_PUBLIC_API_URL" .env; then
    echo "  ⚠️  NEXT_PUBLIC_API_URL not found in .env, adding..."
    echo "" >> .env
    echo "# Web app API base URL (for Next.js client-side calls)" >> .env
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" >> .env
    echo "  ✓ Added NEXT_PUBLIC_API_URL to .env"
  fi
else
  echo "  ⚠️  .env file not found. Copy from .env.example:"
  echo "  cp .env.example .env"
fi
echo ""

# F) Run Migrations
echo "F) Running migrations against Docker Postgres..."
echo ""

# Ensure Postgres is ready
echo "Waiting for Postgres to be ready..."
sleep 2

# Run migrations
echo "Running migrations..."
pnpm --filter @repo/db db:migrate

# Verify migrations
echo ""
echo "Verifying migrations (checking onboarding_states table)..."
docker exec project-auto-postgres psql -U postgres -d project_auto -c "\dt onboarding_states" || echo "  ⚠️  Table not found (migrations may have failed)"

echo ""
echo "=========================================="
echo "Standardization Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start API:    pnpm --filter @repo/api dev"
echo "2. Start Web:    pnpm --filter @repo/web dev"
echo "3. Start Worker: pnpm --filter @repo/worker dev"
echo ""
echo "Verify API is running:"
echo "  curl http://localhost:3001/health"
echo ""
echo "Then test the onboarding flow:"
echo "  http://localhost:3000/signup"
echo ""
