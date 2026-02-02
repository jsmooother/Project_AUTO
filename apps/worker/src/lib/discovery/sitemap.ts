/**
 * Sitemap discovery: robots.txt Sitemap: lines → fetch sitemap XML → extract <loc> URLs.
 */

import type { Driver } from "../drivers/types.js";
import type { SiteProfile } from "@repo/shared";
import { DEFAULT_DETAIL_URL_TOKENS } from "@repo/shared";
import type { DiscoveredItem, DiscoveryContext } from "./types.js";
import { extractSourceItemId, normalizeUrl, ensureUniqueId } from "./urlUtils.js";

const LOC_REGEX = /<loc>\s*([^<]+)\s*<\/loc>/gi;

function isLikelyDetailUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return DEFAULT_DETAIL_URL_TOKENS.some((t) => lower.includes(t));
}

function matchesDetailPattern(url: string, detailUrlPatterns: string[]): boolean {
  if (detailUrlPatterns.length === 0) return true;
  for (const pattern of detailUrlPatterns) {
    try {
      if (new RegExp(pattern).test(url)) return true;
    } catch {
      /* invalid regex skip */
    }
  }
  return false;
}

export async function discoverViaSitemap(
  driver: Driver,
  profile: SiteProfile,
  ctx: DiscoveryContext
): Promise<DiscoveredItem[]> {
  const discovery = profile.discovery;
  const sitemapUrls = discovery.sitemapUrls?.length
    ? discovery.sitemapUrls
    : await getSitemapUrlsFromRobots(driver, ctx.origin);
  const idFromUrl = discovery.idFromUrl ?? { mode: "last_segment" };
  const detailUrlPatterns = discovery.detailUrlPatterns ?? [];
  const maxItems = profile.limits?.maxItems ?? 500;
  const maxDurationMs = profile.limits?.maxDurationMs ?? 300_000;
  const startedAt = Date.now();
  const seen = new Map<string, string>();
  const items: DiscoveredItem[] = [];

  const pending = [...sitemapUrls];
  const seenSitemaps = new Set<string>();
  while (pending.length > 0) {
    const sitemapUrl = pending.shift();
    if (!sitemapUrl) break;
    if (seenSitemaps.has(sitemapUrl)) continue;
    seenSitemaps.add(sitemapUrl);
    if (Date.now() - startedAt > maxDurationMs) break;
    if (items.length >= maxItems) break;
    const res = await driver.fetch(sitemapUrl, {
      timeoutMs: profile.fetch?.http?.timeoutMs ?? 15_000,
    });
    if (res.status !== 200 || !res.body) continue;
    let m: RegExpExecArray | null;
    LOC_REGEX.lastIndex = 0;
    while ((m = LOC_REGEX.exec(res.body)) !== null) {
      const raw = m[1]?.trim();
      if (!raw) continue;
      const normalized = normalizeUrl(raw, ctx.origin, { sameHost: true });
      if (!normalized) continue;
      if (normalized.endsWith(".xml")) {
        pending.push(normalized);
        continue;
      }
      if (detailUrlPatterns.length === 0 || (detailUrlPatterns.length === 1 && detailUrlPatterns[0] === ".*")) {
        if (!isLikelyDetailUrl(normalized)) continue;
      } else if (!matchesDetailPattern(normalized, detailUrlPatterns)) {
        continue;
      }
      const { id } = extractSourceItemId(normalized, idFromUrl);
      const uniqueId = ensureUniqueId(id, normalized, seen);
      if (seen.has(uniqueId)) continue;
      seen.set(uniqueId, normalized);
      items.push({ sourceItemId: uniqueId, url: normalized });
      if (items.length >= maxItems) break;
    }
  }
  return items;
}

async function getSitemapUrlsFromRobots(
  driver: Driver,
  origin: string
): Promise<string[]> {
  const robotsUrl = `${origin.replace(/\/$/, "")}/robots.txt`;
  const res = await driver.fetch(robotsUrl, { timeoutMs: 10_000 });
  if (res.status !== 200 || !res.body) return [];
  const urls: string[] = [];
  for (const line of res.body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^sitemap:\s*/i.test(trimmed)) {
      const url = trimmed.replace(/^sitemap:\s*/i, "").trim();
      if (url) urls.push(url);
    }
  }
  return urls;
}
