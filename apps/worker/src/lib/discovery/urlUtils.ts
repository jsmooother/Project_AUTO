/**
 * URL utilities for discovery: normalization, sanitization, source_item_id extraction.
 */

import { createHash } from "crypto";
import type { IdFromUrlMode } from "@repo/shared";

export type IdFromUrlRule = { mode: IdFromUrlMode; regex?: string };

const BLOCKED_PROTOCOLS = new Set(["mailto:", "tel:", "javascript:", "data:", "blob:"]);
const BLOCKED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".svg",
  ".js",
  ".css",
  ".map",
  ".ico",
  ".pdf",
  ".zip",
]);

export function sanitizeCandidateUrl(inputUrl: string): boolean {
  const trimmed = inputUrl.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  for (const proto of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(proto)) return false;
  }
  try {
    const u = new URL(trimmed, "https://example.com");
    const pathLower = u.pathname.toLowerCase();
    for (const ext of BLOCKED_EXTENSIONS) {
      if (pathLower.endsWith(ext)) return false;
    }
  } catch {
    // If URL parsing fails, let normalizeUrl handle it later.
  }
  return true;
}

export function normalizeUrl(
  inputUrl: string,
  baseUrl: string,
  options: { stripQuery?: boolean; sameHost?: boolean } = {}
): string | null {
  try {
    const decoded = inputUrl.replace(/\\u002f/gi, "/").replace(/\\\//g, "/");
    const url = new URL(decoded, baseUrl);
    if (options.sameHost) {
      const baseHost = new URL(baseUrl).host;
      if (url.host !== baseHost) return null;
    }
    url.hash = "";
    if (options.stripQuery) url.search = "";
    // Remove trailing slash except root
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.href;
  } catch {
    return null;
  }
}

export function extractSourceItemId(
  normalizedUrl: string,
  rule: IdFromUrlRule
): { id: string; usedFallback: boolean } {
  if (rule.mode === "regex" && rule.regex) {
    try {
      const re = new RegExp(rule.regex);
      const m = normalizedUrl.match(re);
      const id = m?.[1] ?? m?.[0];
      if (id) return { id: id.toLowerCase(), usedFallback: false };
    } catch {
      // fall through to fallback
    }
  }
  if (rule.mode === "last_segment") {
    try {
      const path = new URL(normalizedUrl).pathname;
      const segments = path.split("/").filter(Boolean);
      const last = segments[segments.length - 1];
      if (last) return { id: last.toLowerCase(), usedFallback: false };
    } catch {
      // fall through
    }
  }
  const fallback = createHash("sha1").update(normalizedUrl).digest("hex").slice(0, 12);
  return { id: fallback, usedFallback: true };
}

export function ensureUniqueId(
  id: string,
  url: string,
  existing: Map<string, string>
): string {
  const existingUrl = existing.get(id);
  if (!existingUrl) return id;
  if (existingUrl === url) return id;
  const suffix = createHash("sha1").update(url).digest("hex").slice(0, 6);
  return `${id}-${suffix}`;
}
