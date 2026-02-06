/**
 * Verify Supabase Storage setup
 * Run with: pnpm --filter @repo/worker exec tsx src/scripts/verify-storage.ts
 */

// Load environment variables (same as worker index.ts)
import "../lib/env.js";

// Import storage functions
import { isStorageConfigured, CREATIVES_BUCKET, LOGOS_BUCKET, uploadBuffer } from "../lib/storage.js";

async function main() {
  console.log("🔍 Verifying Supabase Storage setup...\n");

  // Check configuration
  if (!isStorageConfigured()) {
    console.error("❌ Storage is not configured");
    console.error("   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
    process.exit(1);
  }

  console.log("✅ Storage configuration detected");
  console.log(`   SUPABASE_URL: ${process.env["SUPABASE_URL"]}\n`);

  // Test uploads to both buckets
  const buckets = [
    { name: CREATIVES_BUCKET, path: `_test/verify-${Date.now()}.txt` },
    { name: LOGOS_BUCKET, path: `_test/verify-${Date.now()}.txt` },
  ];

  console.log("📦 Testing bucket access...\n");

  for (const bucket of buckets) {
    try {
      const testContent = Buffer.from("test");
      const url = await uploadBuffer({
        bucket: bucket.name,
        path: bucket.path,
        contentType: "text/plain",
        buffer: testContent,
      });

      console.log(`✅ ${bucket.name}: Upload successful`);
      console.log(`   URL: ${url}`);

      // Verify URL is accessible (basic check - URL format)
      if (url.includes(`/storage/v1/object/public/${bucket.name}/`)) {
        console.log(`   ✅ Public URL format correct`);
      } else {
        console.log(`   ⚠️  URL format may be incorrect`);
      }
      console.log();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.log(`❌ ${bucket.name}: Upload failed`);
      console.log(`   Error: ${errorMsg}`);

      if (errorMsg.includes("not found") || errorMsg.includes("does not exist")) {
        console.log(`   → Bucket '${bucket.name}' does not exist`);
        console.log(`   → Create it in Supabase Dashboard → Storage`);
        console.log(`   → Set it to PUBLIC (required for Meta image access)`);
      }
      console.log();
    }
  }

  console.log("📝 Setup checklist:");
  console.log("   ✅ Environment variables configured");
  console.log("   ⬜ Buckets 'creatives' and 'logos' exist");
  console.log("   ⬜ Buckets are set to PUBLIC");
  console.log("   ⬜ Service Role Key has storage access");
  console.log("\n   See: /docs/supabase_storage_setup.md for detailed instructions");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
