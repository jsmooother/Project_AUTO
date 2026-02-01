/**
 * Endpoint sniff: harvest URLs from HTML + scripts + JSON-LD without headless.
 */

import type { Driver } from "../drivers/types.js";
import type { SiteProfile } from "@repo/shared";
import type { DiscoverResult } from "./types.js";
import type { DiscoveryContext } from "./types.js";
import {
  extractSourceItemId,
  normalizeUrl,
  sanitizeCandidateUrl,
  ensureUniqueId,
} from "./urlUtils.js";

const HREF_REGEX = /<a\s+[^>]*href=["']([^"']+)["']/gi;
const ABS_URL_REGEX = /https?:\/\/[^\s"'<>]+/gi;
const ESCAPED_URL_REGEX = /https?:\\\/\\\/[^\s"'<>]+/gi;
const JSON_LD_REGEX = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
const RAW_RELATIVE_REGEX = /"\/[^"']+"/g;

const MAX_CANDIDATES_PER_SEED = 5000;
const MAX_CANDIDATES_TOTAL = 20000;

function matchesDetailPattern(url: string, detailUrlPatterns: string[]): boolean {
  if (detailUrlPatterns.length === 0) return true;
  for (const pattern of detailUrlPatterns) {
    try {
      if (new RegExp(pattern).test(url)) return true;
    } catch {
      /* skip invalid regex */
    }
  }
  return false;
}

function harvestUrlsFromHtml(html: string): string[] {
  const found: string[] = [];
  let m: RegExpExecArray | null;

  HREF_REGEX.lastIndex = 0;
  while ((m = HREF_REGEX.exec(html)) !== null) {
    const href = m[1]?.trim();
    if (href) found.push(href);
  }

  ABS_URL_REGEX.lastIndex = 0;
  while ((m = ABS_URL_REGEX.exec(html)) !== null) {
    const url = m[0]?.trim();
    if (url) found.push(url);
  }

  ESCAPED_URL_REGEX.lastIndex = 0;
  while ((m = ESCAPED_URL_REGEX.exec(html)) !== null) {
    const url = m[0]?.trim();
    if (url) found.push(url.replace(/\\\//g, "/"));
  }

  RAW_RELATIVE_REGEX.lastIndex = 0;
  while ((m = RAW_RELATIVE_REGEX.exec(html)) !== null) {
    const rel = m[0]?.replace(/"/g, "").trim();
    if (rel) found.push(rel);
  }

  return found;
}

function extractUrlsFromJson(node: unknown, urls: string[]): void {
  if (node == null) return;
  if (typeof node === "string") {
    if (node.includes("http") || node.startsWith("/")) urls.push(node);
    return;
  }
  if (Array.isArray(node)) {
    for (const item of node) extractUrlsFromJson(item, urls);
    return;
  }
  if (typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const directKeys = ["url", "mainEntityOfPage", "offers", "itemListElement"];
    for (const key of Object.keys(obj)) {
      if (directKeys.includes(key)) extractUrlsFromJson(obj[key], urls);
      else extractUrlsFromJson(obj[key], urls);
    }
  }
}

function parseJsonLdBlocks(html: string): string[] {
  const urls: string[] = [];
  let m: RegExpExecArray | null;
  JSON_LD_REGEX.lastIndex = 0;
  while ((m = JSON_LD_REGEX.exec(html)) !== null) {
    const raw = m[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      extractUrlsFromJson(parsed, urls);
    } catch {
      // ignore invalid JSON-LD
    }
  }
  return urls;
}

export async function discoverViaEndpointSniff(
  driver: Driver,
  profile: SiteProfile,
  ctx: DiscoveryContext
): Promise<DiscoverResult> {
  const discovery = profile.discovery;
  const seedUrls = discovery.seedUrls?.length ? discovery.seedUrls : [ctx.baseUrl];
  const detailUrlPatterns = discovery.detailUrlPatterns ?? [];
  const idFromUrl = discovery.idFromUrl ?? { mode: "last_segment" };
  const seen = new Map<string, string>();
  const items: Array<{ sourceItemId: string; url: string }> = [];

  let rawCandidates = 0;
  let matchedPatternCount = 0;
  let jsonLdCount = 0;
  const maxItems = profile.limits?.maxItems ?? 500;
  const maxDurationMs = profile.limits?.maxDurationMs ?? 300_000;
  const startedAt = Date.now();

  for (const seedUrl of seedUrls) {
    if (Date.now() - startedAt > maxDurationMs) break;
    if (items.length >= maxItems) break;
    const res = await driver.fetch(seedUrl, {
      timeoutMs: profile.fetch?.http?.timeoutMs ?? 15_000,
    });
    if (res.status !== 200 || !res.body) continue;

    const html = res.body;
    const harvested = harvestUrlsFromHtml(html);
    const jsonLdUrls = parseJsonLdBlocks(html);
    jsonLdCount += jsonLdUrls.length;

    const combined = [...harvested, ...jsonLdUrls];
    rawCandidates += combined.length;

    let processed = 0;
    for (const candidate of combined) {
      if (processed >= MAX_CANDIDATES_PER_SEED || items.length >= MAX_CANDIDATES_TOTAL) break;
      if (items.length >= maxItems) break;
      processed += 1;
      if (!sanitizeCandidateUrl(candidate)) continue;
      const normalized = normalizeUrl(candidate, seedUrl);
      if (!normalized) continue;
      if (!matchesDetailPattern(normalized, detailUrlPatterns)) continue;
      matchedPatternCount += 1;
      const { id } = extractSourceItemId(normalized, idFromUrl);
      const uniqueId = ensureUniqueId(id, normalized, seen);
      if (seen.has(uniqueId)) continue;
      seen.set(uniqueId, normalized);
      items.push({ sourceItemId: uniqueId, url: normalized });
    }
  }

  return {
    items,
    meta: {
      strategy: "endpoint_sniff",
      discoveredCount: items.length,
      seedUrlsFetched: seedUrls.length,
      rawCandidates,
      matchedPatternCount,
      dedupedCount: items.length,
      jsonLdCount,
    },
  };
}
