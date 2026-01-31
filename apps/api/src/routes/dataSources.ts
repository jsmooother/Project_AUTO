import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { dataSources } from "@repo/db/schema";

const createBody = z.object({
  name: z.string().min(1),
  baseUrl: z.string().url(),
  strategy: z.enum(["http", "playwright", "agentql"]).default("http"),
  scheduleEnabled: z.boolean().optional(),
  scheduleCron: z.string().optional(),
  maxItems: z.number().int().positive().optional(),
});

const updateBody = z.object({
  name: z.string().min(1).optional(),
  strategy: z.enum(["http", "playwright", "agentql"]).optional(),
  scheduleEnabled: z.boolean().optional(),
  scheduleCron: z.string().optional(),
  maxItems: z.number().int().positive().optional(),
});

export async function dataSourceRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/data-sources", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = createBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }
    const [row] = await db
      .insert(dataSources)
      .values({
        customerId,
        name: parsed.data.name,
        baseUrl: parsed.data.baseUrl,
        strategy: parsed.data.strategy,
        scheduleEnabled: parsed.data.scheduleEnabled ?? false,
        scheduleCron: parsed.data.scheduleCron ?? null,
        maxItems: parsed.data.maxItems ?? null,
      })
      .returning({ id: dataSources.id });
    if (!row) return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    return reply.status(201).send({ id: row.id });
  });

  app.get("/v1/data-sources", async (request, reply) => {
    const customerId = request.customer.customerId;
    const list = await db
      .select()
      .from(dataSources)
      .where(eq(dataSources.customerId, customerId));
    return reply.send({ data: list });
  });

  app.get<{ Params: { id: string } }>("/v1/data-sources/:id", async (request, reply) => {
    const customerId = request.customer.customerId;
    const id = request.params.id;
    const [row] = await db
      .select()
      .from(dataSources)
      .where(and(eq(dataSources.id, id), eq(dataSources.customerId, customerId)))
      .limit(1);
    if (!row) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Data source not found" } });
    }
    return reply.send(row);
  });

  app.patch<{ Params: { id: string } }>("/v1/data-sources/:id", async (request, reply) => {
    const customerId = request.customer.customerId;
    const id = request.params.id;
    const parsed = updateBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }
    const [row] = await db
      .update(dataSources)
      .set({
        ...(parsed.data.name != null && { name: parsed.data.name }),
        ...(parsed.data.strategy != null && { strategy: parsed.data.strategy }),
        ...(parsed.data.scheduleEnabled != null && { scheduleEnabled: parsed.data.scheduleEnabled }),
        ...(parsed.data.scheduleCron != null && { scheduleCron: parsed.data.scheduleCron }),
        ...(parsed.data.maxItems != null && { maxItems: parsed.data.maxItems }),
        updatedAt: new Date(),
      })
      .where(and(eq(dataSources.id, id), eq(dataSources.customerId, customerId)))
      .returning();
    if (!row) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Data source not found" } });
    }
    return reply.send(row);
  });
}
