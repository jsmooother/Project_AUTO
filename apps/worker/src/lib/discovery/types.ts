/**
 * Discovery engine: generic strategies (sitemap, html_links, endpoint_sniff, headless_listing).
 */

export interface DiscoveredItem {
  sourceItemId: string;
  url: string;
}

export interface DiscoverResult {
  items: DiscoveredItem[];
  meta: {
    strategy: string;
    discoveredCount: number;
    seedUrlsFetched?: number;
    sitemapUrlsFetched?: number;
    rawCandidates?: number;
    matchedPatternCount?: number;
    dedupedCount?: number;
    jsonLdCount?: number;
    endpointHintsCount?: number;
  };
}

export interface DiscoveryContext {
  baseUrl: string; // e.g. https://www.example.com
  origin: string;  // e.g. https://www.example.com (no path)
}
