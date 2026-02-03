import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { metaConnections } from "@repo/db/schema";

const devConnectBody = z.object({
  metaUserId: z.string().optional(),
  adAccountId: z.string().optional(),
  scopes: z.array(z.string()).optional(),
});

export async function metaRoutes(app: FastifyInstance): Promise<void> {
  // GET /meta/status - get current Meta connection status
  app.get("/meta/status", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [connection] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    if (!connection) {
      return reply.send({
        status: "disconnected",
        metaUserId: null,
        adAccountId: null,
        scopes: null,
      });
    }

    return reply.send({
      status: connection.status,
      metaUserId: connection.metaUserId ?? null,
      adAccountId: connection.adAccountId ?? null,
      scopes: connection.scopes ?? null,
    });
  });

  // POST /meta/disconnect - disconnect Meta account
  app.post("/meta/disconnect", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [existing] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    if (!existing) {
      return reply.status(400).send({
        error: "CONFIG_ERROR",
        message: "No Meta connection found to disconnect",
      });
    }

    await db
      .update(metaConnections)
      .set({
        status: "disconnected",
        metaUserId: null,
        accessToken: null,
        tokenExpiresAt: null,
        scopes: null,
        adAccountId: null,
        updatedAt: new Date(),
      })
      .where(eq(metaConnections.customerId, customerId));

    return reply.send({ success: true });
  });

  // POST /meta/dev-connect - DEV ONLY: fake connect for testing
  app.post("/meta/dev-connect", async (request, reply) => {
    const allowDevMeta = process.env["ALLOW_DEV_META"] === "true";
    if (!allowDevMeta) {
      return reply.status(403).send({
        error: "CONFIG_ERROR",
        message: "Dev Meta connect is disabled. Set ALLOW_DEV_META=true to enable.",
      });
    }

    const customerId = request.customer.customerId;
    const parsed = devConnectBody.safeParse(request.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? parsed.error.message;
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: String(message),
        issues: parsed.error.issues,
      });
    }

    const [existing] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

    if (existing) {
      const [updated] = await db
        .update(metaConnections)
        .set({
          status: "connected",
          metaUserId: parsed.data.metaUserId ?? existing.metaUserId ?? "dev-user-123",
          adAccountId: parsed.data.adAccountId ?? existing.adAccountId ?? "dev-account-123",
          scopes: parsed.data.scopes ?? existing.scopes ?? ["ads_management", "business_management"],
          accessToken: "dev-token-placeholder",
          tokenExpiresAt: expiresAt,
          updatedAt: now,
        })
        .where(eq(metaConnections.customerId, customerId))
        .returning();

      return reply.send({
        status: updated.status,
        metaUserId: updated.metaUserId,
        adAccountId: updated.adAccountId,
        scopes: updated.scopes,
      });
    }

    const [created] = await db
      .insert(metaConnections)
      .values({
        customerId,
        status: "connected",
        metaUserId: parsed.data.metaUserId ?? "dev-user-123",
        adAccountId: parsed.data.adAccountId ?? "dev-account-123",
        scopes: parsed.data.scopes ?? ["ads_management", "business_management"],
        accessToken: "dev-token-placeholder",
        tokenExpiresAt: expiresAt,
      })
      .returning();

    return reply.status(201).send({
      status: created.status,
      metaUserId: created.metaUserId,
      adAccountId: created.adAccountId,
      scopes: created.scopes,
    });
  });
}
