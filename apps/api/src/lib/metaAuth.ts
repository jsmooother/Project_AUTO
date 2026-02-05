/**
 * Meta token resolution for Option 1: Partner Access + System User.
 * - Production: use META_SYSTEM_USER_ACCESS_TOKEN for all Graph API writes/reads.
 * - Dev sim: allow dev-token-placeholder when ALLOW_DEV_META and connection has it.
 * - Test mode: same system user token, ad account override only (META_TEST_AD_ACCOUNT_ID).
 */

import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { metaConnections } from "@repo/db/schema";

export type EffectiveMetaTokenMode = "system" | "dev" | "test" | "none";

export function getSystemUserAccessToken(): string | null {
  const token = process.env["META_SYSTEM_USER_ACCESS_TOKEN"];
  return token && token.trim() ? token.trim() : null;
}

/**
 * Resolve the access token to use for Meta Graph API calls for this customer.
 * - dev: ALLOW_DEV_META + connection has dev-token-placeholder → use it (sim).
 * - test: META_TEST_MODE + customer matches → use system user token (ad account override only).
 * - system: use system user token for production.
 * - none: system token not configured or connection missing.
 */
export async function getEffectiveMetaAccessToken(customerId: string): Promise<{
  token: string | null;
  mode: EffectiveMetaTokenMode;
}> {
  const systemToken = getSystemUserAccessToken();
  const allowDevMeta = process.env["ALLOW_DEV_META"] === "true";
  const metaTestMode = process.env["META_TEST_MODE"] === "true";
  const testCustomerId = process.env["META_TEST_CUSTOMER_ID"];

  const [connection] = await db
    .select({
      status: metaConnections.status,
      accessToken: metaConnections.accessToken,
    })
    .from(metaConnections)
    .where(eq(metaConnections.customerId, customerId))
    .limit(1);

  // Dev sim: connection connected with dev placeholder → use it
  if (allowDevMeta && connection?.status === "connected" && connection?.accessToken === "dev-token-placeholder") {
    return { token: "dev-token-placeholder", mode: "dev" };
  }

  // Production / test: use system user token
  if (metaTestMode && testCustomerId && customerId === testCustomerId) {
    if (systemToken) return { token: systemToken, mode: "test" };
    return { token: null, mode: "none" };
  }

  if (systemToken) return { token: systemToken, mode: "system" };
  return { token: null, mode: "none" };
}
