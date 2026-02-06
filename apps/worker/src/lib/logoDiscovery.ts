/**
 * Logo discovery and fetching for customer branding.
 * Attempts to discover logo from website HTML using common patterns.
 */

import { uploadBuffer, LOGOS_BUCKET, isStorageConfigured } from "./storage.js";

export interface LogoDiscoveryResult {
  logoUrl: string | null;
  error?: string;
}

/**
 * Discover logo URL from HTML content.
 * Tries multiple strategies:
 * 1. <link rel="icon"> or <link rel="apple-touch-icon">
 * 2. <meta property="og:image">
 * 3. <img> tags in header with "logo" in class/id/alt
 * 4. Fallback to /favicon.ico
 */
export function discoverLogoFromHtml(html: string, baseUrl: string): string | null {
  const base = new URL(baseUrl);
  const baseOrigin = base.origin;

  // Strategy 1: <link rel="icon"> or <link rel="apple-touch-icon">
  const linkIconMatch = html.match(/<link[^>]+rel=["'](?:icon|apple-touch-icon)["'][^>]+href=["']([^"']+)["']/i);
  if (linkIconMatch && linkIconMatch[1]) {
    return resolveUrl(linkIconMatch[1], baseOrigin);
  }

  // Strategy 2: <meta property="og:image">
  const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogImageMatch && ogImageMatch[1]) {
    return resolveUrl(ogImageMatch[1], baseOrigin);
  }

  // Strategy 3: <img> tags in header with "logo" in class/id/alt
  const headerMatch = html.match(/<header[^>]*>([\s\S]*?)<\/header>/i);
  if (headerMatch) {
    const headerHtml = headerMatch[1];
    const logoImgMatch = headerHtml.match(/<img[^>]*(?:class|id|alt)=["'][^"']*logo[^"']*["'][^>]+src=["']([^"']+)["']/i);
    if (logoImgMatch && logoImgMatch[1]) {
      return resolveUrl(logoImgMatch[1], baseOrigin);
    }
  }

  // Strategy 4: Fallback to /favicon.ico
  return `${baseOrigin}/favicon.ico`;
}

/**
 * Resolve relative URL to absolute URL.
 */
function resolveUrl(url: string, baseOrigin: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("/")) {
    return `${baseOrigin}${url}`;
  }
  return `${baseOrigin}/${url}`;
}

/**
 * Download logo image and upload to Supabase Storage.
 * Returns public URL of stored logo.
 */
export async function fetchAndStoreLogo(
  logoUrl: string,
  customerId: string
): Promise<{ storedUrl: string } | { error: string }> {
  if (!isStorageConfigured()) {
    return { error: "STORAGE_NOT_CONFIGURED: Supabase Storage required for logo storage" };
  }

  try {
    // Download logo
    const response = await fetch(logoUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ProjectAuto/1.0)",
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      return { error: `Failed to download logo: ${response.status} ${response.statusText}` };
    }

    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.startsWith("image/")) {
      return { error: `Invalid content type: ${contentType}` };
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Determine file extension from content type or URL
    let ext = "png";
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      ext = "jpg";
    } else if (contentType.includes("svg")) {
      ext = "svg";
    } else if (contentType.includes("webp")) {
      ext = "webp";
    } else {
      // Try to infer from URL
      const urlMatch = logoUrl.match(/\.(png|jpg|jpeg|svg|webp)(\?|$)/i);
      if (urlMatch) {
        ext = urlMatch[1].toLowerCase();
      }
    }

    // Upload to storage: customerId/logo.ext
    const storagePath = `${customerId}/logo.${ext}`;
    const publicUrl = await uploadBuffer({
      bucket: LOGOS_BUCKET,
      path: storagePath,
      contentType,
      buffer,
    });

    return { storedUrl: publicUrl };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: `Logo fetch/store failed: ${message}` };
  }
}
