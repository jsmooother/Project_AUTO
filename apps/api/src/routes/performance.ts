import type { FastifyInstance } from "fastify";
import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import { metaConnections, metaAdObjects } from "@repo/db/schema";
import { metaGet, type MetaGraphError } from "../lib/metaGraph.js";
import { getEffectiveMetaAccessToken } from "../lib/metaAuth.js";

/**
 * Calculate date range from preset
 */
function getDateRange(preset: "last_7d" | "last_30d"): { since: string; until: string } {
  const until = new Date();
  const since = new Date();
  
  if (preset === "last_7d") {
    since.setDate(since.getDate() - 7);
  } else {
    since.setDate(since.getDate() - 30);
  }
  
  const sinceStr = since.toISOString().split("T")[0];
  const untilStr = until.toISOString().split("T")[0];
  
  if (!sinceStr || !untilStr) {
    throw new Error("Failed to generate date range");
  }
  
  return {
    since: sinceStr,
    until: untilStr,
  };
}

/**
 * Generate synthetic metrics for dev/sim mode (no spend data exposed to customers)
 */
function generateSyntheticMetrics(preset: "last_7d" | "last_30d") {
  const days = preset === "last_7d" ? 7 : 30;
  const byDay: Array<{ date: string; impressions: number; clicks: number }> = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    if (!dateStr) continue;
    byDay.push({
      date: dateStr,
      impressions: Math.round(Math.random() * 2000 + 500), // 500-2500
      clicks: Math.round(Math.random() * 50 + 5), // 5-55
    });
  }
  
  const totals = byDay.reduce(
    (acc, day) => ({
      impressions: acc.impressions + day.impressions,
      clicks: acc.clicks + day.clicks,
    }),
    { impressions: 0, clicks: 0 }
  );
  
  return {
    totals: {
      impressions: totals.impressions,
      reach: Math.round(totals.impressions * 0.8),
      clicks: totals.clicks,
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    },
    byDay,
  };
}

/**
 * Fetch insights from Meta Graph API (spend data excluded from customer response)
 * Uses correct Meta API format: time_range[since] and time_range[until] as separate params
 */
async function fetchMetaInsights(
  objectId: string,
  accessToken: string,
  preset: "last_7d" | "last_30d"
): Promise<{ totals: Record<string, number>; byDay: Array<Record<string, unknown>> }> {
  const dateRange = getDateRange(preset);
  
  // Meta API requires time_range[since] and time_range[until] as separate query params
  // Also use date_preset as fallback, but explicit time_range is more reliable
  const params: Record<string, string> = {
    fields: "impressions,reach,clicks,ctr",
    date_preset: preset,
    time_increment: "1",
    "time_range[since]": dateRange.since,
    "time_range[until]": dateRange.until,
  };
  
  const response = (await metaGet(`/${objectId}/insights`, accessToken, params)) as {
    data?: Array<Record<string, unknown>>;
  };
  
  const data = (response.data || []) as Array<Record<string, unknown>>;
  
  // Handle empty data (campaign paused, too new, etc.)
  if (!data || data.length === 0) {
    return {
      totals: {
        impressions: 0,
        reach: 0,
        clicks: 0,
        ctr: 0,
      },
      byDay: [],
    };
  }
  
  // Aggregate totals (spend calculated internally but not returned)
  let totalImpressions = 0;
  let totalReach = 0;
  let totalClicks = 0;
  
  for (const day of data) {
    totalImpressions += parseInt(String(day.impressions || 0), 10);
    totalReach += parseInt(String(day.reach || 0), 10);
    totalClicks += parseInt(String(day.clicks || 0), 10);
  }
  
  // Calculate CTR only (no spend-based metrics)
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  
  // Format byDay (no spend column)
  const byDay = data.map((day) => ({
    date: String(day.date_start || ""),
    impressions: parseInt(String(day.impressions || 0), 10),
    clicks: parseInt(String(day.clicks || 0), 10),
  }));
  
  return {
    totals: {
      impressions: totalImpressions,
      reach: totalReach,
      clicks: totalClicks,
      ctr: Math.round(ctr * 100) / 100,
    },
    byDay,
  };
}

export async function performanceRoutes(app: FastifyInstance): Promise<void> {
  /**
   * GET /performance/summary
   * Returns performance summary with totals and daily breakdown
   */
  app.get<{ Querystring: { preset?: "last_7d" | "last_30d" } }>("/performance/summary", async (request, reply) => {
    const customerId = request.customer.customerId;
    const preset = request.query.preset || "last_7d";
    const allowDevMeta = process.env["ALLOW_DEV_META"] === "true";
    
    // Load Meta connection and ad objects
    const [metaConn] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);
    
    const [objects] = await db
      .select()
      .from(metaAdObjects)
      .where(eq(metaAdObjects.customerId, customerId))
      .limit(1);

    const { token: effectiveToken, mode: tokenMode } = await getEffectiveMetaAccessToken(customerId);

    // Determine mode: sim = dev placeholder; real = system/test token + connection + campaign
    const isSim = allowDevMeta && tokenMode === "dev";
    const isReal =
      !!effectiveToken &&
      tokenMode !== "none" &&
      metaConn?.status === "connected" &&
      !!metaConn?.selectedAdAccountId &&
      !!objects?.campaignId;
    
    // Check prerequisites
    if (!metaConn) {
      return reply.status(200).send({
        mode: "disabled" as const,
        meta: { connected: false },
        objects: {},
        dateRange: { preset, ...getDateRange(preset) },
        totals: { impressions: 0, reach: 0, clicks: 0, ctr: 0 },
        byDay: [],
        hint: "Connect Meta account in Settings → Meta to view performance data.",
      });
    }
    
    if (!metaConn.selectedAdAccountId) {
      return reply.status(200).send({
        mode: "disabled" as const,
        meta: { connected: metaConn.status === "connected", selectedAdAccountId: undefined },
        objects: {},
        dateRange: { preset, ...getDateRange(preset) },
        totals: { impressions: 0, reach: 0, clicks: 0, ctr: 0 },
        byDay: [],
        hint: "Select an ad account in Settings → Meta.",
      });
    }
    
    if (!objects?.campaignId) {
      return reply.status(200).send({
        mode: isSim ? "sim" : "disabled" as const,
        meta: { connected: metaConn.status === "connected", selectedAdAccountId: metaConn.selectedAdAccountId },
        objects: {},
        dateRange: { preset, ...getDateRange(preset) },
        totals: { impressions: 0, reach: 0, clicks: 0, ctr: 0 },
        byDay: [],
        hint: "Publish a campaign from Ads page to start tracking performance.",
      });
    }
    
    // Sim mode: return synthetic data
    if (isSim) {
      const synthetic = generateSyntheticMetrics(preset);
      const dateRange = getDateRange(preset);
      
      return reply.status(200).send({
        mode: "sim" as const,
        meta: { connected: true, selectedAdAccountId: metaConn.selectedAdAccountId },
        objects: {
          campaignId: objects.campaignId,
          adsetId: objects.adsetId || undefined,
          adId: objects.adId || undefined,
        },
        dateRange: { preset, ...dateRange },
        ...synthetic,
        hint: "Dev/sim mode — showing synthetic metrics. Not real Meta spend.",
        // Debug info for troubleshooting
        _debug: {
          adAccountId: metaConn.selectedAdAccountId || null,
          campaignId: objects.campaignId || null,
          graphVersion: process.env["META_GRAPH_VERSION"] || "v21.0",
          hasData: synthetic.byDay.length > 0,
        },
      });
    }
    
    // Real mode: fetch from Meta
    if (!isReal) {
      return reply.status(200).send({
        mode: "disabled" as const,
        meta: { connected: metaConn.status === "connected", selectedAdAccountId: metaConn.selectedAdAccountId },
        objects: {
          campaignId: objects.campaignId,
          adsetId: objects.adsetId || undefined,
          adId: objects.adId || undefined,
        },
        dateRange: { preset, ...getDateRange(preset) },
        totals: { impressions: 0, reach: 0, clicks: 0, ctr: 0 },
        byDay: [],
        hint: "Meta connection not fully configured. Reconnect Meta in Settings.",
      });
    }
    
    try {
      if (!effectiveToken) {
        throw new Error("Access token missing");
      }
      const insights = await fetchMetaInsights(objects.campaignId, effectiveToken, preset);
      
      const dateRange = getDateRange(preset);
      
      return reply.status(200).send({
        mode: "real" as const,
        meta: { connected: true, selectedAdAccountId: metaConn.selectedAdAccountId },
        objects: {
          campaignId: objects.campaignId,
          adsetId: objects.adsetId || undefined,
          adId: objects.adId || undefined,
        },
        dateRange: { preset, ...dateRange },
        ...insights,
        // Debug info for troubleshooting
        _debug: {
          adAccountId: metaConn.selectedAdAccountId || null,
          campaignId: objects.campaignId || null,
          graphVersion: process.env["META_GRAPH_VERSION"] || "v21.0",
          hasData: insights.byDay.length > 0,
        },
      });
    } catch (err) {
      const metaErr = err as MetaGraphError;
      
      // Handle OAuth/token errors specifically
      if (metaErr.code === 190 || (metaErr.message && metaErr.message.toLowerCase().includes("oauth"))) {
        // Clear selected ad account to force re-setup
        await db
          .update(metaConnections)
          .set({ selectedAdAccountId: null, status: "disconnected" })
          .where(eq(metaConnections.customerId, customerId));
        
        return reply.status(401).send({
          error: {
            code: "OAUTH_EXCEPTION",
            message: "Meta access token is invalid or expired",
            hint: "Reconnect Meta account in Settings → Meta. Your ad account selection has been cleared.",
          },
        });
      }
      
      return reply.status(500).send({
        error: {
          code: "META_API_ERROR",
          message: metaErr.message,
          hint: metaErr.hint,
        },
      });
    }
  });
  
  /**
   * GET /performance/insights?level=campaign|adset|ad&preset=last_7d|last_30d
   * Fetches insights for a specific level (campaign, adset, or ad)
   */
  app.get<{ Querystring: { level?: "campaign" | "adset" | "ad"; preset?: "last_7d" | "last_30d" } }>(
    "/performance/insights",
    async (request, reply) => {
      const customerId = request.customer.customerId;
      const level = request.query.level || "campaign";
      const preset = request.query.preset || "last_7d";
      const allowDevMeta = process.env["ALLOW_DEV_META"] === "true";
      
      // Load Meta connection and ad objects
      const [metaConn] = await db
        .select()
        .from(metaConnections)
        .where(eq(metaConnections.customerId, customerId))
        .limit(1);
      
      const [objects] = await db
        .select()
        .from(metaAdObjects)
        .where(eq(metaAdObjects.customerId, customerId))
        .limit(1);

      const { token: effectiveToken, mode: tokenMode } = await getEffectiveMetaAccessToken(customerId);

      // Check prerequisites: connection + selected ad account + effective token (or sim)
      if (!metaConn || metaConn.status !== "connected" || !metaConn.selectedAdAccountId) {
        return reply.status(400).send({
          error: {
            code: "MISSING_PREREQUISITE",
            message: "Meta account not connected or ad account not selected",
            hint: "Connect Meta account and select an ad account in Settings → Meta.",
          },
        });
      }

      // Determine object ID based on level
      let objectId: string | null = null;
      if (level === "campaign" && objects?.campaignId) {
        objectId = objects.campaignId;
      } else if (level === "adset" && objects?.adsetId) {
        objectId = objects.adsetId;
      } else if (level === "ad" && objects?.adId) {
        objectId = objects.adId;
      }

      if (!objectId) {
        return reply.status(400).send({
          error: {
            code: "MISSING_PREREQUISITE",
            message: `${level} not found`,
            hint: level === "campaign" ? "Publish a campaign from Ads page first." : `Campaign must be published with ${level} created.`,
          },
        });
      }

      const isSim = allowDevMeta && (tokenMode === "dev" || objectId.startsWith("dev-"));

      if (isSim) {
        const synthetic = generateSyntheticMetrics(preset);
        return reply.status(200).send({
          mode: "sim",
          level,
          objectId,
          dateRange: getDateRange(preset),
          ...synthetic,
          hint: "Dev/sim mode — showing synthetic metrics.",
        });
      }

      if (!effectiveToken || tokenMode === "none") {
        return reply.status(400).send({
          error: {
            code: "MISSING_PREREQUISITE",
            message: "Meta system user token not configured",
            hint: "Configure META_SYSTEM_USER_ACCESS_TOKEN and grant partner access in Settings → Meta.",
          },
        });
      }

      // Real mode: fetch from Meta
      try {
        const insights = await fetchMetaInsights(objectId, effectiveToken, preset);
        const dateRange = getDateRange(preset);
        
        return reply.status(200).send({
          mode: "real",
          level,
          objectId,
          dateRange: { preset, ...dateRange },
          ...insights,
          _debug: {
            adAccountId: metaConn.selectedAdAccountId || null,
            graphVersion: process.env["META_GRAPH_VERSION"] || "v21.0",
            hasData: insights.byDay.length > 0,
          },
        });
      } catch (err) {
        const metaErr = err as MetaGraphError;
        
        // Handle OAuth/token errors specifically
        if (metaErr.code === 190 || (metaErr.message && metaErr.message.toLowerCase().includes("oauth"))) {
          await db
            .update(metaConnections)
            .set({ selectedAdAccountId: null, status: "disconnected" })
            .where(eq(metaConnections.customerId, customerId));
          
          return reply.status(401).send({
            error: {
              code: "OAUTH_EXCEPTION",
              message: "Meta access token is invalid or expired",
              hint: "Reconnect Meta account in Settings → Meta. Your ad account selection has been cleared.",
            },
          });
        }
        
        return reply.status(500).send({
          error: {
            code: "META_API_ERROR",
            message: metaErr.message,
            hint: metaErr.hint,
          },
        });
      }
    }
  );
}
