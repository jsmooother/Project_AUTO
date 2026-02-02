import { createHash } from "crypto";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  inventorySources,
  crawlRuns,
  inventoryItems,
} from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";

const STUB_ITEM_COUNT = 10;

function stableExternalId(websiteUrl: string, index: number): string {
  const input = `${websiteUrl}\n${index}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

export async function processCrawlStub(
  job: QueuedJob<{ inventorySourceId: string }>
): Promise<void> {
  const { payload, correlation } = job;
  const { customerId, runId } = correlation;
  const { inventorySourceId } = payload;

  if (!customerId || !runId || !inventorySourceId) {
    await job.deadLetter("Missing correlation: customerId, runId and payload.inventorySourceId required");
    return;
  }

  const [source] = await db
    .select()
    .from(inventorySources)
    .where(
      and(
        eq(inventorySources.id, inventorySourceId),
        eq(inventorySources.customerId, customerId)
      )
    )
    .limit(1);

  if (!source) {
    await job.deadLetter("Inventory source not found");
    return;
  }

  const now = new Date();

  try {
    await db
      .update(crawlRuns)
      .set({ status: "running", startedAt: now })
      .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));

    const baseUrl = source.websiteUrl.replace(/\/$/, "");
    const items = Array.from({ length: STUB_ITEM_COUNT }, (_, i) => {
      const num = String(i + 1).padStart(3, "0");
      const externalId = stableExternalId(source.websiteUrl, i);
      return {
        customerId,
        inventorySourceId: source.id,
        externalId,
        title: `Listing ${num}`,
        url: `${baseUrl}/listing/${num}`,
        price: 1000 + i * 100,
        status: "active" as const,
        firstSeenAt: now,
        lastSeenAt: now,
      };
    });

    for (const item of items) {
      await db
        .insert(inventoryItems)
        .values(item)
        .onConflictDoUpdate({
          target: [inventoryItems.customerId, inventoryItems.inventorySourceId, inventoryItems.externalId],
          set: {
            title: item.title,
            url: item.url,
            price: item.price,
            status: "active",
            lastSeenAt: now,
          },
        });
    }

    await db
      .update(crawlRuns)
      .set({ status: "success", finishedAt: new Date() })
      .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));

    await db
      .update(inventorySources)
      .set({ lastCrawledAt: new Date() })
      .where(eq(inventorySources.id, source.id));

    await job.ack();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(crawlRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        errorMessage: message,
      })
      .where(and(eq(crawlRuns.id, runId), eq(crawlRuns.customerId, customerId)));
    await job.retry();
  }
}
