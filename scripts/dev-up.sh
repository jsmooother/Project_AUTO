#!/bin/bash
set -e

# Cleanup function
cleanup() {
  echo ""
  echo "🛑 Stopping development servers..."
  if [ -f /tmp/project-auto-pids.txt ]; then
    while read -r pid; do
      kill "$pid" 2>/dev/null || true
    done < <(cat /tmp/project-auto-pids.txt | tr ' ' '\n')
    rm -f /tmp/project-auto-pids.txt
  fi
  pkill -f "tsx watch" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
  pkill -f "next dev:webpack" 2>/dev/null || true
  exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

echo "🚀 Starting development environment..."

# Start Docker services
echo "📦 Starting Docker services..."
cd "$(dirname "$0")/.."
docker compose up -d

# Wait a moment for Docker services to be ready
sleep 2

# Start API, Worker, and Web in parallel
echo "🔧 Starting API (port 3001)..."
pnpm --filter @repo/api dev > /tmp/project-auto-api.log 2>&1 &
API_PID=$!

echo "⚙️  Starting Worker..."
pnpm --filter @repo/worker dev > /tmp/project-auto-worker.log 2>&1 &
WORKER_PID=$!

echo "🌐 Starting Web (port 3000)..."
pnpm --filter @repo/web dev:webpack > /tmp/project-auto-web.log 2>&1 &
WEB_PID=$!

echo ""
echo "✅ Development environment started!"
echo ""
echo "📊 Services:"
echo "  - API:    http://localhost:3001 (PID: $API_PID)"
echo "  - Web:    http://localhost:3000 (PID: $WEB_PID)"
echo "  - Worker: running (PID: $WORKER_PID)"
echo ""
echo "📝 Logs:"
echo "  - API:    tail -f /tmp/project-auto-api.log"
echo "  - Web:    tail -f /tmp/project-auto-web.log"
echo "  - Worker: tail -f /tmp/project-auto-worker.log"
echo ""
echo "🛑 Press Ctrl+C to stop all services"

# Save PIDs for cleanup
echo "$API_PID $WORKER_PID $WEB_PID" > /tmp/project-auto-pids.txt

# Wait for all background processes
wait
