/**
 * Generic DiscoveryEngine: runs strategy from profile (sitemap, html_links, endpoint_sniff, headless_listing).
 */

import type { Driver } from "../drivers/types.js";
import type { SiteProfile } from "@repo/shared";
import { discoverViaSitemap } from "./sitemap.js";
import { discoverViaHtmlLinks } from "./htmlLinks.js";
import { discoverViaEndpointSniff } from "./endpointSniff.js";
import { discoverViaHeadlessListing } from "./headlessListing.js";
import type { DiscoverResult, DiscoveryContext } from "./types.js";
export type { DiscoverResult } from "./types.js";

const MIN_ITEMS_DEFAULT = 10;

function toContext(baseUrl: string): DiscoveryContext {
  try {
    const u = new URL(baseUrl);
    const origin = `${u.protocol}//${u.host}`;
    return { baseUrl, origin };
  } catch {
    return { baseUrl, origin: baseUrl };
  }
}

export interface DiscoverInput {
  profile: SiteProfile;
  baseUrl: string;
  driver: Driver;
  /** Optional: simulate removals by dropping fraction of discovered items (e.g. 0.1 = drop 10%) */
  simulateRemovalsFraction?: number;
}

export async function discover(input: DiscoverInput): Promise<DiscoverResult> {
  const { profile, baseUrl, driver, simulateRemovalsFraction } = input;
  const ctx = toContext(baseUrl);
  const strategy = profile.discovery?.strategy ?? "unknown";
  let items: Array<{ sourceItemId: string; url: string }> = [];
  let meta: DiscoverResult["meta"] = { strategy, discoveredCount: 0 };

  switch (strategy) {
    case "sitemap":
      items = await discoverViaSitemap(driver, profile, ctx);
      break;
    case "html_links":
      items = await discoverViaHtmlLinks(driver, profile, ctx);
      break;
    case "endpoint_sniff":
      {
        const result = await discoverViaEndpointSniff(driver, profile, ctx);
        items = result.items;
        meta = { ...result.meta };
      }
      break;
    case "headless_listing":
      items = await discoverViaHeadlessListing(driver, profile, ctx);
      break;
    default:
      items = [];
  }

  if (simulateRemovalsFraction != null && simulateRemovalsFraction > 0 && items.length > 0) {
    const keep = Math.max(1, Math.floor(items.length * (1 - simulateRemovalsFraction)));
    items = items.slice(0, keep);
  }

  const result: DiscoverResult = {
    items,
    meta: {
      ...meta,
      strategy,
      discoveredCount: items.length,
    },
  };
  return result;
}

export function getDiscoveryStrategyOrder(): Array<"sitemap" | "html_links" | "endpoint_sniff" | "headless_listing"> {
  return ["sitemap", "html_links", "endpoint_sniff", "headless_listing"];
}

export function getMinItemsForStrategy(): number {
  return Number(process.env.PROBE_MIN_ITEMS) || MIN_ITEMS_DEFAULT;
}
