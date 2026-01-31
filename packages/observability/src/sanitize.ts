/**
 * Sanitize payloads for logs/DB: strip known secret keys and redact values.
 */

const REDACT = "[REDACTED]";

const SECRET_KEYS = new Set([
  "password",
  "secret",
  "token",
  "api_key",
  "apiKey",
  "authorization",
  "cookie",
  "access_token",
  "accessToken",
  "refresh_token",
  "refreshToken",
  "service_role_key",
  "serviceRoleKey",
  "private_key",
  "privateKey",
]);

function isSecretKey(key: string): boolean {
  const lower = key.toLowerCase();
  return SECRET_KEYS.has(lower) || SECRET_KEYS.has(key) || lower.includes("password") || lower.includes("secret") || lower.includes("token");
}

export function sanitizeForLog<T>(payload: T): T {
  if (payload === null || typeof payload !== "object") {
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => sanitizeForLog(item)) as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload as Record<string, unknown>)) {
    if (isSecretKey(k)) {
      out[k] = REDACT;
    } else {
      out[k] = sanitizeForLog(v);
    }
  }
  return out as T;
}
