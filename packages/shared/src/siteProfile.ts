/**
 * SiteProfile: persisted in data_sources.config_json.
 * Used by OnboardingProbe (write) and SCRAPE_PROD (read).
 */

export type DiscoveryStrategy =
  | "sitemap"
  | "html_links"
  | "endpoint_sniff"
  | "headless_listing"
  | "unknown";

export type IdFromUrlMode = "last_segment" | "regex";

export type FetchDriver = "http" | "headless";

export type ExtractVertical = "vehicle" | "generic";

export type ExtractStrategy = "schema_org" | "dom" | "embedded_json" | "hybrid";

export interface SiteProfileProbe {
  testedAt: string; // ISO
  confidence: number; // 0–1
  notes: string[];
}

export interface SiteProfileDiscovery {
  strategy: DiscoveryStrategy;
  seedUrls: string[];
  sitemapUrls: string[];
  detailUrlPatterns: string[]; // regex strings
  idFromUrl: { mode: IdFromUrlMode; regex?: string };
}

export interface SiteProfileFetch {
  driver: FetchDriver;
  http?: { userAgent?: string; timeoutMs?: number };
  headless?: { enabled: boolean; waitFor?: string; timeoutMs?: number };
}

export interface SiteProfileExtractRules {
  title?: { css?: string; fallback?: "document_title" };
  price?: { regex?: string; currency?: string };
  images?: { mode?: "img_srcs" | "next_image_decode"; selectors?: string[] };
  attributes?: { mode?: string; selectors?: string[] };
}

export interface SiteProfileExtract {
  vertical: ExtractVertical;
  strategy: ExtractStrategy;
  rules?: SiteProfileExtractRules;
}

export interface SiteProfileLimits {
  concurrency?: number;
  maxNewPerRun?: number;
  politenessDelayMs?: number;
  maxPages?: number;
  maxItems?: number;
  maxDurationMs?: number;
}

export interface SiteProfile {
  profileVersion: number;
  probe: SiteProfileProbe;
  discovery: SiteProfileDiscovery;
  fetch: SiteProfileFetch;
  extract: SiteProfileExtract;
  limits: SiteProfileLimits;
}

export const DEFAULT_PROFILE_LIMITS: SiteProfileLimits = {
  concurrency: 6,
  maxNewPerRun: 50,
  politenessDelayMs: 0,
  maxPages: 50,
  maxItems: 500,
  maxDurationMs: 300_000,
};
