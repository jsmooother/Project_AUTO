import { createHash } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { fetchWithTrace } from "../lib/http.js";
import { createHeadlessDriver } from "../lib/drivers/headlessDriver.js";
import {
  inventorySources,
  crawlRuns,
  inventoryItems,
} from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";

interface CrawlRealPayload {
  customerId: string;
  headUrl: string;
  limit: number;
  site: string;
}

interface VehicleDetails {
  currency: string;
  priceAmount: number;
  monthlyPrice?: number; // Monthly financing price (kr/mån)
  year?: number;
  mileageKm?: number;
  fuel?: string;
  transmission?: string;
  drivetrain?: string;
  location?: string;
  dealerName?: string;
  images: string[];
  primaryImageUrl?: string;
  source: {
    site: string;
    headUrl: string;
    detailUrl: string;
  };
}

/**
 * Decode HTML entities without heavy dependencies
 */
function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  
  // Named entities
  let decoded = str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  
  // Numeric entities (decimal): &#8211; → –
  decoded = decoded.replace(/&#(\d+);/g, (_, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });
  
  // Numeric entities (hex): &#x2013; → –
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return decoded;
}

/**
 * Parse Swedish price string to integer SEK
 * Handles: "623 750 SEK", "623 750 kr", "623,750", "623.750", "623750"
 */
function parsePriceSEK(str: string): number | null {
  if (!str) return null;
  
  // Remove currency tokens (SEK, kr, etc.)
  let cleaned = str
    .replace(/SEK/gi, "")
    .replace(/kr/gi, "")
    .replace(/pris[:\s]*/gi, "")
    .trim();
  
  // Remove non-breaking spaces and regular spaces
  cleaned = cleaned.replace(/\u00A0/g, "").replace(/\s/g, "");
  
  // Remove dots used as thousands separators (but not decimal points in Swedish format)
  // Swedish uses comma for decimals, so dots are thousands separators
  cleaned = cleaned.replace(/\.(?=\d{3})/g, "");
  
  // Remove commas used as thousands separators
  cleaned = cleaned.replace(/,(?=\d{3})/g, "");
  
  // Parse remaining digits
  const match = cleaned.match(/\d+/);
  if (!match) return null;
  
  const parsed = parseInt(match[0], 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

/**
 * Parse mileage string to integer kilometers
 * Handles: "12 345 mil", "12 345 km", "12345 km", "12,345 mil"
 * Swedish "mil" = 10 km
 */
function parseMileageKm(str: string): number | null {
  if (!str) return null;
  
  // Extract number and unit - use more specific pattern to avoid multiple matches
  // Match: digits with optional spaces/commas/dots, followed by "mil" or "km"
  const milMatch = str.match(/([\d\s,\.]+)\s*mil/gi);
  const kmMatch = str.match(/([\d\s,\.]+)\s*km/gi);
  
  let cleaned: string | null = null;
  let isMil = false;
  
  // Prefer mil match if both exist (take first match)
  if (milMatch && milMatch[0]) {
    cleaned = milMatch[0].replace(/mil/gi, "").trim();
    isMil = true;
  } else if (kmMatch && kmMatch[0]) {
    cleaned = kmMatch[0].replace(/km/gi, "").trim();
  } else {
    return null;
  }
  
  if (!cleaned) return null;
  
  // Remove spaces (including NBSP) and separators
  cleaned = cleaned.replace(/\u00A0/g, "").replace(/\s/g, "");
  cleaned = cleaned.replace(/\.(?=\d{3})/g, ""); // Dots as thousands separators
  cleaned = cleaned.replace(/,(?=\d{3})/g, ""); // Commas as thousands separators
  
  // Extract first complete number (avoid partial matches)
  const match = cleaned.match(/^\d+/);
  if (!match) return null;
  
  let parsed = parseInt(match[0], 10);
  if (isNaN(parsed) || parsed <= 0) return null;
  
  // Sanity check: if value seems unreasonably high, it might be a parsing error
  if (parsed > 1000000) {
    return null; // Likely parsing error
  }
  
  // Convert mil to km (1 mil = 10 km)
  if (isMil) {
    parsed = parsed * 10;
  }
  
  return parsed;
}

/**
 * Normalize URL: remove query params and hash, ensure same hostname
 */
function normalizeUrl(url: string, baseUrl: string): string | null {
  try {
    const base = new URL(baseUrl);
    const parsed = new URL(url, base);
    if (parsed.hostname !== base.hostname) return null;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Extract absolute image URLs from relative URLs
 */
function toAbsoluteImageUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

/**
 * Extract detail URLs from HTML content
 */
function extractDetailUrls(html: string, baseUrl: string): Set<string> {
  const urls = new Set<string>();
  const base = new URL(baseUrl);

  // First, try to find URLs in any format (very broad search)
  // Look for any string that contains /bil/ followed by what looks like a slug
  const broadPattern = /(https?:\/\/[^"'\s<>]*\/bil\/[^"'\s<>]*\/?)/gi;
  let match;
  while ((match = broadPattern.exec(html)) !== null) {
    const urlCandidate = match[1];
    if (!urlCandidate) continue;
    
    const normalized = normalizeUrl(urlCandidate, baseUrl);
    if (normalized && 
        normalized.includes("/bil/") && 
        !normalized.includes("/bilar-i-lager") &&
        !normalized.includes("/bilhallarna") &&
        normalized.split("/").length >= 5) {
      urls.add(normalized);
    }
  }

  // Also try relative URLs
  const relativePattern = /(\/bil\/[^"'\s<>]*\/?)/gi;
  while ((match = relativePattern.exec(html)) !== null) {
    const urlCandidate = match[1];
    if (!urlCandidate) continue;
    
    const normalized = normalizeUrl(urlCandidate, baseUrl);
    if (normalized && 
        normalized.includes("/bil/") && 
        !normalized.includes("/bilar-i-lager") &&
        !normalized.includes("/bilhallarna") &&
        normalized.split("/").length >= 5) {
      urls.add(normalized);
    }
  }

  // Standard href attributes
  const hrefPattern = /href=["']([^"']*\/bil\/[^"']*\/?)["']/gi;
  while ((match = hrefPattern.exec(html)) !== null) {
    const normalized = normalizeUrl(match[1] ?? "", baseUrl);
    if (normalized && 
        normalized.includes("/bil/") && 
        !normalized.includes("/bilar-i-lager") &&
        !normalized.includes("/bilhallarna") &&
        normalized.split("/").length >= 5) {
      urls.add(normalized);
    }
  }

  // Data attributes
  const dataPatterns = [
    /data-href=["']([^"']*\/bil\/[^"']*\/?)["']/gi,
    /data-url=["']([^"']*\/bil\/[^"']*\/?)["']/gi,
    /data-link=["']([^"']*\/bil\/[^"']*\/?)["']/gi,
  ];
  for (const pattern of dataPatterns) {
    while ((match = pattern.exec(html)) !== null) {
      const normalized = normalizeUrl(match[1] ?? "", baseUrl);
      if (normalized && 
          normalized.includes("/bil/") && 
          !normalized.includes("/bilar-i-lager") &&
          !normalized.includes("/bilhallarna") &&
          normalized.split("/").length >= 5) {
        urls.add(normalized);
      }
    }
  }

  return urls;
}

/**
 * Parse JSON-LD structured data
 */
function parseJsonLd(html: string): Array<Record<string, unknown>> {
  const jsonLdBlocks: Array<Record<string, unknown>> = [];
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis;
  let match;
  while ((match = scriptPattern.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1] ?? "{}");
      if (Array.isArray(parsed)) {
        jsonLdBlocks.push(...parsed);
      } else {
        jsonLdBlocks.push(parsed);
      }
    } catch {
      // Skip invalid JSON
    }
  }
  return jsonLdBlocks;
}

/**
 * Extract vehicle details from JSON-LD
 */
function extractFromJsonLd(jsonLd: Array<Record<string, unknown>>, detailUrl: string): Partial<VehicleDetails> | null {
  for (const item of jsonLd) {
    const type = Array.isArray(item["@type"]) ? item["@type"] : [item["@type"]];
    if (!type.some((t) => typeof t === "string" && (t.includes("Product") || t.includes("Vehicle") || t.includes("Car")))) {
      continue;
    }

    const details: Partial<VehicleDetails> = {
      images: [],
      source: {
        site: "ivarsbil.se",
        headUrl: "",
        detailUrl,
      },
    };

    // Extract price from JSON-LD
    if (item.offers && typeof item.offers === "object") {
      const offers = item.offers as Record<string, unknown>;
      if (offers.price) {
        // Try parsing as string first (handles formatted prices), then fallback to number
        const priceStr = String(offers.price);
        const parsedPrice = parsePriceSEK(priceStr) ?? (typeof offers.price === "number" ? offers.price : parseFloat(priceStr));
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
          details.priceAmount = parsedPrice;
          // Store raw for forensic logging
          (details as any).priceSource = "jsonld_offers";
          (details as any).priceRaw = priceStr;
        }
      }
      if (offers.priceCurrency) {
        details.currency = String(offers.priceCurrency);
      } else {
        details.currency = "SEK"; // Default for ivarsbil.se
      }
    }

    // Extract name/title
    if (item.name) {
      // Will be set as title in main extraction
    }

    // Extract images
    if (item.image) {
      const images = Array.isArray(item.image) ? item.image : [item.image];
      details.images = images
        .map((img) => {
          if (typeof img === "string") return img;
          if (typeof img === "object" && img !== null && "url" in img) return String(img.url);
          return null;
        })
        .filter((url): url is string => url !== null && url.startsWith("http"));
      if (details.images.length > 0) {
        details.primaryImageUrl = details.images[0];
      }
    }

    return details;
  }
  return null;
}

/**
 * Extract vehicle details from DOM (fallback)
 */
function extractFromDom(html: string, detailUrl: string): Partial<VehicleDetails> {
  const details: Partial<VehicleDetails> = {
    images: [],
    source: {
      site: "ivarsbil.se",
      headUrl: "",
      detailUrl,
    },
  };

  // Extract title (first h1)
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
  // Will be set as title in main extraction

  // Extract price from DOM - prioritize cash price over monthly
  const priceCandidates: Array<{ raw: string; source: string; isMonthly: boolean }> = [];
  
  // 1. Try data-car-price attribute (cash price)
  const dataCarPriceMatch = html.match(/data-car-price=["'](\d+)["']/i);
  if (dataCarPriceMatch && dataCarPriceMatch[1]) {
    priceCandidates.push({
      raw: dataCarPriceMatch[1],
      source: "data-car-price",
      isMonthly: false,
    });
  }
  
  // 2. Try displayed cash price (look for large price text, exclude monthly)
  // Pattern 1: tfap-h2 class with price
  const tfapH2Match = html.match(/<p[^>]*class[^>]*tfap-h2[^>]*>[\s\S]*?(\d[\d\s]*)\s*kr[\s\S]*?<\/p>/i);
  if (tfapH2Match) {
    const priceStr = tfapH2Match[1]?.trim() ?? "";
    if (priceStr && !priceStr.includes("mån")) {
      priceCandidates.push({
        raw: priceStr,
        source: "dom_cash_price",
        isMonthly: false,
      });
    }
  }
  
  // Pattern 2: Large numbers with kr but not mån
  const largePricePattern = /(\d[\d\s]{4,})\s*kr(?!\s*\/mån)/gi;
  let largeMatch;
  while ((largeMatch = largePricePattern.exec(html)) !== null) {
    const priceStr = largeMatch[1]?.trim() ?? "";
    if (priceStr) {
      priceCandidates.push({
        raw: priceStr,
        source: "dom_cash_price",
        isMonthly: false,
      });
    }
  }
  
  // 3. Fallback: any price pattern (but mark monthly if detected)
  const fallbackPatterns = [
    /([\d\s,\.]+)\s*kr/gi,
    /([\d\s,\.]+)\s*SEK/gi,
    /pris[:\s]*(\d[\d\s,\.]*)/gi,
  ];
  for (const pattern of fallbackPatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      const priceStr = match[1]?.trim() ?? "";
      if (priceStr) {
        const context = match[0]?.toLowerCase() ?? "";
        const isMonthly = context.includes("mån") || context.includes("month");
        priceCandidates.push({
          raw: priceStr,
          source: "dom_fallback",
          isMonthly,
        });
      }
    }
  }
  
  // Store all candidates for forensic logging
  (details as any).priceCandidates = priceCandidates;
  
  // Select best candidate for cash price: prefer cash price, reject monthly
  let selectedPrice: { raw: string; source: string } | null = null;
  for (const candidate of priceCandidates) {
    if (!candidate.isMonthly) {
      const parsedPrice = parsePriceSEK(candidate.raw);
      if (parsedPrice !== null && parsedPrice >= 10000) {
        // Prefer data-car-price, then dom_cash_price, then fallback
        if (!selectedPrice || candidate.source === "data-car-price" || 
            (selectedPrice.source === "dom_fallback" && candidate.source === "dom_cash_price")) {
          selectedPrice = { raw: candidate.raw, source: candidate.source };
        }
      }
    }
  }
  
  if (selectedPrice) {
    const parsedPrice = parsePriceSEK(selectedPrice.raw);
    if (parsedPrice !== null) {
      details.priceAmount = parsedPrice;
      details.currency = "SEK";
      (details as any).priceSource = selectedPrice.source;
      (details as any).priceRaw = selectedPrice.raw;
    }
  }
  
  // Extract monthly price separately (for ad targeting)
  let selectedMonthlyPrice: { raw: string; source: string } | null = null;
  for (const candidate of priceCandidates) {
    if (candidate.isMonthly) {
      const parsedPrice = parsePriceSEK(candidate.raw);
      if (parsedPrice !== null && parsedPrice > 0 && parsedPrice < 50000) {
        // Monthly prices should be reasonable (typically 1,000-20,000 SEK/month)
        if (!selectedMonthlyPrice || candidate.source === "dom_fallback") {
          selectedMonthlyPrice = { raw: candidate.raw, source: candidate.source };
        }
      }
    }
  }
  
  // Also try explicit monthly patterns in HTML
  if (!selectedMonthlyPrice) {
    const monthlyPatterns = [
      /från\s+([\d\s,\.]+)\s*kr\s*\/mån/gi,
      /([\d\s,\.]+)\s*kr\s*\/mån/gi,
      /([\d\s,\.]+)\s*kr\s*\/month/gi,
    ];
    for (const pattern of monthlyPatterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const priceStr = match[1]?.trim() ?? "";
        const parsedPrice = parsePriceSEK(priceStr);
        if (parsedPrice !== null && parsedPrice > 0 && parsedPrice < 50000) {
          selectedMonthlyPrice = { raw: priceStr, source: "dom_monthly_explicit" };
          break;
        }
      }
      if (selectedMonthlyPrice) break;
    }
  }
  
  if (selectedMonthlyPrice) {
    const parsedMonthlyPrice = parsePriceSEK(selectedMonthlyPrice.raw);
    if (parsedMonthlyPrice !== null) {
      details.monthlyPrice = parsedMonthlyPrice;
      (details as any).monthlyPriceSource = selectedMonthlyPrice.source;
      (details as any).monthlyPriceRaw = selectedMonthlyPrice.raw;
    }
  }

  // Extract images (look for img tags in gallery)
  const imgPattern = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const images = new Set<string>();
  let imgMatch;
  while ((imgMatch = imgPattern.exec(html)) !== null) {
    const src = imgMatch[1];
    if (src && !src.includes("logo") && !src.includes("icon")) {
      const absoluteUrl = toAbsoluteImageUrl(src, detailUrl);
      images.add(absoluteUrl);
    }
  }
  details.images = Array.from(images);
  if (details.images.length > 0) {
    details.primaryImageUrl = details.images[0];
  }

  // Extract year (look for 4-digit year)
  const yearMatch = html.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    if (year >= 1900 && year <= new Date().getFullYear() + 1) {
      details.year = year;
    }
  }

  // Extract mileage (look for "mil" or "km")
  const mileagePatterns = [
    /([\d\s,\.]+)\s*mil/gi,
    /([\d\s,\.]+)\s*km/gi,
  ];
  for (const pattern of mileagePatterns) {
    const match = html.match(pattern);
    if (match) {
      const mileageStr = match[1] ?? "";
      const parsedMileage = parseMileageKm(mileageStr);
      if (parsedMileage !== null) {
        details.mileageKm = parsedMileage;
        break;
      }
    }
  }

  return details;
}

/**
 * Extract vehicle data from a detail page
 */
async function extractVehicleData(detailUrl: string, headUrl: string): Promise<{
  title: string;
  price: number;
  details: VehicleDetails;
  titleRaw: string;
  priceRaw: string;
  mileageRaw: string;
  mileageKm: number | null;
} | null> {
  const { body: html, trace } = await fetchWithTrace(detailUrl, { timeoutMs: 30000 });

  if (trace.error || !trace.status || trace.status >= 400) {
    console.log(JSON.stringify({ event: "crawl_real_item_fetch_failed", url: detailUrl, error: trace.error, status: trace.status }));
    return null;
  }

  // Try JSON-LD first
  const jsonLd = parseJsonLd(html);
  let details: Partial<VehicleDetails> | null = null;
  if (jsonLd.length > 0) {
    details = extractFromJsonLd(jsonLd, detailUrl);
  }

  // Fallback to DOM extraction
  if (!details) {
    details = extractFromDom(html, detailUrl);
  }

  // Ensure required fields
  if (!details) {
    details = {
      images: [],
      source: {
        site: "ivarsbil.se",
        headUrl,
        detailUrl,
      },
    };
  }

  // Extract title
  let title = "";
  if (jsonLd.length > 0) {
    for (const item of jsonLd) {
      if (item.name && typeof item.name === "string") {
        title = item.name;
        break;
      }
    }
  }
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/is);
    if (h1Match && h1Match[1]) {
      title = h1Match[1].replace(/<[^>]*>/g, "").trim();
    }
  }
  if (!title) {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1].replace(/<[^>]*>/g, "").trim();
    }
  }

  // Extract price
  let priceRaw = "";
  let price = 0;
  if (details.priceAmount) {
    priceRaw = String(details.priceAmount);
    price = details.priceAmount;
  } else {
    // Try to extract from HTML if not in details
    const pricePatterns = [
      /([\d\s,\.]+)\s*kr/gi,
      /([\d\s,\.]+)\s*SEK/gi,
    ];
    for (const pattern of pricePatterns) {
      const match = html.match(pattern);
      if (match) {
        priceRaw = match[1] ?? "";
        const parsedPrice = parsePriceSEK(priceRaw);
        if (parsedPrice !== null) {
          price = parsedPrice;
          details.priceAmount = parsedPrice;
          details.currency = "SEK";
          break;
        }
      }
    }
  }

  if (!title || price === 0) {
    console.log(JSON.stringify({ event: "crawl_real_item_incomplete", url: detailUrl, hasTitle: !!title, hasPrice: price > 0 }));
    return null;
  }

  // Normalization: Apply HTML entity decoding and ensure consistent formatting
  const titleRaw = title;
  title = decodeHtmlEntities(title);
  
  // Price validation guard: reject suspiciously low prices (likely monthly/financing)
  if (details.priceAmount && details.priceAmount < 10000) {
    // This is likely a monthly price or parsing error
    const priceSource = (details as any).priceSource;
    const priceCandidates = (details as any).priceCandidates || [];
    
    // Try to find a better candidate if we have one
    if (priceCandidates.length > 0) {
      for (const candidate of priceCandidates) {
        if (!candidate.isMonthly) {
          const parsedPrice = parsePriceSEK(candidate.raw);
          if (parsedPrice !== null && parsedPrice >= 10000) {
            details.priceAmount = parsedPrice;
            (details as any).priceSource = candidate.source;
            (details as any).priceRaw = candidate.raw;
            price = parsedPrice;
            break;
          }
        }
      }
    }
    
    // If still too low, log warning but don't fail (might be a very cheap vehicle)
    if (details.priceAmount < 10000) {
      console.log(JSON.stringify({
        event: "crawl_real_price_suspicious",
        url: detailUrl,
        price: details.priceAmount,
        source: priceSource,
        candidates: priceCandidates,
      }));
    }
  }
  
  // Normalize price if it came from JSON-LD as string
  if (details.priceAmount && typeof details.priceAmount === "number") {
    price = details.priceAmount;
  } else if (priceRaw) {
    const normalizedPrice = parsePriceSEK(priceRaw);
    if (normalizedPrice !== null) {
      price = normalizedPrice;
      details.priceAmount = normalizedPrice;
    }
  }
  
  // Extract mileage raw for logging (try to find in HTML if not already extracted)
  let mileageRaw = "";
  if (!details.mileageKm) {
    const mileageMatch = html.match(/([\d\s,\.]+)\s*(?:mil|km)/gi);
    if (mileageMatch) {
      mileageRaw = mileageMatch[0];
      const parsedMileage = parseMileageKm(mileageRaw);
      if (parsedMileage !== null) {
        details.mileageKm = parsedMileage;
      }
    }
  } else {
    // Already extracted, try to find raw string for logging
    const mileageMatch = html.match(/([\d\s,\.]+)\s*(?:mil|km)/gi);
    mileageRaw = mileageMatch?.[0] ?? "";
  }
  const mileageKm = details.mileageKm ?? null;
  
  // Ensure currency is set
  if (!details.currency) {
    details.currency = "SEK";
  }

  // Ensure source fields are set
  details.source = {
    site: "ivarsbil.se",
    headUrl,
    detailUrl,
  };

  return {
    title,
    price: Math.round(price),
    details: details as VehicleDetails,
    titleRaw,
    priceRaw,
    mileageRaw,
    mileageKm,
  };
}

/**
 * Generate stable external ID from detail URL
 */
function stableExternalId(detailUrl: string): string {
  return createHash("sha256").update(detailUrl).digest("hex").slice(0, 16);
}

export async function processCrawlRealIvars(job: QueuedJob<CrawlRealPayload>): Promise<void> {
  const { payload, correlation } = job;
  const { customerId, runId } = correlation;
  const { headUrl, limit, site } = payload;

  if (!customerId || !runId) {
    const msg = "Missing correlation: customerId and runId required";
    if (customerId && runId) {
      await db
        .update(crawlRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));
    }
    await job.deadLetter(msg);
    return;
  }

  const now = new Date();

  try {
    console.log(JSON.stringify({ event: "crawl_real_start", runId, customerId, headUrl, limit, site }));

    // Mark run as running
    await db
      .update(crawlRuns)
      .set({ status: "running", startedAt: now })
      .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));

    // Get inventory source
    const [source] = await db
      .select()
      .from(inventorySources)
      .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
      .limit(1);

    if (!source) {
      const msg = "No active inventory source found";
      await db
        .update(crawlRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Step 1: Discover detail URLs
    // Try multiple strategies: sitemap, listing page (headless), listing page (HTTP)
    const baseUrl = new URL(headUrl);
    const listingPageUrl = `${baseUrl.protocol}//${baseUrl.host}/bilar-i-lager/`;
    const sitemapUrl = `${baseUrl.protocol}//${baseUrl.host}/sitemap.xml`;
    
    let detailUrls = new Set<string>();
    
    // Strategy 1: Try sitemap.xml first (most reliable)
    const { body: sitemapBody, trace: sitemapTrace } = await fetchWithTrace(sitemapUrl, { timeoutMs: 10000 });
    if (!sitemapTrace.error && sitemapTrace.status === 200 && sitemapBody) {
      // Extract URLs from sitemap
      const sitemapUrlPattern = /<loc>(https?:\/\/[^<]*\/bil\/[^<]*\/?)<\/loc>/gi;
      let sitemapMatch;
      while ((sitemapMatch = sitemapUrlPattern.exec(sitemapBody)) !== null) {
        const url = sitemapMatch[1] ?? "";
        const normalized = normalizeUrl(url, headUrl);
        if (normalized && normalized.includes("/bil/") && normalized.split("/").length >= 5) {
          detailUrls.add(normalized);
        }
      }
      console.log(JSON.stringify({ event: "crawl_real_sitemap_fetched", runId, customerId, url: sitemapUrl, discoveredCount: detailUrls.size }));
    }
    
    // Strategy 2: Try headless browser (for JavaScript-rendered content)
    if (detailUrls.size < limit * 2) {
      const headlessEnabled = process.env["HEADLESS_ENABLED"] === "1" || process.env["HEADLESS_ENABLED"] === "true";
      console.log(JSON.stringify({ event: "crawl_real_headless_check", runId, customerId, headlessEnabled, env: process.env["HEADLESS_ENABLED"] }));
      if (headlessEnabled) {
        try {
          const headlessDriver = createHeadlessDriver();
          console.log(JSON.stringify({ event: "crawl_real_headless_attempting", runId, customerId, url: listingPageUrl }));
          const result = await headlessDriver.fetch(listingPageUrl, { timeoutMs: 30000 });
          console.log(JSON.stringify({ event: "crawl_real_headless_result", runId, customerId, status: result.status, bodyLength: result.body?.length ?? 0 }));
          if (result.status === 200 && result.body) {
            const listingHtml = result.body;
            const urlsFromHeadless = extractDetailUrls(listingHtml, headUrl);
            urlsFromHeadless.forEach((url) => detailUrls.add(url));
            console.log(JSON.stringify({ event: "crawl_real_listing_page_fetched_headless", runId, customerId, url: listingPageUrl, discoveredCount: urlsFromHeadless.size, htmlLength: listingHtml.length }));
          }
        } catch (err) {
          console.log(JSON.stringify({ event: "crawl_real_headless_failed", runId, customerId, error: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined }));
        }
      }
    }
    
    // Strategy 3: Fallback to regular HTTP fetch
    if (detailUrls.size < limit * 2) {
      const { body: listingHtml, trace: listingTrace } = await fetchWithTrace(listingPageUrl, { timeoutMs: 30000 });
      if (!listingTrace.error && listingTrace.status && listingTrace.status < 400 && listingHtml) {
        const urlsFromHttp = extractDetailUrls(listingHtml, headUrl);
        urlsFromHttp.forEach((url) => detailUrls.add(url));
        console.log(JSON.stringify({ event: "crawl_real_listing_page_fetched_http", runId, customerId, url: listingPageUrl, discoveredCount: urlsFromHttp.size, htmlLength: listingHtml.length }));
      }
    }
    
    console.log(JSON.stringify({ event: "crawl_real_discovery_done", runId, customerId, discoveredCount: detailUrls.size }));

    console.log(JSON.stringify({ event: "crawl_real_discovery_done", runId, customerId, discoveredCount: detailUrls.size }));

    // Step 2: Extract and ingest items
    const detailUrlArray = Array.from(detailUrls);
    let ingestedCount = 0;
    const errors: string[] = [];

    for (const detailUrl of detailUrlArray) {
      if (ingestedCount >= limit) break;

      try {
        const vehicleData = await extractVehicleData(detailUrl, headUrl);
        if (!vehicleData) {
          errors.push(`Failed to extract data from ${detailUrl}`);
          continue;
        }

        const externalId = stableExternalId(detailUrl);

        // Upsert inventory item
        await db
          .insert(inventoryItems)
          .values({
            customerId,
            inventorySourceId: source.id,
            externalId,
            title: vehicleData.title,
            url: detailUrl,
            price: vehicleData.price,
            status: "active",
            firstSeenAt: now,
            lastSeenAt: now,
            detailsJson: vehicleData.details as unknown as Record<string, unknown>,
          })
          .onConflictDoUpdate({
            target: [inventoryItems.customerId, inventoryItems.inventorySourceId, inventoryItems.externalId],
            set: {
              title: vehicleData.title,
              url: detailUrl,
              price: vehicleData.price,
              status: "active",
              lastSeenAt: now,
              detailsJson: vehicleData.details as unknown as Record<string, unknown>,
            },
          });

        ingestedCount++;
        
        // Log parsing details for first 3 items (forensic logging)
        if (ingestedCount <= 3 && process.env.NODE_ENV !== "production") {
          const detailsJson = vehicleData.details as any;
          console.log(JSON.stringify({
            event: "crawl_real_item_parsed",
            runId,
            customerId,
            url: detailUrl,
            title_raw: vehicleData.titleRaw,
            title_norm: vehicleData.title,
            price_raw: vehicleData.priceRaw,
            price_norm: vehicleData.price,
            price_source: detailsJson.priceSource,
            monthly_price: detailsJson.monthlyPrice,
            monthly_price_source: detailsJson.monthlyPriceSource,
            price_candidates: detailsJson.priceCandidates,
            mileage_raw: vehicleData.mileageRaw,
            mileage_km: vehicleData.mileageKm,
          }));
        }
        
        console.log(JSON.stringify({ event: "crawl_real_item_ingested", runId, customerId, url: detailUrl, title: vehicleData.title }));

        // Small delay to be respectful
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        errors.push(`Error processing ${detailUrl}: ${errorMsg}`);
        console.log(JSON.stringify({ event: "crawl_real_item_error", runId, customerId, url: detailUrl, error: errorMsg }));
      }
    }

    // Update source last crawled
    await db
      .update(inventorySources)
      .set({ lastCrawledAt: now })
      .where(eq(inventorySources.id, source.id));

    // Mark run as success
    await db
      .update(crawlRuns)
      .set({
        status: "success",
        finishedAt: new Date(),
        errorMessage: errors.length > 0 ? errors.slice(0, 3).join("; ") : null,
      })
      .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));

    console.log(JSON.stringify({ event: "crawl_real_finish", runId, customerId, status: "success", ingestedCount, errors: errors.length }));
    await job.ack();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: "crawl_real_finish", runId, customerId, status: "failed", error: message }));
    await db
      .update(crawlRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: message })
      .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));
    await job.deadLetter(message);
  }
}
