import type { FastifyInstance } from "fastify";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  customers,
  crawlRuns,
  previewRuns,
  inventorySources,
  inventoryItems,
  adTemplateConfigs,
} from "@repo/db/schema";

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/inventory-sources
  app.get("/admin/inventory-sources", async (_request, reply) => {
    const list = await db
      .select({
        id: inventorySources.id,
        customerId: inventorySources.customerId,
        websiteUrl: inventorySources.websiteUrl,
        status: inventorySources.status,
        lastCrawledAt: inventorySources.lastCrawledAt,
        createdAt: inventorySources.createdAt,
      })
      .from(inventorySources)
      .orderBy(desc(inventorySources.createdAt));

    return reply.send({ data: list });
  });

  // GET /admin/customers
  app.get("/admin/customers", async (request, reply) => {
    const query = request.query as { search?: string; status?: string; limit?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10) || 50, 200);
    const conditions = [];

    if (query.status) {
      conditions.push(eq(customers.status, query.status));
    }

    let list = await db
      .select({
        id: customers.id,
        name: customers.name,
        status: customers.status,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(customers.createdAt))
      .limit(limit);

    if (query.search && query.search.trim()) {
      const search = query.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.id.toLowerCase().includes(search)
      );
    }

    return reply.send({ data: list });
  });

  // GET /admin/customers/:customerId
  app.get<{ Params: { customerId: string } }>("/admin/customers/:customerId", async (request, reply) => {
    const { customerId } = request.params;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Customer not found" } });
    }

    const [source] = await db
      .select()
      .from(inventorySources)
      .where(eq(inventorySources.customerId, customerId))
      .limit(1);

    const itemCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventoryItems)
      .where(eq(inventoryItems.customerId, customerId));

    const crawlCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(crawlRuns)
      .where(eq(crawlRuns.customerId, customerId));

    const previewCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(previewRuns)
      .where(eq(previewRuns.customerId, customerId));

    const [templateConfig] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    return reply.send({
      customer,
      inventorySource: source ?? null,
      stats: {
        inventoryItems: itemCount[0]?.count ?? 0,
        crawlRuns: crawlCount[0]?.count ?? 0,
        previewRuns: previewCount[0]?.count ?? 0,
        templateStatus: templateConfig?.status ?? null,
      },
    });
  });

  // GET /admin/runs
  app.get("/admin/runs", async (request, reply) => {
    const query = request.query as { type?: string; status?: string; customerId?: string; limit?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10) || 50, 200);

    if (query.type === "crawl") {
      const conditions = [];
      if (query.customerId) conditions.push(eq(crawlRuns.customerId, query.customerId));
      if (query.status) conditions.push(eq(crawlRuns.status, query.status));

      const rows = await db
        .select({
          id: crawlRuns.id,
          customerId: crawlRuns.customerId,
          trigger: crawlRuns.trigger,
          status: crawlRuns.status,
          startedAt: crawlRuns.startedAt,
          finishedAt: crawlRuns.finishedAt,
          errorMessage: crawlRuns.errorMessage,
          createdAt: crawlRuns.createdAt,
        })
        .from(crawlRuns)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(crawlRuns.createdAt))
        .limit(limit);

      const data = rows.map((r) => ({ ...r, type: "crawl" as const }));
      return reply.send({ data });
    }

    if (query.type === "preview") {
      const conditions = [];
      if (query.customerId) conditions.push(eq(previewRuns.customerId, query.customerId));
      if (query.status) conditions.push(eq(previewRuns.status, query.status));

      const rows = await db
        .select({
          id: previewRuns.id,
          customerId: previewRuns.customerId,
          trigger: previewRuns.trigger,
          status: previewRuns.status,
          startedAt: previewRuns.startedAt,
          finishedAt: previewRuns.finishedAt,
          errorMessage: previewRuns.errorMessage,
          createdAt: previewRuns.createdAt,
        })
        .from(previewRuns)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(previewRuns.createdAt))
        .limit(limit);

      const data = rows.map((r) => ({ ...r, type: "preview" as const }));
      return reply.send({ data });
    }

    // Combined: crawl + preview
    const [crawls, previews] = await Promise.all([
      db
        .select({
          id: crawlRuns.id,
          customerId: crawlRuns.customerId,
          trigger: crawlRuns.trigger,
          status: crawlRuns.status,
          startedAt: crawlRuns.startedAt,
          finishedAt: crawlRuns.finishedAt,
          errorMessage: crawlRuns.errorMessage,
          createdAt: crawlRuns.createdAt,
        })
        .from(crawlRuns)
        .where(query.customerId ? eq(crawlRuns.customerId, query.customerId) : undefined)
        .orderBy(desc(crawlRuns.createdAt))
        .limit(limit * 2),
      db
        .select({
          id: previewRuns.id,
          customerId: previewRuns.customerId,
          trigger: previewRuns.trigger,
          status: previewRuns.status,
          startedAt: previewRuns.startedAt,
          finishedAt: previewRuns.finishedAt,
          errorMessage: previewRuns.errorMessage,
          createdAt: previewRuns.createdAt,
        })
        .from(previewRuns)
        .where(query.customerId ? eq(previewRuns.customerId, query.customerId) : undefined)
        .orderBy(desc(previewRuns.createdAt))
        .limit(limit * 2),
    ]);

    const combined = [
      ...crawls.map((r) => ({ ...r, type: "crawl" as const })),
      ...previews.map((r) => ({ ...r, type: "preview" as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    let data = combined;
    if (query.status) {
      data = combined.filter((r) => r.status === query.status);
    }

    return reply.send({ data });
  });

  // GET /admin/runs/:runId
  app.get<{ Params: { runId: string } }>("/admin/runs/:runId", async (request, reply) => {
    const { runId } = request.params;

    const [crawl] = await db
      .select()
      .from(crawlRuns)
      .where(eq(crawlRuns.id, runId))
      .limit(1);

    if (crawl) {
      return reply.send({ ...crawl, type: "crawl" });
    }

    const [preview] = await db
      .select()
      .from(previewRuns)
      .where(eq(previewRuns.id, runId))
      .limit(1);

    if (preview) {
      return reply.send({ ...preview, type: "preview" });
    }

    return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Run not found" } });
  });
}
