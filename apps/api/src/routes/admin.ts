import { createHash } from "crypto";
import type { FastifyInstance } from "fastify";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import { queue } from "../lib/queue.js";
import { JOB_TYPES } from "@repo/queue";
import { hashPassword } from "../lib/password.js";
import {
  customers,
  users,
  onboardingStates,
  crawlRuns,
  previewRuns,
  adRuns,
  inventorySources,
  inventoryItems,
  adTemplates,
  adTemplateConfigs,
  adPreviews,
  approvals,
  adSettings,
  metaAdObjects,
  metaConnections,
} from "@repo/db/schema";

const DEMO_PASSWORD = "demo-password";

function isDevOnly(reply: { status: (code: number) => { send: (body: unknown) => void } }): boolean {
  if (process.env["NODE_ENV"] !== "development") {
    reply.status(403).send({
      error: "FORBIDDEN",
      message: "Demo and reset actions are only available in NODE_ENV=development",
    });
    return false;
  }
  return true;
}

function stableExternalId(websiteUrl: string, index: number): string {
  const input = `${websiteUrl}\n${index}`;
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // POST /admin/demo/seed - create full demo customer (dev only)
  app.post("/admin/demo/seed", async (_request, reply) => {
    if (!isDevOnly(reply)) return;

    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const now = new Date();
    const email = `demo-${Date.now()}@demo.local`;

    const [customer] = await db
      .insert(customers)
      .values({ name: "Demo Customer", status: "active" })
      .returning({ id: customers.id });

    if (!customer) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create customer" } });
    }

    const [user] = await db
      .insert(users)
      .values({
        customerId: customer.id,
        email,
        role: "owner",
        passwordHash,
      })
      .returning({ id: users.id });

    if (!user) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create user" } });
    }

    await db.insert(onboardingStates).values({
      customerId: customer.id,
      companyInfoCompleted: true,
      budgetInfoCompleted: true,
      companyName: "Demo Company",
      companyWebsite: "https://demo.example.com",
      monthlyBudgetAmount: "1000",
      budgetCurrency: "USD",
    });

    const [source] = await db
      .insert(inventorySources)
      .values({
        customerId: customer.id,
        websiteUrl: "https://demo.example.com/inventory",
        status: "active",
      })
      .returning({ id: inventorySources.id });

    if (!source) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create inventory source" } });
    }

    const baseUrl = "https://demo.example.com/inventory";
    const websiteUrl = baseUrl;
    for (let i = 0; i < 10; i++) {
      const num = String(i + 1).padStart(3, "0");
      const externalId = stableExternalId(websiteUrl, i);
      await db.insert(inventoryItems).values({
        customerId: customer.id,
        inventorySourceId: source.id,
        externalId,
        title: `Demo Listing ${num}`,
        url: `${baseUrl}/listing/${num}`,
        price: 1000 + i * 100,
        status: "active",
        firstSeenAt: now,
        lastSeenAt: now,
      });
    }

    const [template] = await db.select().from(adTemplates).where(eq(adTemplates.key, "grid_4")).limit(1);
    const templateKey = template?.key ?? "grid_4";

    const [config] = await db
      .insert(adTemplateConfigs)
      .values({
        customerId: customer.id,
        templateKey,
        brandName: "Demo Brand",
        primaryColor: "#0070f3",
        logoUrl: null,
        headlineStyle: null,
        status: "approved",
        updatedAt: now,
      })
      .returning({ id: adTemplateConfigs.id });

    if (!config) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create template config" } });
    }

    const items = await db
      .select({ id: inventoryItems.id, title: inventoryItems.title, url: inventoryItems.url, price: inventoryItems.price })
      .from(inventoryItems)
      .where(
        and(
          eq(inventoryItems.customerId, customer.id),
          eq(inventoryItems.inventorySourceId, source.id),
          eq(inventoryItems.status, "active")
        )
      )
      .orderBy(desc(inventoryItems.lastSeenAt))
      .limit(4);

    const color = "#0070f3";
    const brand = "Demo Brand";
    const cells = items
      .map(
        (item) =>
          `<div style="border:1px solid #ddd;padding:0.5rem;border-radius:4px;">
            <div style="font-weight:bold;font-size:0.9rem;">${escapeHtml(item.title ?? "Item")}</div>
            <div style="color:${color};font-size:1rem;">${item.price != null ? `$${item.price}` : ""}</div>
          </div>`
      )
      .join("");
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:sans-serif;padding:1rem;">
      <h2 style="color:${color};">${escapeHtml(brand)}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;max-width:400px;">${cells}</div>
    </body></html>`;

    await db.insert(adPreviews).values({
      customerId: customer.id,
      templateConfigId: config.id,
      inventoryItemId: items[0]?.id ?? null,
      previewType: "html",
      htmlContent,
      meta: { templateKey, itemCount: items.length },
    });

    await db.insert(approvals).values({
      customerId: customer.id,
      templateConfigId: config.id,
      notes: "Demo seed",
    });

    return reply.status(201).send({
      customerId: customer.id,
      userId: user.id,
      email,
      password: DEMO_PASSWORD,
      message: "Demo customer created. Log in with the email and password above.",
    });
  });

  // POST /admin/customers/:customerId/reset - delete runs, previews, items, approvals (dev only)
  app.post<{ Params: { customerId: string } }>("/admin/customers/:customerId/reset", async (request, reply) => {
    if (!isDevOnly(reply)) return;

    const { customerId } = request.params;

    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
    if (!customer) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Customer not found" } });
    }

    await db.delete(approvals).where(eq(approvals.customerId, customerId));
    await db.delete(adPreviews).where(eq(adPreviews.customerId, customerId));
    await db.delete(previewRuns).where(eq(previewRuns.customerId, customerId));
    await db.delete(crawlRuns).where(eq(crawlRuns.customerId, customerId));
    await db.delete(inventoryItems).where(eq(inventoryItems.customerId, customerId));
    await db
      .update(adTemplateConfigs)
      .set({ status: "draft", updatedAt: new Date() })
      .where(eq(adTemplateConfigs.customerId, customerId));

    return reply.status(200).send({
      message: "Customer data reset. Runs, previews, items, and approvals deleted; template config set to draft.",
    });
  });

  // GET /admin/inventory-sources
  app.get("/admin/inventory-sources", async (_request, reply) => {
    const list = await db
      .select({
        id: inventorySources.id,
        customerId: inventorySources.customerId,
        websiteUrl: inventorySources.websiteUrl,
        status: inventorySources.status,
        lastCrawledAt: inventorySources.lastCrawledAt,
        createdAt: inventorySources.createdAt,
      })
      .from(inventorySources)
      .orderBy(desc(inventorySources.createdAt));

    return reply.send({ data: list });
  });

  // GET /admin/customers
  app.get("/admin/customers", async (request, reply) => {
    const query = request.query as { search?: string; status?: string; limit?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10) || 50, 200);
    const conditions = [];

    if (query.status) {
      conditions.push(eq(customers.status, query.status));
    }

    let list = await db
      .select({
        id: customers.id,
        name: customers.name,
        status: customers.status,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(customers.createdAt))
      .limit(limit);

    if (query.search && query.search.trim()) {
      const search = query.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.id.toLowerCase().includes(search)
      );
    }

    return reply.send({ data: list });
  });

  // GET /admin/customers/:customerId
  app.get<{ Params: { customerId: string } }>("/admin/customers/:customerId", async (request, reply) => {
    const { customerId } = request.params;

    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, customerId))
      .limit(1);

    if (!customer) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Customer not found" } });
    }

    const [source] = await db
      .select()
      .from(inventorySources)
      .where(eq(inventorySources.customerId, customerId))
      .limit(1);

    const itemCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(inventoryItems)
      .where(eq(inventoryItems.customerId, customerId));

    const crawlCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(crawlRuns)
      .where(eq(crawlRuns.customerId, customerId));

    const previewCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(previewRuns)
      .where(eq(previewRuns.customerId, customerId));

    const [templateConfig] = await db
      .select()
      .from(adTemplateConfigs)
      .where(eq(adTemplateConfigs.customerId, customerId))
      .limit(1);

    const [adSettings] = await db
      .select()
      .from(adSettings)
      .where(eq(adSettings.customerId, customerId))
      .limit(1);

    const [metaObjects] = await db
      .select()
      .from(metaAdObjects)
      .where(eq(metaAdObjects.customerId, customerId))
      .limit(1);

    const [metaConnection] = await db
      .select()
      .from(metaConnections)
      .where(eq(metaConnections.customerId, customerId))
      .limit(1);

    const [onboarding] = await db
      .select()
      .from(onboardingStates)
      .where(eq(onboardingStates.customerId, customerId))
      .limit(1);

    return reply.send({
      customer,
      inventorySource: source ?? null,
      stats: {
        inventoryItems: itemCount[0]?.count ?? 0,
        crawlRuns: crawlCount[0]?.count ?? 0,
        previewRuns: previewCount[0]?.count ?? 0,
        templateStatus: templateConfig?.status ?? null,
      },
      ads: {
        settings: adSettings ?? null,
        objects: metaObjects ?? null,
        connection: metaConnection ?? null,
        onboarding: onboarding ?? null,
      },
    });
  });

  // GET /admin/runs
  app.get("/admin/runs", async (request, reply) => {
    const query = request.query as { type?: string; status?: string; customerId?: string; limit?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10) || 50, 200);

    if (query.type === "crawl") {
      const conditions = [];
      if (query.customerId) conditions.push(eq(crawlRuns.customerId, query.customerId));
      if (query.status) conditions.push(eq(crawlRuns.status, query.status));

      const rows = await db
        .select({
          id: crawlRuns.id,
          customerId: crawlRuns.customerId,
          trigger: crawlRuns.trigger,
          status: crawlRuns.status,
          startedAt: crawlRuns.startedAt,
          finishedAt: crawlRuns.finishedAt,
          errorMessage: crawlRuns.errorMessage,
          createdAt: crawlRuns.createdAt,
        })
        .from(crawlRuns)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(crawlRuns.createdAt))
        .limit(limit);

      const data = rows.map((r) => ({ ...r, type: "crawl" as const }));
      return reply.send({ data });
    }

    if (query.type === "preview") {
      const conditions = [];
      if (query.customerId) conditions.push(eq(previewRuns.customerId, query.customerId));
      if (query.status) conditions.push(eq(previewRuns.status, query.status));

      const rows = await db
        .select({
          id: previewRuns.id,
          customerId: previewRuns.customerId,
          trigger: previewRuns.trigger,
          status: previewRuns.status,
          startedAt: previewRuns.startedAt,
          finishedAt: previewRuns.finishedAt,
          errorMessage: previewRuns.errorMessage,
          createdAt: previewRuns.createdAt,
        })
        .from(previewRuns)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(previewRuns.createdAt))
        .limit(limit);

      const data = rows.map((r) => ({ ...r, type: "preview" as const }));
      return reply.send({ data });
    }

    // Combined: crawl + preview
    const [crawls, previews] = await Promise.all([
      db
        .select({
          id: crawlRuns.id,
          customerId: crawlRuns.customerId,
          trigger: crawlRuns.trigger,
          status: crawlRuns.status,
          startedAt: crawlRuns.startedAt,
          finishedAt: crawlRuns.finishedAt,
          errorMessage: crawlRuns.errorMessage,
          createdAt: crawlRuns.createdAt,
        })
        .from(crawlRuns)
        .where(query.customerId ? eq(crawlRuns.customerId, query.customerId) : undefined)
        .orderBy(desc(crawlRuns.createdAt))
        .limit(limit * 2),
      db
        .select({
          id: previewRuns.id,
          customerId: previewRuns.customerId,
          trigger: previewRuns.trigger,
          status: previewRuns.status,
          startedAt: previewRuns.startedAt,
          finishedAt: previewRuns.finishedAt,
          errorMessage: previewRuns.errorMessage,
          createdAt: previewRuns.createdAt,
        })
        .from(previewRuns)
        .where(query.customerId ? eq(previewRuns.customerId, query.customerId) : undefined)
        .orderBy(desc(previewRuns.createdAt))
        .limit(limit * 2),
    ]);

    const combined = [
      ...crawls.map((r) => ({ ...r, type: "crawl" as const })),
      ...previews.map((r) => ({ ...r, type: "preview" as const })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    let data = combined;
    if (query.status) {
      data = combined.filter((r) => r.status === query.status);
    }

    return reply.send({ data });
  });

  // POST /admin/customers/:customerId/runs/crawl - trigger crawl for customer (dev ops)
  app.post<{ Params: { customerId: string } }>(
    "/admin/customers/:customerId/runs/crawl",
    async (request, reply) => {
      const { customerId } = request.params;

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

      if (!source) {
        return reply.status(400).send({
          error: "MISSING_PREREQUISITE",
          message: "No active inventory source for this customer.",
          hint: "Customer must connect a website first (POST /inventory/source).",
        });
      }

      const [run] = await db
        .insert(crawlRuns)
        .values({
          customerId,
          inventorySourceId: source.id,
          trigger: "admin",
          status: "queued",
        })
        .returning({ id: crawlRuns.id });

      if (!run) {
        return reply.status(500).send({
          error: { code: "INTERNAL", message: "Insert failed" },
        });
      }

      const runId = String(run.id);
      const jobId = await queue.enqueue({
        jobType: JOB_TYPES.CRAWL,
        payload: { inventorySourceId: source.id },
        correlation: { customerId, runId },
      });

      return reply.status(201).send({ runId, jobId });
    }
  );

  // POST /admin/customers/:customerId/ads/sync - trigger ads sync for customer (dev ops)
  app.post<{ Params: { customerId: string } }>(
    "/admin/customers/:customerId/ads/sync",
    async (request, reply) => {
      const { customerId } = request.params;

      const [run] = await db
        .insert(adRuns)
        .values({
          customerId,
          trigger: "admin",
          status: "queued",
        })
        .returning({ id: adRuns.id });

      if (!run) {
        return reply.status(500).send({
          error: { code: "INTERNAL", message: "Insert failed" },
        });
      }

      const runId = String(run.id);
      const jobId = await queue.enqueue({
        jobType: JOB_TYPES.ADS_SYNC,
        payload: {},
        correlation: { customerId, runId },
      });

      return reply.status(201).send({ runId, jobId });
    }
  );

  // POST /admin/customers/:customerId/ads/publish - trigger ads publish for customer (dev ops)
  app.post<{ Params: { customerId: string } }>(
    "/admin/customers/:customerId/ads/publish",
    async (request, reply) => {
      const { customerId } = request.params;

      const [run] = await db
        .insert(adRuns)
        .values({
          customerId,
          trigger: "admin",
          status: "queued",
        })
        .returning({ id: adRuns.id });

      if (!run) {
        return reply.status(500).send({
          error: { code: "INTERNAL", message: "Insert failed" },
        });
      }

      const runId = String(run.id);
      const jobId = await queue.enqueue({
        jobType: JOB_TYPES.ADS_PUBLISH,
        payload: {},
        correlation: { customerId, runId },
      });

      return reply.status(201).send({ runId, jobId });
    }
  );

  // POST /admin/customers/:customerId/runs/preview - trigger preview generation for customer (dev ops)
  app.post<{ Params: { customerId: string } }>(
    "/admin/customers/:customerId/runs/preview",
    async (request, reply) => {
      const { customerId } = request.params;

      const [config] = await db
        .select()
        .from(adTemplateConfigs)
        .where(eq(adTemplateConfigs.customerId, customerId))
        .limit(1);

      if (!config) {
        return reply.status(400).send({
          error: "MISSING_PREREQUISITE",
          message: "No template config for this customer.",
          hint: "Customer must save a template config first (POST /templates/config).",
        });
      }

      const [run] = await db
        .insert(previewRuns)
        .values({
          customerId,
          templateConfigId: config.id,
          trigger: "admin",
          status: "queued",
        })
        .returning({ id: previewRuns.id });

      if (!run) {
        return reply.status(500).send({
          error: { code: "INTERNAL", message: "Insert failed" },
        });
      }

      const runId = String(run.id);
      const jobId = await queue.enqueue({
        jobType: JOB_TYPES.PREVIEW,
        payload: { templateConfigId: config.id },
        correlation: { customerId, runId },
      });

      return reply.status(201).send({ runId, jobId });
    }
  );

  // GET /admin/runs/:runId
  app.get<{ Params: { runId: string } }>("/admin/runs/:runId", async (request, reply) => {
    const { runId } = request.params;

    const [crawl] = await db
      .select()
      .from(crawlRuns)
      .where(eq(crawlRuns.id, runId))
      .limit(1);

    if (crawl) {
      return reply.send({ ...crawl, type: "crawl" });
    }

    const [preview] = await db
      .select()
      .from(previewRuns)
      .where(eq(previewRuns.id, runId))
      .limit(1);

    if (preview) {
      return reply.send({ ...preview, type: "preview" });
    }

    const [ads] = await db
      .select()
      .from(adRuns)
      .where(eq(adRuns.id, runId))
      .limit(1);

    if (ads) {
      return reply.send({ ...ads, type: "ads" });
    }

    return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Run not found" } });
  });

  // GET /admin/ads - get all campaigns, connections, and spend data
  app.get("/admin/ads", async (_request, reply) => {
    // Get all customers with ads data
    const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));

    // Fetch ads-related data for all customers in parallel
    const [allSettings, allObjects, allConnections, allItems, allOnboarding] = await Promise.all([
      db.select().from(adSettings),
      db.select().from(metaAdObjects),
      db.select().from(metaConnections),
      db.select({ customerId: inventoryItems.customerId, count: sql<number>`count(*)::int` })
        .from(inventoryItems)
        .groupBy(inventoryItems.customerId),
      db.select().from(onboardingStates),
    ]);

    // Build maps for quick lookup
    const settingsMap = new Map(allSettings.map((s) => [s.customerId, s]));
    const objectsMap = new Map(allObjects.map((o) => [o.customerId, o]));
    const connectionsMap = new Map(allConnections.map((c) => [c.customerId, c]));
    const itemsMap = new Map(allItems.map((i) => [i.customerId, i.count]));
    const onboardingMap = new Map(allOnboarding.map((o) => [o.customerId, o]));

    // Build campaigns list
    const campaigns = allCustomers
      .map((customer) => {
        const settings = settingsMap.get(customer.id);
        const objects = objectsMap.get(customer.id);
        const connection = connectionsMap.get(customer.id);
        const itemCount = itemsMap.get(customer.id) ?? 0;
        const onboarding = onboardingMap.get(customer.id);

        // Determine campaign status
        let status: "active" | "paused" | "failed" | "pending" = "pending";
        if (objects?.status === "active" || settings?.status === "active") {
          status = "active";
        } else if (objects?.status === "paused") {
          status = "paused";
        } else if (objects?.status === "error" || settings?.status === "error") {
          status = "failed";
        }

        // Calculate budget
        const budgetMonthly = settings?.budgetOverride
          ? Number(settings.budgetOverride)
          : onboarding?.monthlyBudgetAmount
            ? Number(onboarding.monthlyBudgetAmount)
            : 0;
        const currency = onboarding?.budgetCurrency ?? "SEK";

        // For MVP, spend_current is simulated (0 for now, can be enhanced later)
        const spendCurrent = 0;

        // Format geo targeting
        let geoTargeting = "Not set";
        if (settings) {
          if (settings.geoMode === "radius" && settings.geoCenterText) {
            geoTargeting = `${settings.geoCenterText}, ${settings.geoRadiusKm ?? 0} km`;
          } else if (settings.geoMode === "regions" && settings.geoRegionsJson) {
            const regions = Array.isArray(settings.geoRegionsJson) ? settings.geoRegionsJson : [];
            geoTargeting = regions.join(", ");
          }
        }

        // Format last sync
        let lastSync = "Never";
        if (settings?.lastSyncedAt) {
          const syncDate = new Date(settings.lastSyncedAt);
          const hoursAgo = Math.floor((Date.now() - syncDate.getTime()) / (1000 * 60 * 60));
          if (hoursAgo < 1) lastSync = "Just now";
          else if (hoursAgo < 24) lastSync = `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
          else lastSync = `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? "s" : ""} ago`;
        }

        // Get template name (simplified - would need to join with adTemplateConfigs)
        const template = "Modern"; // Placeholder

        return {
          id: customer.id,
          customer_id: customer.id,
          customer_name: customer.name,
          status,
          budget_monthly: budgetMonthly,
          spend_current: spendCurrent,
          currency,
          catalog_items: itemCount,
          last_sync: lastSync,
          campaign_id: objects?.campaignId ?? "-",
          formats: Array.isArray(settings?.formatsJson) ? settings.formatsJson : [],
          geo_targeting: geoTargeting,
          template,
        };
      })
      .filter((c) => c.budget_monthly > 0 || c.status !== "pending"); // Only show customers with ads activity

    // Calculate summary metrics
    const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
    const failedCampaigns = campaigns.filter((c) => c.status === "failed").length;
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget_monthly, 0);
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend_current, 0);

    // Build Meta connections list
    const metaConnectionsList = allConnections.map((conn) => {
      const customer = allCustomers.find((c) => c.id === conn.customerId);
      const daysUntilExpiry = conn.tokenExpiresAt
        ? Math.floor((new Date(conn.tokenExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        customer_id: conn.customerId,
        customer_name: customer?.name ?? "Unknown",
        business_id: conn.metaUserId ?? "-",
        ad_account_id: conn.adAccountId ?? "-",
        connection_status: conn.status === "connected" ? "connected" : "error",
        token_expires: daysUntilExpiry !== null ? (daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : "Expired") : "Unknown",
        api_version: "v19.0", // Placeholder
      };
    });

    return reply.send({
      campaigns,
      metaConnections: metaConnectionsList,
      summary: {
        activeCampaigns,
        failedCampaigns,
        totalBudget,
        totalSpend,
        totalCampaigns: campaigns.length,
      },
    });
  });
}
