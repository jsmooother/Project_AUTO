/**
 * Shared constants (env keys, limits, defaults).
 */

export const ENV_KEYS = {
  NODE_ENV: "NODE_ENV",
} as const;

// Generic-ish hints for vehicle detail pages (non site-specific)
export const DEFAULT_DETAIL_URL_TOKENS = [
  "/bil/",
  "/kopa-bil/",
  "/fordon/",
  "/car/",
  "/cars/",
  "/vehicle/",
  "/auto/",
] as const;
