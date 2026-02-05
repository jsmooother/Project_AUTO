#!/usr/bin/env npx tsx
/**
 * Clear all users and inventory data from the database.
 * This deletes all customers, which will cascade delete most related data.
 * Run from repo root: tsx scripts/clear-all-data.ts
 */

import dotenv from "dotenv";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { db } from "@repo/db";
import {
  customers,
  users,
  sessions,
  inventorySources,
  inventoryItems,
  crawlRuns,
  runEvents,
  onboardingStates,
} from "@repo/db/schema";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
dotenv.config({ path: join(REPO_ROOT, ".env") });

async function main() {
  console.log("🗑️  Clearing all users and inventory data...\n");

  // Count before deletion
  const [customerCount] = await db.select().from(customers);
  const [userCount] = await db.select().from(users);
  const [inventorySourceCount] = await db.select().from(inventorySources);
  const [inventoryItemCount] = await db.select().from(inventoryItems);
  const [crawlRunCount] = await db.select().from(crawlRuns);

  console.log("Current data counts:");
  console.log(`  - Customers: ${customerCount ? "1+" : "0"}`);
  console.log(`  - Users: ${userCount ? "1+" : "0"}`);
  console.log(`  - Inventory Sources: ${inventorySourceCount ? "1+" : "0"}`);
  console.log(`  - Inventory Items: ${inventoryItemCount ? "1+" : "0"}`);
  console.log(`  - Crawl Runs: ${crawlRunCount ? "1+" : "0"}\n`);

  // Delete run_events first (they have SET NULL constraints, not CASCADE)
  const runEventsDeleted = await db.delete(runEvents);
  console.log(`✓ Deleted run_events`);

  // Delete all customers - this will cascade delete:
  // - users (CASCADE)
  // - sessions (CASCADE)
  // - inventorySources (CASCADE)
  // - inventoryItems (CASCADE)
  // - crawlRuns (CASCADE)
  // - onboardingStates (CASCADE)
  // - and all other customer-scoped tables
  await db.delete(customers);
  console.log(`✓ Deleted all customers (cascaded to related data)`);

  // Verify deletion
  const [remainingCustomers] = await db.select().from(customers).limit(1);
  const [remainingUsers] = await db.select().from(users).limit(1);
  const [remainingInventorySources] = await db.select().from(inventorySources).limit(1);
  const [remainingInventoryItems] = await db.select().from(inventoryItems).limit(1);
  const [remainingCrawlRuns] = await db.select().from(crawlRuns).limit(1);

  console.log("\n✅ Cleanup complete!");
  console.log("\nVerification:");
  console.log(`  - Customers remaining: ${remainingCustomers ? "ERROR: Still exists!" : "0 ✓"}`);
  console.log(`  - Users remaining: ${remainingUsers ? "ERROR: Still exists!" : "0 ✓"}`);
  console.log(`  - Inventory Sources remaining: ${remainingInventorySources ? "ERROR: Still exists!" : "0 ✓"}`);
  console.log(`  - Inventory Items remaining: ${remainingInventoryItems ? "ERROR: Still exists!" : "0 ✓"}`);
  console.log(`  - Crawl Runs remaining: ${remainingCrawlRuns ? "ERROR: Still exists!" : "0 ✓"}`);

  if (remainingCustomers || remainingUsers || remainingInventorySources || remainingInventoryItems || remainingCrawlRuns) {
    console.error("\n❌ Error: Some data was not deleted!");
    process.exit(1);
  }

  console.log("\n🎉 Database is now clean and ready for fresh testing!");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
