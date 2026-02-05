import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../lib/db.js";
import { metaConnections, sessions } from "@repo/db/schema";
import { signOAuthState, verifyOAuthState } from "../lib/metaOAuth.js";
import { fetchMeta, type MetaGraphError } from "../lib/metaGraph.js";
import { getEffectiveMetaAccessToken, getSystemUserAccessToken } from "../lib/metaAuth.js";
import { resolveEffectiveAdAccountId, maskAdAccountId } from "../lib/metaAdAccount.js";

function getWebUrl(): string {
  return process.env["NEXT_PUBLIC_APP_URL"] ?? "http://localhost:3000";
}

const devConnectBody = z.object({
  metaUserId: z.string().optional(),
  adAccountId: z.string().optional(),
  scopes: z.array(z.string()).optional(),
});

const sandboxConnectBody = z.object({
  customerId: z.string().uuid("customerId must be a valid UUID"),
  accessToken: z.string().min(1, "Access token is required"),
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

    const systemUserConfigured = !!getSystemUserAccessToken();
    const metaPartnerName = process.env["META_PARTNER_NAME"] ?? "Project Auto";
    const rawBmId = process.env["META_BUSINESS_MANAGER_ID"];
    const metaBusinessManagerId = rawBmId ? (rawBmId.length > 8 ? `****${rawBmId.slice(-4)}` : "****") : null;

    if (!connection) {
      return reply.send({
        status: "disconnected",
        metaUserId: null,
        adAccountId: null,
        scopes: null,
        selectedAdAccountId: null,
        partnerAccessStatus: "pending",
        partnerAccessCheckedAt: null,
        partnerAccessError: null,
        systemUserConfigured,
        metaPartnerName,
        metaBusinessManagerId,
      });
    }

    return reply.send({
      status: connection.status,
      metaUserId: connection.metaUserId ?? null,
      adAccountId: connection.adAccountId ?? null,
      scopes: connection.scopes ?? null,
      tokenExpiresAt: connection.tokenExpiresAt?.toISOString() ?? null,
      selectedAdAccountId: connection.selectedAdAccountId ?? null,
      partnerAccessStatus: connection.partnerAccessStatus ?? "pending",
      partnerAccessCheckedAt: connection.partnerAccessCheckedAt?.toISOString() ?? null,
      partnerAccessError: connection.partnerAccessError ?? null,
      systemUserConfigured,
      metaPartnerName,
      metaBusinessManagerId,
    });
  });

  // GET /meta/permissions/check - verify system user can access customer's selected ad account
  app.get("/meta/permissions/check", async (request, reply) => {
    const customerId = request.customer.customerId;
    const now = new Date();

    const [connection] = await db
      .select({
        selectedAdAccountId: metaConnections.selectedAdAccountId,
      })
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    const selectedAdAccountId = connection?.selectedAdAccountId ?? null;
    const { effectiveId: adAccountId } = resolveEffectiveAdAccountId({
      customerId,
      selectedAdAccountId,
    });

    if (!adAccountId) {
      return reply.send({
        ok: false,
        status: "missing_ad_account",
        hint: "Select an ad account in Settings.",
      });
    }

    const { token, mode } = await getEffectiveMetaAccessToken(customerId);
    if (!token || mode === "none") {
      return reply.send({
        ok: false,
        status: "not_configured",
        hint: "Meta system user token not configured on server.",
        debug: { adAccountIdMasked: maskAdAccountId(adAccountId), mode },
      });
    }

    try {
      const path = `/${adAccountId}`;
      const data = (await fetchMeta(path, token, {
        fields: "id,name,account_status,currency",
      })) as { id?: string; name?: string; account_status?: number; currency?: string };

      if (data?.id) {
        await db
          .update(metaConnections)
          .set({
            partnerAccessStatus: "verified",
            partnerAccessCheckedAt: now,
            partnerAccessError: null,
            updatedAt: now,
          })
          .where(eq(metaConnections.customerId, customerId));

        return reply.send({
          ok: true,
          status: "verified",
          checkedAt: now.toISOString(),
          debug: { adAccountIdMasked: maskAdAccountId(adAccountId), mode },
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const hint =
        err && typeof err === "object" && "hint" in err && typeof (err as { hint: string }).hint === "string"
          ? (err as { hint: string }).hint
          : "Add Project Auto as a partner to your Meta Business Manager and grant access to this ad account.";

      await db
        .update(metaConnections)
        .set({
          partnerAccessStatus: "failed",
          partnerAccessCheckedAt: now,
          partnerAccessError: message.slice(0, 500),
          updatedAt: now,
        })
        .where(eq(metaConnections.customerId, customerId));

      return reply.send({
        ok: false,
        status: "failed",
        hint,
        checkedAt: now.toISOString(),
        debug: { adAccountIdMasked: maskAdAccountId(adAccountId), mode },
      });
    }

    await db
      .update(metaConnections)
      .set({
        partnerAccessStatus: "pending",
        partnerAccessCheckedAt: now,
        partnerAccessError: "Unexpected response",
        updatedAt: now,
      })
      .where(eq(metaConnections.customerId, customerId));

    return reply.send({
      ok: false,
      status: "pending",
      hint: "Could not verify access. Try again.",
      checkedAt: now.toISOString(),
      debug: { adAccountIdMasked: maskAdAccountId(adAccountId), mode },
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

  // POST /meta/sandbox-connect - DEV ONLY: connect with sandbox access token
  app.post("/meta/sandbox-connect", async (request, reply) => {
    if (process.env["NODE_ENV"] !== "development" && process.env["ALLOW_INSECURE_ADMIN"] !== "true") {
      return reply.status(403).send({
        error: "FORBIDDEN",
        message: "Sandbox connect is only available in development",
      });
    }

    const parsed = sandboxConnectBody.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: parsed.error.errors[0]?.message ?? parsed.error.message,
        issues: parsed.error.issues,
      });
    }

    const { customerId, accessToken, metaUserId, adAccountId, scopes } = parsed.data;
    const now = new Date();

    try {
      // Verify token works by fetching /me
      const meData = (await fetchMeta("/me", accessToken, {
        fields: "id,name",
      })) as { id?: string; name?: string };

      const verifiedMetaUserId = metaUserId || meData.id || "sandbox-user";
      const verifiedScopes = scopes || ["ads_management", "business_management"];

      // Fetch ad accounts to verify token has access
      let adAccounts: Array<{ id: string; name?: string }> = [];
      try {
        const adAccountsData = (await fetchMeta("/me/adaccounts", accessToken, {
          fields: "id,name,account_status",
        })) as { data?: Array<{ id: string; name?: string }> };
        adAccounts = adAccountsData.data || [];
      } catch (err) {
        request.log.warn({ err }, "Could not fetch ad accounts, continuing anyway");
      }

      // Use provided adAccountId if it's in the list; else use first from list
      const providedId = adAccountId?.trim() || null;
      const normalizedProvided = providedId && !providedId.startsWith("act_") ? `act_${providedId}` : providedId;
      const inList = adAccounts.some((a) => a.id === normalizedProvided || a.id === providedId);
      const verifiedAdAccountId = inList && normalizedProvided ? normalizedProvided : adAccounts[0]?.id ?? null;
      const selectedAdAccountId = verifiedAdAccountId;

      await db
        .insert(metaConnections)
        .values({
          customerId,
          status: "connected",
          metaUserId: verifiedMetaUserId,
          accessToken,
          tokenExpiresAt: null, // Sandbox tokens may not expire, or expire far in future
          scopes: verifiedScopes,
          adAccountId: verifiedAdAccountId,
          selectedAdAccountId,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: metaConnections.customerId,
          set: {
            status: "connected",
            metaUserId: verifiedMetaUserId,
            accessToken,
            tokenExpiresAt: null,
            scopes: verifiedScopes,
            adAccountId: verifiedAdAccountId,
            selectedAdAccountId,
            updatedAt: now,
          },
        });

      request.log.info(
        { customerId, metaUserId: verifiedMetaUserId, adAccountCount: adAccounts.length },
        "Sandbox Meta connection successful"
      );

      return reply.send({
        status: "connected",
        metaUserId: verifiedMetaUserId,
        adAccountId: verifiedAdAccountId,
        scopes: verifiedScopes,
        adAccounts: adAccounts.map((acc) => ({ id: acc.id, name: acc.name })),
      });
    } catch (err) {
      const metaErr = err as MetaGraphError;
      request.log.error({ err: metaErr }, "Sandbox connect failed");
      return reply.status(400).send({
        error: "META_API_ERROR",
        message: metaErr.message || "Failed to verify access token",
        hint: metaErr.hint || "Check that your access token is valid and has required permissions",
      });
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

  // GET /meta/debug/smoke - smoke test Meta connection (read-only)
  app.get("/meta/debug/smoke", async (request, reply) => {
    const customerId = request.customer.customerId;

    // Load meta_connections row
    const [connection] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    if (!connection) {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: "No Meta connection found",
        hint: "Connect your Meta account in Settings first.",
      });
    }

    // Validate status and access token
    if (connection.status !== "connected") {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: `Meta connection status is "${connection.status}", expected "connected"`,
        hint: "Reconnect Meta in Settings.",
      });
    }

    if (!connection.accessToken) {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: "Meta access token is missing",
        hint: "Reconnect Meta in Settings to refresh your token.",
      });
    }

    const accessToken = connection.accessToken;

    // Skip smoke test for dev tokens
    if (accessToken === "dev-token-placeholder") {
      return reply.send({
        ok: true,
        me: { id: connection.metaUserId ?? "dev-user", name: "Dev User" },
        adAccounts: connection.adAccountId
          ? [{ id: connection.adAccountId, name: "Dev Account", account_status: 1, currency: "USD" }]
          : [],
        hint: "Dev mode: using placeholder data. Use real OAuth for actual API testing.",
      });
    }

    try {
      // Call Meta Graph API: GET /me?fields=id,name
      const meData = (await fetchMeta("/me", accessToken, {
        fields: "id,name",
      }, { timeout: 10000 })) as { id?: string; name?: string; error?: unknown };

      if (!meData.id) {
        return reply.status(500).send({
          error: "CONFIG_ERROR",
          message: "Meta API returned invalid user data",
          hint: "Reconnect Meta in Settings.",
        });
      }

      // Call Meta Graph API: GET /me/adaccounts?fields=id,name,account_status,currency
      let adAccounts: Array<{ id: string; name?: string; account_status?: number; currency?: string }> = [];
      try {
        const adAccountsData = (await fetchMeta("/me/adaccounts", accessToken, {
          fields: "id,name,account_status,currency",
        }, { timeout: 10000 })) as {
          data?: Array<{ id: string; name?: string; account_status?: number; currency?: string }>;
          error?: unknown;
        };

        if (adAccountsData.data && Array.isArray(adAccountsData.data)) {
          adAccounts = adAccountsData.data;
        }
      } catch (adAccountsErr) {
        // If ad accounts fetch fails, still return me data but note the issue
        request.log.warn({ err: adAccountsErr }, "Failed to fetch ad accounts in smoke test");
        return reply.send({
          ok: true,
          me: { id: meData.id, name: meData.name ?? null },
          adAccounts: [],
          hint: "User data retrieved, but ad accounts fetch failed. Check permissions.",
        });
      }

      return reply.send({
        ok: true,
        me: { id: meData.id, name: meData.name ?? null },
        adAccounts,
      });
    } catch (err) {
      // Handle MetaGraphError
      if (err && typeof err === "object" && "message" in err && "hint" in err) {
        const metaErr = err as MetaGraphError;
        request.log.warn({ err: metaErr }, "Meta smoke test failed");
        return reply.status(400).send({
          error: "CONFIG_ERROR",
          message: metaErr.message,
          hint: metaErr.hint,
        });
      }

      // Handle unexpected errors
      request.log.error({ err }, "Unexpected error in Meta smoke test");
      return reply.status(500).send({
        error: "CONFIG_ERROR",
        message: "Failed to call Meta API",
        hint: "Check your Meta access token and network connection. Reconnect Meta in Settings if the issue persists.",
      });
    }
  });

  // GET /meta/ad-accounts - list available ad accounts from Meta
  app.get("/meta/ad-accounts", async (request, reply) => {
    const customerId = request.customer.customerId;

    // Load meta_connections row
    const [connection] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    if (!connection) {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: "No Meta connection found",
        hint: "Connect your Meta account in Settings first.",
      });
    }

    if (connection.status !== "connected") {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: `Meta connection status is "${connection.status}", expected "connected"`,
        hint: "Reconnect Meta in Settings.",
      });
    }

    if (!connection.accessToken) {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: "Meta access token is missing",
        hint: "Reconnect Meta in Settings to refresh your token.",
      });
    }

    const accessToken = connection.accessToken;

    // Return placeholder for dev tokens
    if (accessToken === "dev-token-placeholder") {
      return reply.send({
        data: connection.adAccountId
          ? [
              {
                id: connection.adAccountId,
                name: "Dev Ad Account",
                account_status: 1,
                currency: "USD",
              },
            ]
          : [],
      });
    }

    try {
      // Call Meta Graph API: GET /me/adaccounts?fields=id,name,account_status,currency
      const adAccountsData = (await fetchMeta("/me/adaccounts", accessToken, {
        fields: "id,name,account_status,currency",
      }, { timeout: 10000 })) as {
        data?: Array<{ id: string; name?: string; account_status?: number; currency?: string }>;
        error?: unknown;
      };

      if (adAccountsData.error) {
        const metaErr = adAccountsData.error as { message?: string };
        return reply.status(400).send({
          error: "CONFIG_ERROR",
          message: metaErr.message ?? "Failed to fetch ad accounts from Meta",
          hint: "Check your Meta access token and permissions. Reconnect Meta in Settings if the issue persists.",
        });
      }

      const accounts = adAccountsData.data ?? [];

      return reply.send({
        data: accounts,
      });
    } catch (err) {
      // Handle MetaGraphError
      if (err && typeof err === "object" && "message" in err && "hint" in err) {
        const metaErr = err as MetaGraphError;
        request.log.warn({ err: metaErr }, "Failed to fetch ad accounts");
        return reply.status(400).send({
          error: "CONFIG_ERROR",
          message: metaErr.message,
          hint: metaErr.hint,
        });
      }

      // Handle unexpected errors
      request.log.error({ err }, "Unexpected error fetching ad accounts");
      return reply.status(500).send({
        error: "CONFIG_ERROR",
        message: "Failed to call Meta API",
        hint: "Check your Meta access token and network connection. Reconnect Meta in Settings if the issue persists.",
      });
    }
  });

  // POST /meta/ad-accounts/select - select an ad account
  app.post("/meta/ad-accounts/select", async (request, reply) => {
    const customerId = request.customer.customerId;
    const body = request.body as { adAccountId?: string };

    if (!body.adAccountId || typeof body.adAccountId !== "string") {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "adAccountId is required",
        issues: [{ path: ["adAccountId"], message: "adAccountId must be a non-empty string" }],
      });
    }

    const adAccountId = body.adAccountId.trim();
    if (!adAccountId) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "adAccountId cannot be empty",
        issues: [{ path: ["adAccountId"], message: "adAccountId cannot be empty" }],
      });
    }

    // Load meta_connections row
    const [connection] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    if (!connection) {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: "No Meta connection found",
        hint: "Connect your Meta account in Settings first.",
      });
    }

    if (connection.status !== "connected") {
      return reply.status(400).send({
        error: "MISSING_PREREQUISITE",
        message: `Meta connection status is "${connection.status}", expected "connected"`,
        hint: "Reconnect Meta in Settings.",
      });
    }

    // Validate that the ad account exists in Meta (unless dev mode)
    if (connection.accessToken && connection.accessToken !== "dev-token-placeholder") {
      try {
        const adAccountsData = (await fetchMeta("/me/adaccounts", connection.accessToken, {
          fields: "id,name,account_status,currency",
        }, { timeout: 10000 })) as {
          data?: Array<{ id: string }>;
          error?: unknown;
        };

        if (adAccountsData.error) {
          const metaErr = adAccountsData.error as { message?: string };
          return reply.status(400).send({
            error: "CONFIG_ERROR",
            message: metaErr.message ?? "Failed to validate ad account",
            hint: "Check your Meta access token. Reconnect Meta in Settings if the issue persists.",
          });
        }

        const accounts = adAccountsData.data ?? [];
        const accountExists = accounts.some((acc) => acc.id === adAccountId);

        if (!accountExists) {
          return reply.status(400).send({
            error: "VALIDATION_ERROR",
            message: `Ad account "${adAccountId}" not found in your Meta account`,
            hint: "Select an ad account from the list of available accounts.",
          });
        }
      } catch (err) {
        // Handle MetaGraphError
        if (err && typeof err === "object" && "message" in err && "hint" in err) {
          const metaErr = err as MetaGraphError;
          request.log.warn({ err: metaErr }, "Failed to validate ad account");
          return reply.status(400).send({
            error: "CONFIG_ERROR",
            message: metaErr.message,
            hint: metaErr.hint,
          });
        }

        request.log.error({ err }, "Unexpected error validating ad account");
        return reply.status(500).send({
          error: "CONFIG_ERROR",
          message: "Failed to validate ad account with Meta API",
          hint: "Check your Meta access token and network connection. Reconnect Meta in Settings if the issue persists.",
        });
      }
    }

    // Update selected_ad_account_id and reset partner verification (new account = re-verify)
    const [updated] = await db
      .update(metaConnections)
      .set({
        selectedAdAccountId: adAccountId,
        partnerAccessStatus: "pending",
        partnerAccessCheckedAt: null,
        partnerAccessError: null,
        updatedAt: new Date(),
      })
      .where(eq(metaConnections.customerId, customerId))
      .returning();

    if (!updated) {
      return reply.status(500).send({
        error: "INTERNAL",
        message: "Failed to update selected ad account",
      });
    }

    // Return updated status shape
    return reply.send({
      status: updated.status,
      metaUserId: updated.metaUserId ?? null,
      adAccountId: updated.adAccountId ?? null,
      scopes: updated.scopes ?? null,
      tokenExpiresAt: updated.tokenExpiresAt?.toISOString() ?? null,
      selectedAdAccountId: updated.selectedAdAccountId ?? null,
      partnerAccessStatus: updated.partnerAccessStatus ?? "pending",
      partnerAccessCheckedAt: updated.partnerAccessCheckedAt?.toISOString() ?? null,
      partnerAccessError: updated.partnerAccessError ?? null,
    });
  });
}
