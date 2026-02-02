import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc, inArray, gte } from "drizzle-orm";
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
      const message = parsed.error.errors[0]?.message ?? parsed.error.message;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: String(message),
        issues: parsed.error.issues,
      });
    }

    const [template] = await db
      .select()
      .from(adTemplates)
      .where(eq(adTemplates.key, parsed.data.templateKey))
      .limit(1);
    if (!template) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: `Unknown template key: ${parsed.data.templateKey}`,
      });
    }

    const [existing] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    const configChanged =
      existing &&
      (existing.templateKey !== parsed.data.templateKey ||
        (existing.brandName ?? null) !== (parsed.data.brandName ?? null) ||
        (existing.primaryColor ?? null) !== (parsed.data.primaryColor ?? null) ||
        (existing.logoUrl ?? null) !== (parsed.data.logoUrl ?? null) ||
        (existing.headlineStyle ?? null) !== (parsed.data.headlineStyle ?? null));
    const wasApprovedOrPreviewReady =
      existing && (existing.status === "approved" || existing.status === "preview_ready");
    const invalidateApproval = Boolean(configChanged && wasApprovedOrPreviewReady);

    const status: "draft" | "preview_ready" | "approved" = !existing
      ? "draft"
      : invalidateApproval
        ? "draft"
        : existing.status;

    const values = {
      templateKey: parsed.data.templateKey,
      brandName: parsed.data.brandName ?? null,
      primaryColor: parsed.data.primaryColor ?? null,
      logoUrl: parsed.data.logoUrl ?? null,
      headlineStyle: parsed.data.headlineStyle ?? null,
      status,
      updatedAt: new Date(),
    };

    if (existing && invalidateApproval) {
      await db.delete(approvals).where(eq(approvals.templateConfigId, existing.id));
    }

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
        error: "MISSING_PREREQUISITE",
        message: "No template config. Configure a template first.",
        hint: "Choose a template and save config on the Templates page, then try Generate previews again.",
      });
    }

    const DEDUPE_SECONDS = 30;
    const dedupeSince = new Date(Date.now() - DEDUPE_SECONDS * 1000);
    let recent: { id: string } | undefined;
    try {
      [recent] = await db
        .select({ id: previewRuns.id })
        .from(previewRuns)
        .where(
          and(
            eq(previewRuns.customerId, customerId),
            eq(previewRuns.templateConfigId, config.id),
            inArray(previewRuns.status, ["queued", "running"]),
            gte(previewRuns.createdAt, dedupeSince)
          )
        )
        .limit(1);
    } catch (dedupeErr) {
      request.log.warn({ err: dedupeErr, customerId }, "Preview dedupe check failed, creating new run");
    }
    if (recent) {
      request.log.info({ runId: recent.id, customerId, jobType: "preview", event: "enqueue_deduped" });
      return reply.status(200).send({ runId: String(recent.id), jobId: null, deduped: true });
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

    request.log.info({ runId, customerId, jobId, jobType: "preview", event: "enqueue" });
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
      const message = parsed.error.errors[0]?.message ?? parsed.error.message;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: String(message),
        issues: parsed.error.issues,
      });
    }

    const [config] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    if (!config) {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: "No template config to approve.",
        hint: "Save a template config and generate previews first.",
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
        error: "MISSING_PREREQUISITE",
        message: "Cannot approve: no successful preview run.",
        hint: "Click Generate previews and wait for the run to complete, then try Approve again.",
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
        error: "MISSING_PREREQUISITE",
        message: "Cannot approve: no previews exist.",
        hint: "Generate previews first and wait for the job to finish.",
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
