import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { dataSources, supportCases, scrapeRuns } from "@repo/db/schema";
import { emitRunEvent } from "@repo/observability/runEvents";

const createBody = z.object({
  subject: z.string().min(1).optional(),
  description: z.string().optional(),
  dataSourceId: z.string().uuid().optional(),
});

export async function supportCaseRoutes(app: FastifyInstance): Promise<void> {
  app.post("/v1/support-cases", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = createBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    let scrapeRunId: string | null = null;
    let dataSourceId: string | null = parsed.data.dataSourceId ?? null;
    if (dataSourceId) {
      const [dataSource] = await db
        .select({ id: dataSources.id })
        .from(dataSources)
        .where(and(eq(dataSources.id, dataSourceId), eq(dataSources.customerId, customerId)))
        .limit(1);

      if (!dataSource) {
        return reply.status(404).send({
          error: { code: "NOT_FOUND", message: "Data source not found" },
        });
      }

      const [latest] = await db
        .select({ id: scrapeRuns.id })
        .from(scrapeRuns)
        .where(and(eq(scrapeRuns.customerId, customerId), eq(scrapeRuns.dataSourceId, dataSourceId)))
        .orderBy(desc(scrapeRuns.startedAt))
        .limit(1);
      if (latest) scrapeRunId = latest.id;
    }

    const [row] = await db
      .insert(supportCases)
      .values({
        customerId,
        dataSourceId,
        scrapeRunId,
        subject: parsed.data.subject ?? null,
        description: parsed.data.description ?? null,
        status: "open",
      })
      .returning();

    if (!row) return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });

    await emitRunEvent(db, {
      customerId,
      jobType: "SUPPORT",
      jobId: row.id,
      runId: scrapeRunId != null ? scrapeRunId : `support:${row.id}`,
      runIdUuid: scrapeRunId ?? undefined,
      dataSourceId: dataSourceId ?? undefined,
      level: "info",
      stage: "created",
      eventCode: "SUPPORT_CASE_CREATED",
      message: "Support case created",
      meta: { supportCaseId: row.id, ...(scrapeRunId != null ? { scrapeRunId } : {}), ...(dataSourceId != null ? { dataSourceId } : {}) },
    });

    return reply.status(201).send(row);
  });

  app.get<{ Querystring: { status?: string; limit?: string } }>("/v1/support-cases", async (request, reply) => {
    const customerId = request.customer.customerId;
    const limit = Math.min(parseInt(request.query.limit ?? "50", 10) || 50, 200);
    const conditions = request.query.status
      ? and(eq(supportCases.customerId, customerId), eq(supportCases.status, request.query.status))
      : eq(supportCases.customerId, customerId);
    const list = await db
      .select()
      .from(supportCases)
      .where(conditions)
      .orderBy(desc(supportCases.createdAt))
      .limit(limit);
    return reply.send({ data: list });
  });

  app.get<{ Params: { id: string } }>("/v1/support-cases/:id", async (request, reply) => {
    const customerId = request.customer.customerId;
    const id = request.params.id;
    const [row] = await db
      .select()
      .from(supportCases)
      .where(and(eq(supportCases.id, id), eq(supportCases.customerId, customerId)))
      .limit(1);
    if (!row) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Support case not found" } });
    }
    return reply.send(row);
  });
}
