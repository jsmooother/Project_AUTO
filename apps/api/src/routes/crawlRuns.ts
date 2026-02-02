import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { inventorySources, crawlRuns } from "@repo/db/schema";

export async function crawlRunsRoutes(app: FastifyInstance): Promise<void> {
  // POST /runs/crawl - enqueue a crawl run for the active source (manual trigger)
  app.post("/runs/crawl", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [source] = await db
      .select()
      .from(inventorySources)
      .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
      .limit(1);

    if (!source) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "No active inventory source. Connect a website first (POST /inventory/source).",
        },
      });
    }

    const [run] = await db
      .insert(crawlRuns)
      .values({
        customerId,
        inventorySourceId: source.id,
        trigger: "manual",
        status: "queued",
      })
      .returning({ id: crawlRuns.id });

    if (!run) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    }

    const runId = String(run.id);
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.CRAWL,
      payload: { inventorySourceId: source.id },
      correlation: { customerId, runId },
    });

    return reply.status(201).send({ runId, jobId });
  });

  // GET /runs?type=crawl - list recent crawl runs for customer
  app.get<{ Querystring: { type?: string; limit?: string } }>("/runs", async (request, reply) => {
    const customerId = request.customer.customerId;
    const type = request.query.type;
    const limit = Math.min(parseInt(request.query.limit ?? "50", 10) || 50, 100);

    if (type !== "crawl") {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: "Query param type=crawl required" },
      });
    }

    const runs = await db
      .select({
        id: crawlRuns.id,
        inventorySourceId: crawlRuns.inventorySourceId,
        trigger: crawlRuns.trigger,
        status: crawlRuns.status,
        startedAt: crawlRuns.startedAt,
        finishedAt: crawlRuns.finishedAt,
        errorMessage: crawlRuns.errorMessage,
        createdAt: crawlRuns.createdAt,
      })
      .from(crawlRuns)
      .where(eq(crawlRuns.customerId, customerId))
      .orderBy(desc(crawlRuns.createdAt))
      .limit(limit);

    return reply.send({ data: runs });
  });
}
