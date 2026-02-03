import { createHmac, timingSafeEqual } from "crypto";

const STATE_EXPIRY_MINUTES = 10;

/**
 * Sign OAuth state with customerId and expiry.
 * Format: base64(customerId:expireAt):hmac
 */
export function signOAuthState(customerId: string): string {
  const secret = process.env["META_STATE_SECRET"] ?? process.env["COOKIE_SECRET"] ?? "dev-secret";
  const expireAt = Date.now() + STATE_EXPIRY_MINUTES * 60 * 1000;
  const payload = `${customerId}:${expireAt}`;
  const hmac = createHmac("sha256", secret).update(payload).digest("hex");
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}:${hmac}`;
}

/**
 * Verify and parse OAuth state.
 * Returns customerId if valid, null if invalid/expired.
 */
export function verifyOAuthState(state: string): { customerId: string } | null {
  try {
    const secret = process.env["META_STATE_SECRET"] ?? process.env["COOKIE_SECRET"] ?? "dev-secret";
    const [encoded, receivedHmac] = state.split(":");
    if (!encoded || !receivedHmac) return null;

    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const [customerId, expireAtStr] = payload.split(":");
    if (!customerId || !expireAtStr) return null;

    const expireAt = parseInt(expireAtStr, 10);
    if (isNaN(expireAt) || Date.now() > expireAt) return null;

    const expectedHmac = createHmac("sha256", secret).update(payload).digest("hex");
    const expectedBuffer = Buffer.from(expectedHmac, "hex");
    const receivedBuffer = Buffer.from(receivedHmac, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) return null;
    if (!timingSafeEqual(expectedBuffer, receivedBuffer)) return null;

    return { customerId };
  } catch {
    return null;
  }
}
