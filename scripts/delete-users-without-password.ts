#!/usr/bin/env npx tsx
/**
 * Deletes users that have no password_hash (legacy users from before auth migration).
 * Run: pnpm exec tsx scripts/delete-users-without-password.ts
 * Requires: .env with DATABASE_URL in project root
 */
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });
import { eq, isNull } from "drizzle-orm";
import { db, users } from "@repo/db";

async function main() {
  const legacy = await db
    .select({ id: users.id, email: users.email, customerId: users.customerId })
    .from(users)
    .where(isNull(users.passwordHash));

  if (legacy.length === 0) {
    console.log("No users without password found.");
    process.exit(0);
  }

  console.log(`Found ${legacy.length} user(s) without password:`);
  legacy.forEach((u) => console.log(`  - ${u.email} (${u.id})`));

  for (const u of legacy) {
    await db.delete(users).where(eq(users.id, u.id));
    console.log(`Deleted user: ${u.email}`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
