import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../lib/db.js";
import { metaConnections, sessions } from "@repo/db/schema";
import { signOAuthState, verifyOAuthState } from "../lib/metaOAuth.js";

function getWebUrl(): string {
  return process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
}

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
      tokenExpiresAt: connection.tokenExpiresAt?.toISOString() ?? null,
    });
  });

  // GET /meta/oauth/connect-url - get OAuth authorization URL
  app.get("/meta/oauth/connect-url", async (request, reply) => {
    const customerId = request.customer.customerId;
    const appId = process.env["META_APP_ID"];
    const redirectUri = process.env["META_REDIRECT_URL"];
    const scopes = process.env["META_OAUTH_SCOPES"] ?? "ads_read,business_management";
    const graphVersion = process.env["META_GRAPH_VERSION"] ?? "v21.0";

    if (!appId || !redirectUri) {
      return reply.status(400).send({
        error: "CONFIG_ERROR",
        message: "Meta OAuth not configured",
        hint: "Set META_APP_ID and META_REDIRECT_URL environment variables",
      });
    }

    const state = signOAuthState(customerId);
    const authUrl = new URL(`https://www.facebook.com/${graphVersion}/dialog/oauth`);
    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("response_type", "code");

    return reply.send({ url: authUrl.toString() });
  });

  // GET /meta/oauth/callback - handle OAuth callback from Meta
  app.get("/meta/oauth/callback", async (request, reply) => {
    const query = request.query as {
      code?: string;
      state?: string;
      error?: string;
      error_reason?: string;
      error_description?: string;
    };

    // Verify state first
    if (!query.state) {
      return reply.redirect(`${getWebUrl()}/settings?meta=error&error=missing_state`);
    }

    const stateData = verifyOAuthState(query.state);
    if (!stateData) {
      return reply.redirect(`${getWebUrl()}/settings?meta=error&error=invalid_state`);
    }

    const customerId = stateData.customerId;

    // Verify session exists and matches customerId from state
    const sessionId = request.cookies.session;
    if (!sessionId) {
      return reply.redirect(`${getWebUrl()}/login?error=session_expired`);
    }

    const [session] = await db
      .select({ customerId: sessions.customerId })
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!session || session.customerId !== customerId) {
      return reply.redirect(`${getWebUrl()}/login?error=session_mismatch`);
    }

    // Handle Meta OAuth errors
    if (query.error) {
      await db
        .insert(metaConnections)
        .values({
          customerId,
          status: "error",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: metaConnections.customerId,
          set: {
            status: "error",
            updatedAt: new Date(),
          },
        });

      const errorMsg = encodeURIComponent(query.error_description || query.error_reason || query.error);
      return reply.redirect(`${getWebUrl()}/settings?meta=error&error=${errorMsg}`);
    }

    // Exchange code for access token
    if (!query.code) {
      return reply.redirect(`${getWebUrl()}/settings?meta=error&error=missing_code`);
    }

    const appId = process.env["META_APP_ID"];
    const appSecret = process.env["META_APP_SECRET"];
    const redirectUri = process.env["META_REDIRECT_URL"];
    const graphVersion = process.env["META_GRAPH_VERSION"] ?? "v21.0";
    const scopes = (process.env["META_OAUTH_SCOPES"] ?? "ads_read,business_management").split(",");

    if (!appId || !appSecret || !redirectUri) {
      request.log.error("Meta OAuth not configured");
      return reply.redirect(`${getWebUrl()}/settings?meta=error&error=oauth_not_configured`);
    }

    try {
      // Exchange code for access token
      const tokenUrl = new URL(`https://graph.facebook.com/${graphVersion}/oauth/access_token`);
      tokenUrl.searchParams.set("client_id", appId);
      tokenUrl.searchParams.set("redirect_uri", redirectUri);
      tokenUrl.searchParams.set("client_secret", appSecret);
      tokenUrl.searchParams.set("code", query.code);

      const tokenRes = await fetch(tokenUrl.toString());
      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        request.log.error({ status: tokenRes.status, error: errorText }, "Meta token exchange failed");
        return reply.redirect(`${getWebUrl()}/settings?meta=error&error=token_exchange_failed`);
      }

      const tokenData = (await tokenRes.json()) as {
        access_token?: string;
        token_type?: string;
        expires_in?: number;
        error?: { message: string; type: string; code: number };
      };

      if (tokenData.error || !tokenData.access_token) {
        const errorMsg = tokenData.error?.message || "Failed to get access token";
        request.log.error({ error: tokenData.error }, "Meta token exchange error");
        return reply.redirect(`${getWebUrl()}/settings?meta=error&error=${encodeURIComponent(errorMsg)}`);
      }

      const accessToken = tokenData.access_token;
      const expiresIn = tokenData.expires_in ?? 5184000; // Default 60 days if not provided
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

      // Fetch user ID
      const meUrl = new URL(`https://graph.facebook.com/${graphVersion}/me`);
      meUrl.searchParams.set("fields", "id");
      meUrl.searchParams.set("access_token", accessToken);

      const meRes = await fetch(meUrl.toString());
      if (!meRes.ok) {
        request.log.error({ status: meRes.status }, "Failed to fetch Meta user ID");
        return reply.redirect(`${getWebUrl()}/settings?meta=error&error=failed_to_fetch_user`);
      }

      const meData = (await meRes.json()) as { id?: string; error?: { message: string } };
      if (meData.error || !meData.id) {
        const errorMsg = meData.error?.message || "Failed to get user ID";
        request.log.error({ error: meData.error }, "Meta user ID error");
        return reply.redirect(`${getWebUrl()}/settings?meta=error&error=${encodeURIComponent(errorMsg)}`);
      }

      const metaUserId = meData.id;

      // Optionally fetch ad accounts (first one only for MVP)
      let adAccountId: string | null = null;
      try {
        const adAccountsUrl = new URL(`https://graph.facebook.com/${graphVersion}/me/adaccounts`);
        adAccountsUrl.searchParams.set("fields", "id,name,account_status");
        adAccountsUrl.searchParams.set("limit", "25");
        adAccountsUrl.searchParams.set("access_token", accessToken);

        const adAccountsRes = await fetch(adAccountsUrl.toString());
        if (adAccountsRes.ok) {
          const adAccountsData = (await adAccountsRes.json()) as {
            data?: Array<{ id: string; name?: string; account_status?: number }>;
            error?: { message: string };
          };
          if (adAccountsData.data && adAccountsData.data.length > 0 && adAccountsData.data[0]) {
            adAccountId = adAccountsData.data[0].id;
          }
        }
      } catch (adAccountErr) {
        request.log.warn({ err: adAccountErr }, "Failed to fetch ad accounts, continuing without");
      }

      // Upsert meta_connections
      const now = new Date();
      await db
        .insert(metaConnections)
        .values({
          customerId,
          status: "connected",
          metaUserId,
          accessToken, // TODO: Encrypt at rest in production
          tokenExpiresAt,
          scopes,
          adAccountId,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: metaConnections.customerId,
          set: {
            status: "connected",
            metaUserId,
            accessToken, // TODO: Encrypt at rest in production
            tokenExpiresAt,
            scopes,
            adAccountId,
            updatedAt: now,
          },
        });

      // Redact token from logs
      request.log.info(
        { customerId, metaUserId, adAccountId, hasToken: !!accessToken },
        "Meta OAuth connection successful"
      );

      return reply.redirect(`${getWebUrl()}/settings?meta=connected`);
    } catch (err) {
      request.log.error({ err }, "Meta OAuth callback error");
      return reply.redirect(`${getWebUrl()}/settings?meta=error&error=internal_error`);
    }
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

      if (!updated) {
        return reply.status(500).send({
          error: "INTERNAL",
          message: "Failed to update Meta connection",
        });
      }

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

    if (!created) {
      return reply.status(500).send({
        error: "INTERNAL",
        message: "Failed to create Meta connection",
      });
    }

    return reply.status(201).send({
      status: created.status,
      metaUserId: created.metaUserId,
      adAccountId: created.adAccountId,
      scopes: created.scopes,
    });
  });
}
