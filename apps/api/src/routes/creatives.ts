import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "../lib/db.js";
import { inventoryItems, creativeAssets } from "@repo/db/schema";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";

const generateCreativesBody = z.object({
  inventoryItemIds: z.array(z.string().uuid()).min(1, "At least one item ID required"),
  variants: z
    .array(z.enum(["feed", "story", "reel", "square"]))
    .optional()
    .default(["feed", "story"]),
});

const selectItemsBody = z.object({
  itemIds: z.array(z.string().uuid()).min(1, "At least one item ID required"),
  isAdEligible: z.boolean(),
});

export async function creativesRoutes(app: FastifyInstance): Promise<void> {
  // POST /creatives/generate - enqueue creative generation job
  app.post("/creatives/generate", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = generateCreativesBody.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? parsed.error.message,
        issues: parsed.error.issues,
      });
    }

    const { inventoryItemIds, variants } = parsed.data;

    // Verify all items belong to customer
    const items = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          inArray(inventoryItems.id, inventoryItemIds)
        )
      );

    if (items.length !== inventoryItemIds.length) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Some inventory items not found or do not belong to customer",
      });
    }

    // Enqueue creative generation job
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.CREATIVE_GENERATE,
      payload: {
        customerId,
        inventoryItemIds,
        variants,
      },
      correlation: { customerId },
    });

    return reply.send({ jobId, status: "queued" });
  });

  // GET /creatives/status - get creative status for items
  app.get("/creatives/status", async (request, reply) => {
    const customerId = request.customer.customerId;
    const itemIdsParam = (request.query as { itemIds?: string })?.itemIds;

    if (!itemIdsParam) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "itemIds query parameter required (comma-separated UUIDs)",
      });
    }

    const itemIds = itemIdsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (itemIds.length === 0) {
      return reply.send({ items: [] });
    }

    // Get creative assets for these items
    const assets = await db
      .select()
      .from(creativeAssets)
      .where(
        and(
          eq(creativeAssets.customerId, customerId),
          inArray(creativeAssets.inventoryItemId, itemIds)
        )
      );

    // Group by item ID
    const statusByItem: Record<
      string,
      {
        itemId: string;
        variants: Array<{
          variant: string;
          status: string;
          generatedImageUrl: string | null;
          errorMessage: string | null;
        }>;
      }
    > = {};

    for (const asset of assets) {
      if (!statusByItem[asset.inventoryItemId]) {
        statusByItem[asset.inventoryItemId] = {
          itemId: asset.inventoryItemId,
          variants: [],
        };
      }
      statusByItem[asset.inventoryItemId].variants.push({
        variant: asset.variant,
        status: asset.status,
        generatedImageUrl: asset.generatedImageUrl,
        errorMessage: asset.errorMessage,
      });
    }

    // Include items with no creatives yet
    for (const itemId of itemIds) {
      if (!statusByItem[itemId]) {
        statusByItem[itemId] = {
          itemId,
          variants: [],
        };
      }
    }

    return reply.send({
      items: Object.values(statusByItem),
    });
  });

  // POST /inventory/items/select - toggle isAdEligible for items
  app.post("/inventory/items/select", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = selectItemsBody.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? parsed.error.message,
        issues: parsed.error.issues,
      });
    }

    const { itemIds, isAdEligible } = parsed.data;

    // Verify all items belong to customer
    const items = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          inArray(inventoryItems.id, itemIds)
        )
      );

    if (items.length !== itemIds.length) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Some inventory items not found or do not belong to customer",
      });
    }

    // Update isAdEligible for all items
    await db
      .update(inventoryItems)
      .set({ isAdEligible })
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          inArray(inventoryItems.id, itemIds)
        )
      );

    return reply.send({
      updated: itemIds.length,
      isAdEligible,
    });
  });
}
