/**
 * Verify Supabase Storage setup - simple Node.js script
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
dotenv.config({ path: join(REPO_ROOT, ".env") });

const supabaseUrl = process.env["SUPABASE_URL"];
const supabaseServiceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

async function main() {
  console.log("🔍 Verifying Supabase Storage setup...\n");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
    process.exit(1);
  }

  console.log(`✅ Environment variables configured`);
  console.log(`   SUPABASE_URL: ${supabaseUrl}\n`);

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
  const requiredBuckets = ["creatives", "logos"];

  console.log("📦 Checking storage buckets...\n");

  for (const bucketName of requiredBuckets) {
    try {
      // Try to list files (will fail if bucket doesn't exist)
      const { data, error } = await supabase.storage.from(bucketName).list("", { limit: 1 });
      
      if (error) {
        if (error.message.includes("not found") || error.message.includes("does not exist")) {
          console.log(`❌ ${bucketName}: Bucket does not exist`);
          console.log(`   → Create it in Supabase Dashboard → Storage\n`);
        } else {
          console.log(`⚠️  ${bucketName}: Error accessing bucket`);
          console.log(`   Error: ${error.message}\n`);
        }
      } else {
        console.log(`✅ ${bucketName}: Exists and accessible`);
        
        // Test upload capability
        const testPath = `_test/${Date.now()}.txt`;
        const testContent = Buffer.from("test");
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(testPath, testContent, { contentType: "text/plain", upsert: true });
        
        if (uploadError) {
          console.log(`   ⚠️  Upload test failed: ${uploadError.message}`);
        } else {
          console.log(`   ✅ Upload test successful`);
          // Cleanup
          await supabase.storage.from(bucketName).remove([testPath]);
        }
        console.log();
      }
    } catch (err) {
      console.log(`❌ ${bucketName}: ${err instanceof Error ? err.message : String(err)}\n`);
    }
  }

  console.log("📝 Setup instructions:");
  console.log("   1. Go to: https://supabase.com/dashboard/project/rshurngbtyrqvfrsfuwp/storage/buckets");
  console.log("   2. Create buckets: 'creatives' and 'logos'");
  console.log("   3. Set both to PUBLIC (required for Meta image access)");
  console.log("   4. See: /docs/supabase_storage_setup.md for details");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
