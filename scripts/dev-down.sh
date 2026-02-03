#!/bin/bash
set -e

echo "🛑 Stopping development environment..."

# Kill Node processes
echo "🔪 Stopping Node processes..."
pkill -f "tsx watch" || true
pkill -f "next dev" || true
pkill -f "next dev:webpack" || true

# Kill processes from PID file if it exists
if [ -f /tmp/project-auto-pids.txt ]; then
  while read -r pid; do
    kill "$pid" 2>/dev/null || true
  done < <(cat /tmp/project-auto-pids.txt | tr ' ' '\n')
  rm -f /tmp/project-auto-pids.txt
fi

# Stop Docker services
echo "📦 Stopping Docker services..."
docker compose down

echo "✅ Development environment stopped!"
