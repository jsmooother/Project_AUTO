#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PID_DIR="$REPO_ROOT/.dev/pids"

echo "🛑 Stopping development environment..."

# Function to kill a process by PID if it exists
kill_if_running() {
  local pid=$1
  local service=$2
  if [ -n "$pid" ] && ps -p "$pid" >/dev/null 2>&1; then
    echo "  Stopping $service (PID: $pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 0.5
    # Force kill if still running
    if ps -p "$pid" >/dev/null 2>&1; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  fi
}

# Function to kill processes on a specific port (fallback)
kill_port() {
  local port=$1
  local service=$2
  local pids=$(lsof -ti:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  Stopping $service on port $port (PIDs: $pids)..."
    for pid in $pids; do
      # Only kill node/tsx processes to avoid killing unrelated services
      if ps -p "$pid" >/dev/null 2>&1; then
        local cmd=$(ps -p "$pid" -o comm= 2>/dev/null || echo "")
        if [[ "$cmd" == *"node"* ]] || [[ "$cmd" == *"tsx"* ]] || [[ "$cmd" == *"next"* ]]; then
          kill "$pid" 2>/dev/null || true
          sleep 0.5
          if ps -p "$pid" >/dev/null 2>&1; then
            kill -9 "$pid" 2>/dev/null || true
          fi
        fi
      fi
    done
  fi
}

# Kill processes from PID files (preferred method)
if [ -d "$PID_DIR" ]; then
  echo "🔪 Stopping processes from PID files..."
  
  if [ -f "$PID_DIR/api.pid" ]; then
    API_PID=$(cat "$PID_DIR/api.pid")
    kill_if_running "$API_PID" "API"
    rm -f "$PID_DIR/api.pid"
  fi
  
  if [ -f "$PID_DIR/web.pid" ]; then
    WEB_PID=$(cat "$PID_DIR/web.pid")
    kill_if_running "$WEB_PID" "Web"
    rm -f "$PID_DIR/web.pid"
  fi
  
  if [ -f "$PID_DIR/worker.pid" ]; then
    WORKER_PID=$(cat "$PID_DIR/worker.pid")
    kill_if_running "$WORKER_PID" "Worker"
    rm -f "$PID_DIR/worker.pid"
  fi
fi

# Fallback: kill processes on specific ports (only node/tsx/next processes)
echo "🔍 Checking ports for remaining processes..."
kill_port 3001 "API"
kill_port 3000 "Web"

# Stop Docker services
echo "📦 Stopping Docker services..."
cd "$REPO_ROOT"
docker compose down

echo "✅ Development environment stopped!"
