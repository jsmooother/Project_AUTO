/**
 * LOGO_DISCOVER job: Discover and store customer logo from website.
 */

import { db } from "../lib/db.js";
import { inventorySources, customerBranding } from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";
import { eq, and } from "drizzle-orm";
import { fetchWithTrace } from "../lib/http.js";
import { discoverLogoFromHtml, fetchAndStoreLogo } from "../lib/logoDiscovery.js";

export interface LogoDiscoverPayload {
  customerId: string;
}

export async function processLogoDiscover(job: QueuedJob<LogoDiscoverPayload>): Promise<void> {
  const { payload, correlation } = job;
  const { customerId } = correlation;

  if (!customerId) {
    await job.deadLetter("Missing correlation: customerId required");
    return;
  }

  try {
    // Get inventory source (website URL)
    const [source] = await db
      .select()
      .from(inventorySources)
      .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
      .limit(1);

    if (!source) {
      await job.deadLetter("No active inventory source found");
      return;
    }

    const websiteUrl = source.websiteUrl;

    // Fetch homepage HTML
    const { body: html, trace } = await fetchWithTrace(websiteUrl, { timeoutMs: 10000 });
    if (trace.error || !html) {
      await job.deadLetter(`Failed to fetch website: ${trace.error ?? "unknown error"}`);
      return;
    }

    // Discover logo URL from HTML
    const logoUrl = discoverLogoFromHtml(html, websiteUrl);
    if (!logoUrl) {
      await job.deadLetter("No logo found in HTML");
      return;
    }

    // Download and store logo
    const result = await fetchAndStoreLogo(logoUrl, customerId);
    if ("error" in result) {
      await job.deadLetter(result.error);
      return;
    }

    // Upsert customer_branding
    const [existing] = await db
      .select()
      .from(customerBranding)
      .where(eq(customerBranding.customerId, customerId))
      .limit(1);

    if (existing) {
      await db
        .update(customerBranding)
        .set({
          logoUrl: result.storedUrl,
          updatedAt: new Date(),
        })
        .where(eq(customerBranding.customerId, customerId));
    } else {
      await db.insert(customerBranding).values({
        customerId,
        logoUrl: result.storedUrl,
        updatedAt: new Date(),
      });
    }

    console.log(
      JSON.stringify({
        event: "logo_discovered",
        customerId,
        logoUrl: result.storedUrl,
      })
    );

    await job.ack();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await job.deadLetter(`Logo discovery failed: ${message}`);
  }
}
