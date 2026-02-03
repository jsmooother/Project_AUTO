#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_DIR="$REPO_ROOT/.dev/pids"

# Ensure PID directory exists
mkdir -p "$PID_DIR"

# Cleanup function
cleanup() {
  echo ""
  echo "🛑 Stopping development servers..."
  "$SCRIPT_DIR/dev-down.sh"
  exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if processes are already running
check_port() {
  local port=$1
  local service=$2
  if lsof -ti:$port >/dev/null 2>&1; then
    echo "⚠️  Port $port is already in use ($service)"
    local pid=$(lsof -ti:$port | head -1)
    echo "   PID: $pid"
    return 1
  fi
  return 0
}

# Check for existing processes
if [ -f "$PID_DIR/api.pid" ]; then
  API_PID=$(cat "$PID_DIR/api.pid")
  if ps -p "$API_PID" >/dev/null 2>&1; then
    echo "⚠️  API is already running (PID: $API_PID)"
    echo "   Run 'pnpm dev:down' first, or kill PID $API_PID"
    exit 1
  fi
fi

if [ -f "$PID_DIR/web.pid" ]; then
  WEB_PID=$(cat "$PID_DIR/web.pid")
  if ps -p "$WEB_PID" >/dev/null 2>&1; then
    echo "⚠️  Web is already running (PID: $WEB_PID)"
    echo "   Run 'pnpm dev:down' first, or kill PID $WEB_PID"
    exit 1
  fi
fi

if [ -f "$PID_DIR/worker.pid" ]; then
  WORKER_PID=$(cat "$PID_DIR/worker.pid")
  if ps -p "$WORKER_PID" >/dev/null 2>&1; then
    echo "⚠️  Worker is already running (PID: $WORKER_PID)"
    echo "   Run 'pnpm dev:down' first, or kill PID $WORKER_PID"
    exit 1
  fi
fi

# Check ports
if ! check_port 3001 "API"; then
  echo "   Run 'pnpm dev:down' first, or manually kill the process"
  exit 1
fi

if ! check_port 3000 "Web"; then
  echo "   Run 'pnpm dev:down' first, or manually kill the process"
  exit 1
fi

echo "🚀 Starting development environment..."

# Start Docker services
echo "📦 Starting Docker services..."
cd "$REPO_ROOT"
docker compose up -d

# Wait a moment for Docker services to be ready
sleep 2

# Start API, Worker, and Web in parallel
echo "🔧 Starting API (port 3001)..."
cd "$REPO_ROOT"
pnpm --filter @repo/api dev > /tmp/project-auto-api.log 2>&1 &
API_PID=$!
echo "$API_PID" > "$PID_DIR/api.pid"

echo "⚙️  Starting Worker..."
pnpm --filter @repo/worker dev > /tmp/project-auto-worker.log 2>&1 &
WORKER_PID=$!
echo "$WORKER_PID" > "$PID_DIR/worker.pid"

echo "🌐 Starting Web (port 3000)..."
pnpm --filter @repo/web dev:webpack > /tmp/project-auto-web.log 2>&1 &
WEB_PID=$!
echo "$WEB_PID" > "$PID_DIR/web.pid"

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
echo "🛑 Press Ctrl+C to stop all services, or run 'pnpm dev:down'"

# Wait for all background processes
wait
