/**
 * Headless listing discovery: render listing page and extract anchors.
 */

import type { Driver } from "../drivers/types.js";
import type { SiteProfile } from "@repo/shared";
import type { DiscoveredItem, DiscoveryContext } from "./types.js";
import { extractSourceItemId, normalizeUrl, sanitizeCandidateUrl, ensureUniqueId } from "./urlUtils.js";

const HREF_REGEX = /<a\s+[^>]*href=["']([^"']+)["']/gi;

function matchesDetailPattern(url: string, detailUrlPatterns: string[]): boolean {
  if (detailUrlPatterns.length === 0) return true;
  for (const pattern of detailUrlPatterns) {
    try {
      if (new RegExp(pattern).test(url)) return true;
    } catch {
      /* invalid regex */
    }
  }
  return false;
}

function isLikelyDetailUrl(url: string): boolean {
  const lower = url.toLowerCase();
  const tokens = ["/bil/", "/fordon/", "/car/", "/vehicle/", "/auto/"];
  return tokens.some((t) => lower.includes(t));
}

export async function discoverViaHeadlessListing(
  driver: Driver,
  profile: SiteProfile,
  ctx: DiscoveryContext
): Promise<DiscoveredItem[]> {
  const discovery = profile.discovery;
  const idFromUrl = discovery.idFromUrl ?? { mode: "last_segment" };
  const detailUrlPatterns = discovery.detailUrlPatterns ?? [];
  const seen = new Map<string, string>();
  const items: DiscoveredItem[] = [];

  const res = await driver.fetch(ctx.baseUrl, { timeoutMs: profile.fetch?.headless?.timeoutMs ?? 30_000 });
  if (res.status !== 200 || !res.body) return [];

  let m: RegExpExecArray | null;
  HREF_REGEX.lastIndex = 0;
  while ((m = HREF_REGEX.exec(res.body)) !== null) {
    const href = m[1]?.trim();
    if (!href || !sanitizeCandidateUrl(href)) continue;
    const absolute = normalizeUrl(href, ctx.baseUrl, { sameHost: true });
    if (!absolute) continue;
    if (detailUrlPatterns.length === 0 || (detailUrlPatterns.length === 1 && detailUrlPatterns[0] === ".*")) {
      if (!isLikelyDetailUrl(absolute)) continue;
    } else if (!matchesDetailPattern(absolute, detailUrlPatterns)) {
      continue;
    }
    const { id } = extractSourceItemId(absolute, idFromUrl);
    const uniqueId = ensureUniqueId(id, absolute, seen);
    if (seen.has(uniqueId)) continue;
    seen.set(uniqueId, absolute);
    items.push({ sourceItemId: uniqueId, url: absolute });
  }

  return items;
}
