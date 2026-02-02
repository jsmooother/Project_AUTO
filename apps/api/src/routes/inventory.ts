import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { inventorySources, inventoryItems } from "@repo/db/schema";

const createSourceBody = z.object({
  websiteUrl: z.string().url(),
});

export async function inventoryRoutes(app: FastifyInstance): Promise<void> {
  // POST /inventory/source - create or update single active source for customer
  app.post("/inventory/source", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = createSourceBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    const [existing] = await db
      .select()
      .from(inventorySources)
      .where(eq(inventorySources.customerId, customerId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(inventorySources)
        .set({
          websiteUrl: parsed.data.websiteUrl,
          status: "active",
        })
        .where(eq(inventorySources.id, existing.id))
        .returning();
      return reply.status(200).send(updated);
    }

    const [created] = await db
      .insert(inventorySources)
      .values({
        customerId,
        websiteUrl: parsed.data.websiteUrl,
        status: "active",
      })
      .returning();

    if (!created) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    }
    return reply.status(201).send(created);
  });

  // GET /inventory/items - list inventory items for the active source
  app.get("/inventory/items", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [source] = await db
      .select()
      .from(inventorySources)
      .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
      .limit(1);

    if (!source) {
      return reply.send({ data: [], source: null });
    }

    const items = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          eq(inventoryItems.inventorySourceId, source.id)
        )
      )
      .orderBy(desc(inventoryItems.lastSeenAt));

    return reply.send({ data: items, source: { id: source.id, websiteUrl: source.websiteUrl } });
  });
}
