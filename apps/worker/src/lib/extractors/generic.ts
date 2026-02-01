/**
 * Generic detail extractor: title (document.title / H1), price (regex kr/SEK),
 * description (best-effort), images (img src, og:image, next/image decode), attributes (key: value).
 * No per-site CSS; regex and heuristics only.
 */

import type { FetchResult } from "../drivers/types.js";
import type { ExtractResult } from "./types.js";

const TITLE_REGEX = /<title[^>]*>([^<]*)<\/title>/i;
const H1_REGEX = /<h1[^>]*>([^<]*)<\/h1>/i;
const META_DESC_REGEX = /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i;
const OG_IMAGE_REGEX = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i;
const IMG_SRC_REGEX = /<img[^>]+src=["']([^"']+)["']/gi;
const IMG_DATA_SRC_REGEX = /<img[^>]+data-src=["']([^"']+)["']/gi;
const IMG_SRCSET_REGEX = /<img[^>]+srcset=["']([^"']+)["']/gi;
const NEXT_IMAGE_REGEX = /\/_next\/image\?[^"']*url=([^&"']+)/gi;
const JSON_IMAGE_ARRAY_REGEX = /"images"\s*:\s*\[([^\]]+)\]/gi;
const JSON_IMAGE_URL_REGEX = /"image"\s*:\s*"([^"]+)"/gi;

function decodeNextImageUrl(encoded: string): string {
  try {
    return decodeURIComponent(encoded.replace(/\%2F/g, "/"));
  } catch {
    return encoded;
  }
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(TITLE_REGEX);
  const t = titleMatch?.[1]?.trim();
  if (t) return t;
  const h1Match = html.match(H1_REGEX);
  return h1Match?.[1]?.trim() ?? null;
}

function extractDescription(html: string): string | null {
  const meta = html.match(META_DESC_REGEX);
  if (meta?.[1]) return meta[1].trim();
  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (pMatch?.[1]) {
    const text = pMatch[1].replace(/<[^>]+>/g, "").trim();
    if (text.length > 50) return text;
  }
  return null;
}

function extractPrice(html: string): { amount: number | null; currency: string } {
  const normalized = html.replace(/\u00a0/g, " ");
  const krMatch = normalized.match(/(\d[\d\s]*)\s*kr/i);
  if (krMatch?.[1]) {
    const amount = parseInt(krMatch[1].replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(amount)) return { amount, currency: "SEK" };
  }
  const sekMatch = normalized.match(/(\d[\d\s]*)\s*SEK/i);
  if (sekMatch?.[1]) {
    const amount = parseInt(sekMatch[1].replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(amount)) return { amount, currency: "SEK" };
  }
  const priceMatch = normalized.match(/price["']?\s*[:=]\s*["']?([0-9][0-9\s]*)/i);
  if (priceMatch?.[1]) {
    const amount = parseInt(priceMatch[1].replace(/[^\d]/g, ""), 10);
    if (!Number.isNaN(amount)) return { amount, currency: "SEK" };
  }
  return { amount: null, currency: "SEK" };
}

function extractImages(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const og = html.match(OG_IMAGE_REGEX);
  if (og?.[1]) {
    const u = resolveUrl(og[1].trim(), baseUrl);
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }

  let m: RegExpExecArray | null;
  IMG_SRC_REGEX.lastIndex = 0;
  while ((m = IMG_SRC_REGEX.exec(html)) !== null) {
    const src = m[1]?.trim();
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;
    const u = resolveUrl(src, baseUrl);
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }

  IMG_DATA_SRC_REGEX.lastIndex = 0;
  while ((m = IMG_DATA_SRC_REGEX.exec(html)) !== null) {
    const src = m[1]?.trim();
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) continue;
    const u = resolveUrl(src, baseUrl);
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }

  IMG_SRCSET_REGEX.lastIndex = 0;
  while ((m = IMG_SRCSET_REGEX.exec(html)) !== null) {
    const srcset = m[1]?.trim();
    if (!srcset) continue;
    const parts = srcset
      .split(",")
      .map((p) => p.trim().split(" ")[0])
      .filter((p): p is string => Boolean(p));
    for (const part of parts) {
      const u = resolveUrl(part, baseUrl);
      if (u && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
  }

  NEXT_IMAGE_REGEX.lastIndex = 0;
  while ((m = NEXT_IMAGE_REGEX.exec(html)) !== null) {
    const encoded = m[1]?.trim();
    if (!encoded) continue;
    const decoded = decodeNextImageUrl(encoded);
    const u = resolveUrl(decoded, baseUrl);
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }

  JSON_IMAGE_ARRAY_REGEX.lastIndex = 0;
  while ((m = JSON_IMAGE_ARRAY_REGEX.exec(html)) !== null) {
    const raw = m[1] ?? "";
    const parts = raw
      .split(",")
      .map((p) => p.replace(/["']/g, "").trim())
      .filter((p): p is string => Boolean(p));
    for (const part of parts) {
      const u = resolveUrl(part, baseUrl);
      if (u && !seen.has(u)) {
        seen.add(u);
        urls.push(u);
      }
    }
  }

  JSON_IMAGE_URL_REGEX.lastIndex = 0;
  while ((m = JSON_IMAGE_URL_REGEX.exec(html)) !== null) {
    const part = m[1]?.trim();
    if (!part) continue;
    const u = resolveUrl(part, baseUrl);
    if (u && !seen.has(u)) {
      seen.add(u);
      urls.push(u);
    }
  }

  return urls;
}

function resolveUrl(href: string, baseUrl: string): string {
  try {
    return new URL(href, baseUrl).href;
  } catch {
    return href;
  }
}

function extractAttributesGeneric(html: string): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  const keyValueRegex = new RegExp(
    "(?:<dt[^>]*>([^<]*)</dt>\\s*<dd[^>]*>([^<]*)</dd>|<(?:strong|b|span)[^>]*>([^:<]+):?\\s*</[^>]+>\\s*([^<]+)",
    "gi"
  );
  let m: RegExpExecArray | null;
  while ((m = keyValueRegex.exec(html)) !== null) {
    const key = ((m[1] ?? m[3])?.trim() ?? "").replace(/\s+/g, " ").trim();
    const value = (m[2] ?? m[4])?.trim() ?? "";
    if (key && value && key.length < 80) attrs[key] = value;
  }
  return attrs;
}

export function extractGeneric(fetchResult: FetchResult): ExtractResult {
  const html = fetchResult.body;
  const baseUrl = fetchResult.finalUrl ?? "";
  const title = extractTitle(html);
  const descriptionText = extractDescription(html);
  const { amount: priceAmount, currency: priceCurrency } = extractPrice(html);
  const imageUrls = extractImages(html, baseUrl);
  const primaryImageUrl = imageUrls[0] ?? null;
  const attributesJson = extractAttributesGeneric(html);

  return {
    baseFields: {
      title,
      descriptionText,
      priceAmount,
      priceCurrency,
      primaryImageUrl,
    },
    attributesJson,
    imageUrls,
  };
}
