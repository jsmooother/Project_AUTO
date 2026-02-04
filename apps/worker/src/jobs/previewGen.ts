import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  adTemplates,
  adTemplateConfigs,
  adPreviews,
  previewRuns,
  inventorySources,
  inventoryItems,
} from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";

const MAX_ITEMS_FOR_PREVIEW = 8;

function renderHtmlPreview(
  config: { brandName: string | null; primaryColor: string | null; logoUrl: string | null },
  templateKey: string,
  items: Array<{ title: string | null; url: string | null; price: number | null }>
): string {
  const color = config.primaryColor ?? "#0070f3";
  const brand = config.brandName ?? "Your Brand";
  const logo = config.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" style="max-height:40px;" />` : "";

  if (templateKey === "grid_4") {
    const slice = items.slice(0, 4);
    const cells = slice
      .map(
        (item) => `
        <div style="border:1px solid #ddd;padding:0.5rem;border-radius:4px;">
          <div style="font-weight:bold;font-size:0.9rem;">${escapeHtml(item.title ?? "Item")}</div>
          <div style="color:${color};font-size:1rem;">${item.price != null ? `$${item.price}` : ""}</div>
        </div>
      `
      )
      .join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:sans-serif;padding:1rem;">
      ${logo}
      <h2 style="color:${color};">${escapeHtml(brand)}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;max-width:400px;">${cells}</div>
    </body></html>`;
  }

  if (templateKey === "single_hero") {
    const item = items[0] ?? { title: "Featured Item", url: null, price: null };
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:sans-serif;padding:1rem;">
      ${logo}
      <h2 style="color:${color};">${escapeHtml(brand)}</h2>
      <div style="border:2px solid ${color};padding:1rem;border-radius:8px;max-width:300px;">
        <h3>${escapeHtml(item.title ?? "Featured")}</h3>
        <p style="font-size:1.2rem;color:${color};">${item.price != null ? `$${item.price}` : ""}</p>
        <button style="background:${color};color:white;border:none;padding:0.5rem 1rem;border-radius:4px;">Shop Now</button>
      </div>
    </body></html>`;
  }

  if (templateKey === "carousel_3") {
    const slice = items.slice(0, 3);
    const cells = slice
      .map(
        (item) => `
        <div style="border:1px solid #ddd;padding:0.5rem;border-radius:4px;min-width:120px;">
          <div style="font-weight:bold;">${escapeHtml(item.title ?? "Item")}</div>
          <div style="color:${color};">${item.price != null ? `$${item.price}` : ""}</div>
        </div>
      `
      )
      .join("");
    return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:sans-serif;padding:1rem;">
      ${logo}
      <h2 style="color:${color};">${escapeHtml(brand)}</h2>
      <div style="display:flex;gap:0.5rem;overflow-x:auto;">${cells}</div>
    </body></html>`;
  }

  // Fallback generic
  const slice = items.slice(0, 4);
  const cells = slice
    .map(
      (item) =>
        `<div style="border:1px solid #ddd;padding:0.5rem;">${escapeHtml(item.title ?? "")} ${item.price != null ? `$${item.price}` : ""}</div>`
    )
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:sans-serif;padding:1rem;">
    <h2>${escapeHtml(brand)}</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">${cells}</div>
  </body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function processPreviewGen(
  job: QueuedJob<{ templateConfigId: string }>
): Promise<void> {
  const { payload, correlation } = job;
  const { customerId, runId } = correlation;
  const { templateConfigId } = payload;

  if (!customerId || !runId || !templateConfigId) {
    const msg = "Missing correlation: customerId, runId and payload.templateConfigId required";
    if (customerId && runId) {
      await db
        .update(previewRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(previewRuns.id, runId), eq(previewRuns.customerId, customerId)));
    }
    await job.deadLetter(msg);
    return;
  }

  const [config] = await db
    .select()
    .from(adTemplateConfigs)
    .where(
      and(
        eq(adTemplateConfigs.id, templateConfigId),
        eq(adTemplateConfigs.customerId, customerId)
      )
    )
    .limit(1);

  if (!config) {
    const msg = "Template config not found";
    await db
      .update(previewRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
      .where(and(eq(previewRuns.id, runId), eq(previewRuns.customerId, customerId)));
    await job.deadLetter(msg);
    return;
  }

  const [template] = await db
    .select()
    .from(adTemplates)
    .where(eq(adTemplates.key, config.templateKey))
    .limit(1);

  if (!template) {
    const msg = `Template not found: ${config.templateKey}`;
    await db
      .update(previewRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
      .where(and(eq(previewRuns.id, runId), eq(previewRuns.customerId, customerId)));
    await job.deadLetter(msg);
    return;
  }

  const now = new Date();

  try {
    console.log(JSON.stringify({ event: "preview_job_start", runId, customerId, templateConfigId }));

    await db
      .update(previewRuns)
      .set({ status: "running", startedAt: now })
      .where(and(eq(previewRuns.id, runId), eq(previewRuns.customerId, customerId)));

    const [source] = await db
      .select()
      .from(inventorySources)
      .where(
        and(
          eq(inventorySources.customerId, customerId),
          eq(inventorySources.status, "active")
        )
      )
      .limit(1);

    let items: Array<{ id: string; title: string | null; url: string | null; price: number | null }> = [];

    if (source) {
      const rows = await db
        .select({
          id: inventoryItems.id,
          title: inventoryItems.title,
          url: inventoryItems.url,
          price: inventoryItems.price,
        })
        .from(inventoryItems)
        .where(
          and(
            eq(inventoryItems.customerId, customerId),
            eq(inventoryItems.inventorySourceId, source.id),
            eq(inventoryItems.status, "active")
          )
        )
        .orderBy(desc(inventoryItems.lastSeenAt))
        .limit(MAX_ITEMS_FOR_PREVIEW);
      items = rows;
    }

    if (items.length === 0) {
      console.log("[PREVIEW] No inventory items - generating placeholder preview");
      items = [
        { id: "", title: "Sample Item 1", url: null, price: 999 },
        { id: "", title: "Sample Item 2", url: null, price: 1299 },
        { id: "", title: "Sample Item 3", url: null, price: 799 },
      ];
    }

    const brandConfig = {
      brandName: config.brandName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl,
    };

    if (template.key === "single_hero") {
      const html = renderHtmlPreview(brandConfig, template.key, items);
      const itemId = items[0]?.id && items[0].id.length > 0 ? items[0].id : null;
      const [preview] = await db
        .insert(adPreviews)
        .values({
          customerId,
          templateConfigId: config.id,
          inventoryItemId: itemId,
          previewType: "html",
          htmlContent: html,
          meta: { templateKey: template.key, itemCount: 1 },
        })
        .returning();
      console.log(`[PREVIEW] Created single-hero preview ${preview?.id ?? "unknown"}`);
    } else if (template.key === "grid_4" || template.key === "carousel_3") {
      const html = renderHtmlPreview(brandConfig, template.key, items);
      const [preview] = await db
        .insert(adPreviews)
        .values({
          customerId,
          templateConfigId: config.id,
          inventoryItemId: null,
          previewType: "html",
          htmlContent: html,
          meta: { templateKey: template.key, itemCount: Math.min(items.length, template.key === "grid_4" ? 4 : 3) },
        })
        .returning();
      console.log(`[PREVIEW] Created ${template.key} preview ${preview?.id ?? "unknown"}`);
    } else {
      const html = renderHtmlPreview(brandConfig, template.key, items);
      await db.insert(adPreviews).values({
        customerId,
        templateConfigId: config.id,
        inventoryItemId: null,
        previewType: "html",
        htmlContent: html,
        meta: { templateKey: template.key },
      });
    }

    await db
      .update(previewRuns)
      .set({ status: "success", finishedAt: new Date() })
      .where(and(eq(previewRuns.id, runId), eq(previewRuns.customerId, customerId)));

    if (config.status !== "approved") {
      await db
        .update(adTemplateConfigs)
        .set({ status: "preview_ready", updatedAt: new Date() })
        .where(eq(adTemplateConfigs.id, config.id));
    }

    console.log(JSON.stringify({ event: "preview_job_finish", runId, customerId, status: "success" }));
    await job.ack();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: "preview_job_finish", runId, customerId, status: "failed", errorMessage: message }));
    await db
      .update(previewRuns)
      .set({
        status: "failed",
        finishedAt: new Date(),
        errorMessage: message,
      })
      .where(and(eq(previewRuns.id, runId), eq(previewRuns.customerId, customerId)));
    await job.retry();
  }
}
