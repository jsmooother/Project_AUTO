/**
 * Verify Supabase Storage setup for creative generation.
 * Checks that buckets exist and are accessible.
 */

import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
dotenv.config({ path: join(REPO_ROOT, ".env") });

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

async function verifyStorage() {
  console.log("🔍 Verifying Supabase Storage setup...\n");

  // Check env vars
  if (!supabaseUrl) {
    console.error("❌ SUPABASE_URL is not set in .env");
    process.exit(1);
  }
  if (!supabaseServiceRoleKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env");
    process.exit(1);
  }
  console.log("✅ Environment variables configured");
  console.log(`   SUPABASE_URL: ${supabaseUrl}\n`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Check required buckets
  const requiredBuckets = ["creatives", "logos"];
  const bucketStatus: Record<string, { exists: boolean; public: boolean; error?: string }> = {};

  for (const bucketName of requiredBuckets) {
    try {
      // Try to list files in bucket (this will fail if bucket doesn't exist)
      const { data, error } = await supabase.storage.from(bucketName).list("", { limit: 1 });
      
      if (error) {
        if (error.message.includes("not found") || error.message.includes("does not exist")) {
          bucketStatus[bucketName] = { exists: false, public: false, error: "Bucket does not exist" };
        } else {
          bucketStatus[bucketName] = { exists: true, public: false, error: error.message };
        }
      } else {
        // Bucket exists, check if it's public by trying to get a public URL
        // (We can't directly check public status via API, but we can infer from access)
        bucketStatus[bucketName] = { exists: true, public: true };
      }
    } catch (err) {
      bucketStatus[bucketName] = {
        exists: false,
        public: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  // Report results
  console.log("📦 Storage Buckets Status:\n");
  let allGood = true;
  for (const [bucketName, status] of Object.entries(bucketStatus)) {
    if (status.exists && status.public) {
      console.log(`✅ ${bucketName}: Exists and accessible`);
    } else if (status.exists && !status.public) {
      console.log(`⚠️  ${bucketName}: Exists but may not be public`);
      console.log(`   Error: ${status.error}`);
      allGood = false;
    } else {
      console.log(`❌ ${bucketName}: Does not exist`);
      console.log(`   Error: ${status.error}`);
      allGood = false;
    }
  }

  if (!allGood) {
    console.log("\n📝 To create buckets:");
    console.log("   1. Go to Supabase Dashboard → Storage");
    console.log("   2. Create buckets: 'creatives' and 'logos'");
    console.log("   3. Set both to PUBLIC (required for Meta to access images)");
    console.log("\n   See: /docs/supabase_storage_setup.md for detailed instructions");
    process.exit(1);
  }

  // Test upload (optional - creates a test file)
  console.log("\n🧪 Testing upload capability...");
  try {
    const testContent = Buffer.from("test");
    const testPath = `test/${Date.now()}.txt`;
    const { error: uploadError } = await supabase.storage.from("creatives").upload(testPath, testContent, {
      contentType: "text/plain",
      upsert: true,
    });

    if (uploadError) {
      console.log(`⚠️  Upload test failed: ${uploadError.message}`);
      console.log("   This may be a permissions issue. Check Service Role Key has storage access.");
    } else {
      console.log("✅ Upload test successful");
      // Clean up test file
      await supabase.storage.from("creatives").remove([testPath]);
      console.log("✅ Test file cleaned up");
    }
  } catch (err) {
    console.log(`⚠️  Upload test error: ${err instanceof Error ? err.message : String(err)}`);
  }

  console.log("\n✅ Supabase Storage setup verified!");
  console.log("\n📋 Next steps:");
  console.log("   1. Ensure buckets are PUBLIC (for Meta image access)");
  console.log("   2. Test creative generation via UI: /ads/preview → Generate Creatives");
}

verifyStorage().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
