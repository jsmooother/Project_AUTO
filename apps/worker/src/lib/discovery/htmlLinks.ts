/**
 * HTML links discovery: fetch listing page(s), parse <a href>, filter by detailUrlPatterns.
 */

import type { Driver } from "../drivers/types.js";
import type { SiteProfile } from "@repo/shared";
import { DEFAULT_DETAIL_URL_TOKENS } from "@repo/shared";
import type { DiscoveredItem, DiscoveryContext } from "./types.js";
import { extractSourceItemId, normalizeUrl, sanitizeCandidateUrl, ensureUniqueId } from "./urlUtils.js";

const HREF_REGEX = /<a\s+[^>]*href=["']([^"']+)["']/gi;
const LOAD_MORE_REGEX = /(visa fler|ladda fler|load more|show more)/i;
const ENDPOINT_HINT_REGEX = /(wp-json|admin-ajax\.php|\/api\/|\.json|ajax)/i;

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

function isLikelyDetailUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return DEFAULT_DETAIL_URL_TOKENS.some((t) => lower.includes(t));
}

export async function discoverViaHtmlLinks(
  driver: Driver,
  profile: SiteProfile,
  ctx: DiscoveryContext,
  options?: { maxPages?: number }
): Promise<DiscoveredItem[]> {
  const discovery = profile.discovery;
  const seedUrls = discovery.seedUrls?.length
    ? discovery.seedUrls
    : [profile.discovery.seedUrls?.[0] ?? ctx.baseUrl];
  const idFromUrl = discovery.idFromUrl ?? { mode: "last_segment" };
  const detailUrlPatterns = discovery.detailUrlPatterns ?? [];
  const maxPages = options?.maxPages ?? profile.limits?.maxPages ?? 20;
  const maxItems = profile.limits?.maxItems ?? 500;
  const maxDurationMs = profile.limits?.maxDurationMs ?? 300_000;
  const seen = new Map<string, string>();
  const items: DiscoveredItem[] = [];
  const toFetch: string[] = [...seedUrls];
  const fetched = new Set<string>();
  const startedAt = Date.now();

  while (toFetch.length > 0 && fetched.size < maxPages) {
    if (Date.now() - startedAt > maxDurationMs) break;
    if (items.length >= maxItems) break;
    const url = toFetch.shift();
    if (!url) break;
    const norm = new URL(url).href;
    if (fetched.has(norm)) continue;
    fetched.add(norm);

    const res = await driver.fetch(url, {
      timeoutMs: profile.fetch?.http?.timeoutMs ?? 15_000,
    });
    if (res.status !== 200 || !res.body) continue;

    let m: RegExpExecArray | null;
    HREF_REGEX.lastIndex = 0;
    while ((m = HREF_REGEX.exec(res.body)) !== null) {
      const href = m[1]?.trim();
      if (!href || !sanitizeCandidateUrl(href)) continue;
      const absolute = normalizeUrl(href, url, { sameHost: true });
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
      if (items.length >= maxItems) break;
    }

    // Pagination: rel=next, aria-label=Next, class*="next", ?page=, /page/2
    const nextCandidates: string[] = [];
    const relNext = res.body.match(/<a[^>]+rel=["']next["'][^>]+href=["']([^"']+)["']/i);
    if (relNext?.[1]) nextCandidates.push(relNext[1]);
    const ariaNext = res.body.match(/<a[^>]+aria-label=["']next["'][^>]+href=["']([^"']+)["']/i);
    if (ariaNext?.[1]) nextCandidates.push(ariaNext[1]);
    const classNext = res.body.match(/<a[^>]+class=["'][^"']*next[^"']*["'][^>]+href=["']([^"']+)["']/i);
    if (classNext?.[1]) nextCandidates.push(classNext[1]);
    const pageParam = res.body.match(/href=["']([^"']*[\?&]page=\d+[^"']*)["']/i);
    if (pageParam?.[1]) nextCandidates.push(pageParam[1]);
    const pagePath = res.body.match(/href=["']([^"']*\/page\/\d+\/?[^"']*)["']/i);
    if (pagePath?.[1]) nextCandidates.push(pagePath[1]);
    for (const cand of nextCandidates) {
      const nextUrl = normalizeUrl(cand, url, { sameHost: true });
      if (nextUrl && !fetched.has(new URL(nextUrl).href)) {
        toFetch.push(nextUrl);
      }
    }

    // Load-more detection: attempt to fetch hinted endpoints and harvest URLs
    if (LOAD_MORE_REGEX.test(res.body)) {
      const hints: string[] = [];
      let m2: RegExpExecArray | null;
      HREF_REGEX.lastIndex = 0;
      while ((m2 = HREF_REGEX.exec(res.body)) !== null) {
        const href = m2[1]?.trim();
        if (!href) continue;
        if (ENDPOINT_HINT_REGEX.test(href)) hints.push(href);
      }
      for (const hint of hints.slice(0, 5)) {
        const endpointUrl = normalizeUrl(hint, url, { sameHost: true });
        if (!endpointUrl) continue;
        try {
          const endpointRes = await driver.fetch(endpointUrl, {
            timeoutMs: profile.fetch?.http?.timeoutMs ?? 15_000,
          });
          if (endpointRes.status !== 200 || !endpointRes.body) continue;
          let m3: RegExpExecArray | null;
          HREF_REGEX.lastIndex = 0;
          while ((m3 = HREF_REGEX.exec(endpointRes.body)) !== null) {
            const href2 = m3[1]?.trim();
            if (!href2 || !sanitizeCandidateUrl(href2)) continue;
            const absolute = normalizeUrl(href2, endpointUrl, { sameHost: true });
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
            if (items.length >= maxItems) break;
          }
        } catch {
          /* best-effort */
        }
      }
    }
  }
  return items;
}
