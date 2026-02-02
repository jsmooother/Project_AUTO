#!/usr/bin/env bash
# Restart dev servers cleanly to fix 500 errors, EADDRINUSE, and chunk loading issues.
# Run from project root: ./scripts/restart-dev.sh

set -e

echo "Stopping processes on ports 3000, 3001, 3002..."

for port in 3000 3001 3002; do
  if lsof -ti:$port >/dev/null 2>&1; then
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    echo "  Killed process on port $port"
  fi
done

echo "Cleaning Next.js cache (apps/web/.next)..."
rm -rf apps/web/.next

echo "Done. Start dev servers with:"
echo "  pnpm --filter @repo/api dev     # API on port 3001 (or PORT from .env)"
echo "  pnpm --filter @repo/worker dev  # Worker"
echo "  pnpm --filter @repo/web dev     # Web on port 3000"
echo ""
echo "Or use turbo: pnpm dev"
echo ""
echo "Note: If API runs on a different port (e.g. 3002), set NEXT_PUBLIC_API_URL in .env:"
echo "  NEXT_PUBLIC_API_URL=http://localhost:3002"
