#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔄 Resetting development environment..."
echo ""

# Stop all services
echo "Step 1/3: Stopping services..."
"$SCRIPT_DIR/dev-down.sh"

echo ""
echo "Step 2/3: Cleaning Next.js cache..."
cd "$SCRIPT_DIR/.."
rm -rf apps/web/.next

echo ""
echo "Step 3/3: Starting services..."
"$SCRIPT_DIR/dev-up.sh"
