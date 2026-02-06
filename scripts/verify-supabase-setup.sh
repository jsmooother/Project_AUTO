#!/bin/bash
# Verify Supabase setup (Storage + Database)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🔍 Verifying Supabase Setup..."
echo ""

# Check environment variables
echo "📋 Environment Variables:"
if grep -q "^SUPABASE_URL=https://" "$REPO_ROOT/.env"; then
  SUPABASE_URL=$(grep "^SUPABASE_URL=" "$REPO_ROOT/.env" | cut -d'=' -f2-)
  echo "   ✅ SUPABASE_URL: ${SUPABASE_URL}"
else
  echo "   ❌ SUPABASE_URL not set"
  exit 1
fi

if grep -q "^SUPABASE_SERVICE_ROLE_KEY=eyJ" "$REPO_ROOT/.env"; then
  echo "   ✅ SUPABASE_SERVICE_ROLE_KEY: Set (***)"
else
  echo "   ❌ SUPABASE_SERVICE_ROLE_KEY not set"
  exit 1
fi

echo ""
echo "📦 Storage Verification:"
cd "$REPO_ROOT"
pnpm --filter @repo/worker exec tsx src/scripts/verify-storage.ts

echo ""
echo "✅ Supabase setup verification complete!"
echo ""
echo "📝 Summary:"
echo "   ✅ Environment variables configured"
echo "   ✅ Storage buckets ('creatives' and 'logos') exist and are accessible"
echo "   ✅ Upload capability verified"
echo ""
echo "🚀 Next steps:"
echo "   1. Ensure buckets are PUBLIC (for Meta image access)"
echo "   2. Test creative generation: /ads/preview → Generate Creatives"
echo "   3. Test logo discovery: /settings → Discover logo"
