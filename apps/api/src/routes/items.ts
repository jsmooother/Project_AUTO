import type { FastifyInstance } from "fastify";
import { and, eq, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { items } from "@repo/db/schema";

export async function itemsRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Params: { id: string }; Querystring: { active?: string; limit?: string } }>(
    "/v1/data-sources/:id/items",
    async (request, reply) => {
      const customerId = request.customer.customerId;
      const dataSourceId = request.params.id;
      const active = request.query.active === "true";
      const limit = Math.min(parseInt(request.query.limit ?? "10", 10) || 10, 100);

      const conditions = active
        ? and(eq(items.customerId, customerId), eq(items.dataSourceId, dataSourceId), eq(items.isActive, true))
        : and(eq(items.customerId, customerId), eq(items.dataSourceId, dataSourceId));

      const list = await db
        .select({
          id: items.id,
          url: items.url,
          title: items.title,
          primaryImageUrl: items.primaryImageUrl,
          detailFetchedAt: items.detailFetchedAt,
          isActive: items.isActive,
        })
        .from(items)
        .where(conditions)
        .orderBy(desc(items.lastSeenAt))
        .limit(limit);

      return reply.send({ data: list });
    }
  );

  app.get<{ Params: { id: string } }>("/v1/items/:id", async (request, reply) => {
    const customerId = request.customer.customerId;
    const id = request.params.id;
    const [row] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.customerId, customerId)))
      .limit(1);
    if (!row) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Item not found" } });
    }
    return reply.send(row);
  });
}
