import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { db } from "../lib/db.js";
import { inventorySources, inventoryItems } from "@repo/db/schema";

const createSourceBody = z.object({
  websiteUrl: z.string().min(1, "Website URL is required"),
});

function normalizeWebsiteUrl(raw: string): { url: string } | { error: string; hint: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { error: "Website URL is required.", hint: "Enter a valid URL (e.g. https://example.com)." };
  }
  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        error: "Only http and https URLs are allowed.",
        hint: "Use a URL that starts with https:// or http://.",
      };
    }
    return { url: parsed.href };
  } catch {
    return {
      error: "Invalid URL format.",
      hint: "Enter a valid URL (e.g. https://example.com or example.com).",
    };
  }
}

export async function inventoryRoutes(app: FastifyInstance): Promise<void> {
  // POST /inventory/source - create or update single active source for customer
  app.post("/inventory/source", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = createSourceBody.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? parsed.error.message;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: String(message),
        issues: parsed.error.issues,
      });
    }

    const normalized = normalizeWebsiteUrl(parsed.data.websiteUrl);
    if ("error" in normalized) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: normalized.error,
        hint: normalized.hint,
      });
    }
    const websiteUrl = normalized.url;

    const [existing] = await db
      .select()
      .from(inventorySources)
      .where(eq(inventorySources.customerId, customerId))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(inventorySources)
        .set({
          websiteUrl,
          status: "active",
        })
        .where(eq(inventorySources.id, existing.id))
        .returning();
      return reply.status(200).send(updated);
    }

    const [created] = await db
      .insert(inventorySources)
      .values({
        customerId,
        websiteUrl,
        status: "active",
      })
      .returning();

    if (!created) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Insert failed" } });
    }
    return reply.status(201).send(created);
  });

  // GET /inventory/items - list inventory items for the active source
  app.get("/inventory/items", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [source] = await db
      .select()
      .from(inventorySources)
      .where(and(eq(inventorySources.customerId, customerId), eq(inventorySources.status, "active")))
      .limit(1);

    if (!source) {
      return reply.send({ data: [], source: null });
    }

    const items = await db
      .select()
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customerId),
          eq(inventoryItems.inventorySourceId, source.id)
        )
      )
      .orderBy(desc(inventoryItems.lastSeenAt));

    return reply.send({ data: items, source: { id: source.id, websiteUrl: source.websiteUrl } });
  });
}
