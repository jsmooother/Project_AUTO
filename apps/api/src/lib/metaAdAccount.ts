/**
 * Helper to resolve effective ad account ID for Meta operations.
 * 
 * Rules:
 * 1) If META_TEST_MODE=true and customerId matches META_TEST_CUSTOMER_ID and META_TEST_AD_ACCOUNT_ID exists → return override id.
 * 2) Else return selectedAdAccountId (existing behavior).
 * 3) If still missing → return null (caller should handle error).
 */
export function resolveEffectiveAdAccountId({
  customerId,
  selectedAdAccountId,
}: {
  customerId: string;
  selectedAdAccountId: string | null;
}): { effectiveId: string | null; mode: "internal_test" | "customer_selected" } {
  const metaTestMode = process.env["META_TEST_MODE"] === "true";
  const testCustomerId = process.env["META_TEST_CUSTOMER_ID"];
  const testAdAccountId = process.env["META_TEST_AD_ACCOUNT_ID"];

  if (metaTestMode && testCustomerId && testAdAccountId && customerId === testCustomerId) {
    // Normalize ad account ID: ensure it starts with "act_"
    const normalized = testAdAccountId.startsWith("act_") ? testAdAccountId : `act_${testAdAccountId}`;
    return { effectiveId: normalized, mode: "internal_test" };
  }

  return { effectiveId: selectedAdAccountId, mode: "customer_selected" };
}

/**
 * Mask ad account ID for display (show last 4 digits only).
 */
export function maskAdAccountId(adAccountId: string | null): string | null {
  if (!adAccountId) return null;
  const id = adAccountId.replace("act_", "");
  if (id.length <= 4) return `act_****`;
  return `act_****${id.slice(-4)}`;
}
