#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 Starting E2E development environment..."

# Step 1: Start Docker services
echo "📦 Starting Docker services (Postgres + Redis)..."
cd "$REPO_ROOT"
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 3

# Step 2: Run migrations
echo "🗄️  Running database migrations..."
cd "$REPO_ROOT"
pnpm db:migrate

# Step 3: Start API, Worker, Web using existing dev-up script
echo "🔧 Starting API, Worker, and Web..."
"$SCRIPT_DIR/dev-up.sh"
