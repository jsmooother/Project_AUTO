import type { FastifyInstance } from "fastify";
import { eq, and, desc, inArray, gte } from "drizzle-orm";
import { db } from "../lib/db.js";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { inventorySources, crawlRuns, previewRuns, adRuns } from "@repo/db/schema";

export async function crawlRunsRoutes(app: FastifyInstance): Promise<void> {
  // POST /runs/crawl - enqueue a crawl run for the active source (manual trigger)
  app.post("/runs/crawl", async (request, reply) => {
    try {
      const customerId = request.customer.customerId;

      const [source] = await db
        .select()
        .from(inventorySources)
        .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
        .limit(1);

      if (!source) {
        return reply.status(400).send({
          error: "MISSING_PREREQUISITE",
          message: "No active inventory source. Connect a website first.",
          hint: "Go to Connect Website and add your inventory URL, then try Run crawl again.",
        });
      }

      const DEDUPE_SECONDS = 30;
      const dedupeSince = new Date(Date.now() - DEDUPE_SECONDS * 1000);
      let recent: { id: string } | undefined;
      try {
        [recent] = await db
          .select({ id: crawlRuns.id })
          .from(crawlRuns)
          .where(
            and(
              eq(crawlRuns.customerId, customerId),
              eq(crawlRuns.inventorySourceId, source.id),
              inArray(crawlRuns.status, ["queued", "running"]),
              gte(crawlRuns.createdAt, dedupeSince)
            )
          )
          .limit(1);
      } catch (dedupeErr) {
        request.log.warn({ err: dedupeErr, customerId }, "Dedupe check failed, creating new run");
      }
      if (recent) {
        request.log.info({ runId: recent.id, customerId, jobType: "crawl", event: "enqueue_deduped" });
        return reply.status(200).send({ runId: String(recent.id), jobId: null, deduped: true });
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
      
      // Extract domain from website URL for site identifier
      let site = "unknown";
      try {
        const url = new URL(source.websiteUrl);
        site = url.hostname.replace(/^www\./, ""); // Remove www. prefix if present
      } catch {
        // If URL parsing fails, use a default
        site = "unknown";
      }
      
      // Use live crawl with 10 item limit for testing
      const jobId = await queue.enqueue({
        jobType: JOB_TYPES.CRAWL_REAL,
        payload: {
          customerId, // Required by CrawlRealPayload interface
          headUrl: source.websiteUrl,
          limit: 10, // Limit to 10 items for speed in testing
          site: site,
        },
        correlation: { customerId, runId },
      });

      request.log.info({ runId, customerId, jobId, jobType: "crawl_real", event: "enqueue", limit: 10 });
      return reply.status(201).send({ runId, jobId });
    } catch (err) {
      request.log.error(err);
      throw err;
    }
  });

  // GET /runs?type=crawl|preview|ads - list recent crawl, preview, or ads runs for customer
  app.get<{ Querystring: { type?: string; limit?: string } }>("/runs", async (request, reply) => {
    const customerId = request.customer.customerId;
    const type = request.query.type ?? "crawl";
    const limit = Math.min(parseInt(request.query.limit ?? "50", 10) || 50, 100);

    if (type === "crawl") {
      const rows = await db
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
      const runs = rows.map((r) => ({ ...r, type: "crawl" as const, templateConfigId: null }));
      return reply.send({ data: runs });
    }

    if (type === "preview") {
      const rows = await db
        .select({
          id: previewRuns.id,
          templateConfigId: previewRuns.templateConfigId,
          trigger: previewRuns.trigger,
          status: previewRuns.status,
          startedAt: previewRuns.startedAt,
          finishedAt: previewRuns.finishedAt,
          errorMessage: previewRuns.errorMessage,
          createdAt: previewRuns.createdAt,
        })
        .from(previewRuns)
        .where(eq(previewRuns.customerId, customerId))
        .orderBy(desc(previewRuns.createdAt))
        .limit(limit);
      const runs = rows.map((r) => ({ ...r, type: "preview" as const, inventorySourceId: null }));
      return reply.send({ data: runs });
    }

    if (type === "ads") {
      const rows = await db
        .select({
          id: adRuns.id,
          trigger: adRuns.trigger,
          status: adRuns.status,
          startedAt: adRuns.startedAt,
          finishedAt: adRuns.finishedAt,
          errorMessage: adRuns.errorMessage,
          createdAt: adRuns.createdAt,
        })
        .from(adRuns)
        .where(eq(adRuns.customerId, customerId))
        .orderBy(desc(adRuns.createdAt))
        .limit(limit);
      const runs = rows.map((r) => ({
        ...r,
        type: "ads" as const,
        inventorySourceId: null,
        templateConfigId: null,
      }));
      return reply.send({ data: runs });
    }

    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Query param type must be 'crawl', 'preview', or 'ads'",
    });
  });
}
