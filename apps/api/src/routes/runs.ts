import type { FastifyInstance } from "fastify";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { scrapeRuns, runEvents, dataSources } from "@repo/db/schema";
import { emitRunEvent } from "@repo/observability/runEvents";

const RUN_ID_REGEX = /^[0-9a-f-]{36}$/i;

export async function runsRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Params: { id: string } }>("/v1/data-sources/:id/test-run", async (request, reply) => {
    const customerId = request.customer.customerId;
    const dataSourceId = request.params.id;

    const [dataSourceRow] = await db
      .select()
      .from(dataSources)
      .where(and(eq(dataSources.id, dataSourceId), eq(dataSources.customerId, customerId)))
      .limit(1);
    if (!dataSourceRow) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Data source not found" } });
    }

    const [run] = await db
      .insert(scrapeRuns)
      .values({
        customerId,
        dataSourceId,
        runType: "test",
        status: "queued",
      })
      .returning({ id: scrapeRuns.id });

    if (!run) return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    const runId = String(run.id);
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.SCRAPE_TEST,
      payload: { dataSourceId },
      correlation: { customerId, dataSourceId, runId },
    });

    await db
      .update(scrapeRuns)
      .set({ jobId })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

    await emitRunEvent(db, {
      customerId,
      jobType: "SCRAPE_TEST",
      jobId,
      runId,
      dataSourceId,
      level: "info",
      stage: "enqueued",
      eventCode: "SYSTEM_JOB_START",
      message: "SCRAPE_TEST job enqueued",
    });

    return reply.status(201).send({ runId, jobId });
  });

  app.post<{ Params: { id: string } }>("/v1/data-sources/:id/probe", async (request, reply) => {
    const customerId = request.customer.customerId;
    const dataSourceId = request.params.id;

    const [dataSourceRow] = await db
      .select()
      .from(dataSources)
      .where(and(eq(dataSources.id, dataSourceId), eq(dataSources.customerId, customerId)))
      .limit(1);
    if (!dataSourceRow) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Data source not found" } });
    }

    const [run] = await db
      .insert(scrapeRuns)
      .values({
        customerId,
        dataSourceId,
        runType: "probe",
        status: "queued",
      })
      .returning({ id: scrapeRuns.id });

    if (!run) return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    const runId = String(run.id);

    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.SOURCE_PROBE,
      payload: { dataSourceId },
      correlation: { customerId, dataSourceId, runId },
    });

    await db
      .update(scrapeRuns)
      .set({ jobId })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

    await emitRunEvent(db, {
      customerId,
      jobType: "SOURCE_PROBE",
      jobId,
      runId,
      dataSourceId,
      level: "info",
      stage: "enqueued",
      eventCode: "SYSTEM_JOB_START",
      message: "SOURCE_PROBE job enqueued",
    });

    return reply.status(201).send({ runId, jobId });
  });

  app.post<{ Params: { id: string } }>("/v1/data-sources/:id/prod-run", async (request, reply) => {
    const customerId = request.customer.customerId;
    const dataSourceId = request.params.id;

    const [dataSourceRow] = await db
      .select()
      .from(dataSources)
      .where(and(eq(dataSources.id, dataSourceId), eq(dataSources.customerId, customerId)))
      .limit(1);
    if (!dataSourceRow) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Data source not found" } });
    }

    const [run] = await db
      .insert(scrapeRuns)
      .values({
        customerId,
        dataSourceId,
        runType: "prod",
        status: "queued",
      })
      .returning({ id: scrapeRuns.id });

    if (!run) return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    const runId = String(run.id);
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.SCRAPE_PROD,
      payload: { dataSourceId },
      correlation: { customerId, dataSourceId, runId },
    });

    await db
      .update(scrapeRuns)
      .set({ jobId })
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)));

    await emitRunEvent(db, {
      customerId,
      jobType: "SCRAPE_PROD",
      jobId,
      runId,
      dataSourceId,
      level: "info",
      stage: "enqueued",
      eventCode: "SYSTEM_JOB_START",
      message: "SCRAPE_PROD job enqueued",
    });

    return reply.status(201).send({ runId, jobId });
  });

  app.get<{ Querystring: { dataSourceId?: string; limit?: string } }>("/v1/scrape-runs", async (request, reply) => {
    const customerId = request.customer.customerId;
    const limit = Math.min(parseInt(request.query.limit ?? "50", 10) || 50, 200);
    const conditions = request.query.dataSourceId
      ? and(eq(scrapeRuns.customerId, customerId), eq(scrapeRuns.dataSourceId, request.query.dataSourceId))
      : eq(scrapeRuns.customerId, customerId);
    const list = await db
      .select()
      .from(scrapeRuns)
      .where(conditions)
      .orderBy(desc(scrapeRuns.startedAt))
      .limit(limit);
    return reply.send({ data: list });
  });

  app.get<{ Params: { runId: string } }>("/v1/scrape-runs/:runId", async (request, reply) => {
    const customerId = request.customer.customerId;
    const runId = request.params.runId;
    if (!RUN_ID_REGEX.test(runId)) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Invalid runId" } });
    }
    const [row] = await db
      .select()
      .from(scrapeRuns)
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)))
      .limit(1);
    if (!row) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Run not found" } });
    }
    return reply.send(row);
  });

  app.get<{ Params: { runId: string }; Querystring: { limit?: string } }>("/v1/scrape-runs/:runId/events", async (request, reply) => {
    const customerId = request.customer.customerId;
    const runId = request.params.runId;
    const limit = Math.min(parseInt(request.query.limit ?? "200", 10) || 200, 500);
    if (!RUN_ID_REGEX.test(runId)) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Invalid runId" } });
    }
    const list = await db
      .select()
      .from(runEvents)
      .where(and(eq(runEvents.runId, runId), eq(runEvents.customerId, customerId)))
      .orderBy(desc(runEvents.createdAt))
      .limit(limit);
    return reply.send({ data: list });
  });

  const SUCCESS_EVENT_CODES = new Set(["SYSTEM_JOB_START", "SCRAPE_PARSE_OK", "SYSTEM_JOB_SUCCESS"]);

  app.get<{ Params: { runId: string } }>("/v1/scrape-runs/:runId/summary", async (request, reply) => {
    const customerId = request.customer.customerId;
    const runId = request.params.runId;
    if (!RUN_ID_REGEX.test(runId)) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Invalid runId" } });
    }
    const [run] = await db
      .select()
      .from(scrapeRuns)
      .where(and(eq(scrapeRuns.id, runId), eq(scrapeRuns.customerId, customerId)))
      .limit(1);
    if (!run) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Run not found" } });
    }
    const events = await db
      .select()
      .from(runEvents)
      .where(and(eq(runEvents.runId, runId), eq(runEvents.customerId, customerId)))
      .orderBy(desc(runEvents.createdAt))
      .limit(500);
    let latestErrorEventCode: string | null = null;
    let title: string | null = null;
    for (const ev of events) {
      if (!SUCCESS_EVENT_CODES.has(ev.eventCode)) latestErrorEventCode ??= ev.eventCode;
      const meta = ev.meta as { title?: string } | null;
      if (meta?.title) title ??= meta.title;
    }
    return reply.send({
      run,
      eventsCount: events.length,
      latestErrorEventCode,
      title,
    });
  });
}
