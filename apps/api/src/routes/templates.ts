import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import {
  adTemplates,
  adTemplateConfigs,
  adPreviews,
  previewRuns,
  approvals,
} from "@repo/db/schema";

const configBody = z.object({
  templateKey: z.string().min(1),
  brandName: z.string().optional(),
  primaryColor: z.string().optional(),
  logoUrl: z.string().optional(),
  headlineStyle: z.string().optional(),
});

const approveBody = z.object({
  notes: z.string().optional(),
});

export async function templatesRoutes(app: FastifyInstance): Promise<void> {
  // GET /templates - list available templates
  app.get("/templates", async (_request, reply) => {
    const list = await db.select().from(adTemplates).orderBy(adTemplates.key);
    return reply.send({ data: list });
  });

  // GET /templates/config - current customer config (or null)
  app.get("/templates/config", async (request, reply) => {
    const customerId = request.customer.customerId;
    const [config] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);
    return reply.send(config ?? null);
  });

  // POST /templates/config - upsert config
  app.post("/templates/config", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = configBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    const [template] = await db
      .select()
      .from(adTemplates)
      .where(eq(adTemplates.key, parsed.data.templateKey))
      .limit(1);
    if (!template) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: `Unknown template key: ${parsed.data.templateKey}` },
      });
    }

    const [existing] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    const values = {
      templateKey: parsed.data.templateKey,
      brandName: parsed.data.brandName ?? null,
      primaryColor: parsed.data.primaryColor ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      headlineStyle: parsed.data.headlineStyle ?? null,
      status: "draft" as const,
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(adTemplateConfigs)
        .set(values)
        .where(eq(adTemplateConfigs.id, existing.id))
        .returning();
      return reply.status(200).send(updated);
    }

    const [created] = await db
      .insert(adTemplateConfigs)
      .values({
        customerId,
        ...values,
      })
      .returning();
    if (!created) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    }
    return reply.status(201).send(created);
  });

  // POST /templates/previews/run - enqueue PREVIEW job
  app.post("/templates/previews/run", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [config] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    if (!config) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "No template config. Configure a template first (POST /templates/config).",
        },
      });
    }

    const [run] = await db
      .insert(previewRuns)
      .values({
        customerId,
        templateConfigId: config.id,
        trigger: "manual",
        status: "queued",
      })
      .returning({ id: previewRuns.id });

    if (!run) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    }

    const runId = String(run.id);
    const jobId = await queue.enqueue({
      jobType: JOB_TYPES.PREVIEW,
      payload: { templateConfigId: config.id },
      correlation: { customerId, runId },
    });

    return reply.status(201).send({ runId, jobId });
  });

  // GET /templates/previews - list previews for current config
  app.get("/templates/previews", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [config] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    if (!config) {
      return reply.send({ data: [], config: null });
    }

    const list = await db
      .select()
      .from(adPreviews)
      .where(
        and(
          eq(adPreviews.customerId, customerId),
          eq(adPreviews.templateConfigId, config.id)
        )
      )
      .orderBy(desc(adPreviews.createdAt));

    return reply.send({ data: list, config: { id: config.id, status: config.status } });
  });

  // GET /templates/previews/:id/html - serve HTML preview content
  app.get<{ Params: { id: string } }>("/templates/previews/:id/html", async (request, reply) => {
    const customerId = request.customer.customerId;
    const previewId = request.params.id;

    const [preview] = await db
      .select()
      .from(adPreviews)
      .where(
        and(eq(adPreviews.id, previewId), eq(adPreviews.customerId, customerId))
      )
      .limit(1);

    if (!preview) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Preview not found" } });
    }

    if (preview.previewType !== "html" || !preview.htmlContent) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: "Preview has no HTML content" },
      });
    }

    reply.header("Content-Type", "text/html; charset=utf-8");
    return reply.send(preview.htmlContent);
  });

  // POST /templates/approve - approve current config
  app.post("/templates/approve", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = approveBody.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    const [config] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    if (!config) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: "No template config to approve." },
      });
    }

    if (config.status === "approved") {
      return reply.status(200).send({ message: "Already approved", config });
    }

    const [latestRun] = await db
      .select()
      .from(previewRuns)
      .where(
        and(
          eq(previewRuns.customerId, customerId),
          eq(previewRuns.templateConfigId, config.id)
        )
      )
      .orderBy(desc(previewRuns.createdAt))
      .limit(1);

    if (!latestRun || latestRun.status !== "success") {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot approve: no successful preview run. Generate previews first.",
        },
      });
    }

    const previews = await db
      .select({ id: adPreviews.id })
      .from(adPreviews)
      .where(
        and(
          eq(adPreviews.customerId, customerId),
          eq(adPreviews.templateConfigId, config.id)
        )
      );

    if (previews.length === 0) {
      return reply.status(400).send({
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot approve: no previews exist. Generate previews first.",
        },
      });
    }

    const [approval] = await db
      .insert(approvals)
      .values({
        customerId,
        templateConfigId: config.id,
        notes: parsed.data.notes ?? null,
      })
      .returning();

    await db
      .update(adTemplateConfigs)
      .set({ status: "approved", updatedAt: new Date() })
      .where(eq(adTemplateConfigs.id, config.id));

    const [updatedConfig] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.id, config.id))
      .limit(1);

    return reply.status(200).send({
      message: "Approved",
      approval,
      config: updatedConfig ?? config,
    });
  });
}
