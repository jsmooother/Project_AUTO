import "./lib/env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { requireCustomerSession } from "./middleware/customerContext.js";
import { requireAdminContext } from "./middleware/adminContext.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { onboardingRoutes } from "./routes/onboarding.js";
import { dataSourceRoutes } from "./routes/dataSources.js";
import { runsRoutes } from "./routes/runs.js";
import { crawlRunsRoutes } from "./routes/crawlRuns.js";
import { templatesRoutes } from "./routes/templates.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { supportCaseRoutes } from "./routes/supportCases.js";
import { itemsRoutes } from "./routes/items.js";
import { adminRoutes } from "./routes/admin.js";
import { metaRoutes } from "./routes/meta.js";
import { adsRoutes } from "./routes/ads.js";
import { performanceRoutes } from "./routes/performance.js";
import { billingRoutes } from "./routes/billing.js";

const app = Fastify({ logger: true });

// CORS configuration: allowlist in production, open in development
const corsOriginRaw = process.env["CORS_ORIGIN"];
const corsOriginList = corsOriginRaw
  ? corsOriginRaw
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean)
  : [];
const isProduction = process.env["NODE_ENV"] === "production";

let corsOrigin: boolean | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void);
if (corsOriginList.length > 0) {
  // Use allowlist array: @fastify/cors will check if Origin header is in list
  // Note: server-to-server requests (no Origin) are allowed by default
  corsOrigin = corsOriginList;
} else if (isProduction) {
  // Production without CORS_ORIGIN: deny by default (secure)
  corsOrigin = false;
  app.log.warn(
    "CORS_ORIGIN is not set in production. CORS is disabled. Set CORS_ORIGIN to a comma-separated list of allowed origins (e.g., https://app.projectauto.com) to enable CORS."
  );
} else {
  // Development: allow all origins (dev-friendly)
  corsOrigin = true;
}

await app.register(cors, { origin: corsOrigin, credentials: true });
const cookieSecret = process.env["COOKIE_SECRET"] ?? "dev-secret-change-in-production";
await app.register(cookie, { secret: cookieSecret });
if (!process.env["COOKIE_SECRET"]) {
  app.log.warn("COOKIE_SECRET is not set; using the insecure default (dev-only).");
}

app.addHook("preHandler", async (request, reply) => {
  const path = request.url?.split("?")[0];
  if (path === "/health" || path === "/signup" || path?.startsWith("/auth/")) return;
  // OAuth callback needs session but not customer context (it validates state instead)
  if (path === "/meta/oauth/callback") return;
  if (path?.startsWith("/admin/")) {
    return new Promise<void>((resolve, reject) => {
      requireAdminContext(request, reply, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
  return new Promise<void>((resolve, reject) => {
    requireCustomerSession(request, reply, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
});

app.setErrorHandler((err, request, reply) => {
  request.log.error(err);
  if (reply.sent) return;
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string }).code;
  const statusCode = reply.statusCode >= 400 ? reply.statusCode : 500;
  reply.status(statusCode).send({
    error: { code: code ?? "INTERNAL", message },
    ...(process.env["NODE_ENV"] === "development" && err instanceof Error && err.stack
      ? { stack: err.stack }
      : {}),
  });
});

await app.register(healthRoutes);
await app.register(authRoutes);
await app.register(onboardingRoutes);
await app.register(dataSourceRoutes);
await app.register(runsRoutes, { prefix: "" });
await app.register(crawlRunsRoutes);
await app.register(templatesRoutes);
await app.register(inventoryRoutes);
await app.register(itemsRoutes);
await app.register(supportCaseRoutes);
await app.register(adminRoutes, { prefix: "" });
await app.register(metaRoutes);
await app.register(adsRoutes);
await app.register(performanceRoutes);
await app.register(billingRoutes);

// Log configuration on startup
function redactPassword(url: string | undefined): string {
  if (!url) return "not set";
  try {
    const u = new URL(url);
    if (u.password) {
      u.password = "***";
    }
    return u.toString();
  } catch {
    return url.includes("@") ? url.replace(/:[^:@]+@/, ":***@") : url;
  }
}

const databaseUrl = redactPassword(process.env["DATABASE_URL"]);
const redisUrl = redactPassword(process.env["REDIS_URL"]);

app.log.info(`DATABASE_URL: ${databaseUrl}`);
app.log.info(`REDIS_URL: ${redisUrl || "not set (defaults to localhost:6379)"}`);

const port = parseInt(process.env["PORT"] ?? "3001", 10);
const host = process.env["HOST"] ?? "0.0.0.0";

app.log.info(`Starting API server on ${host}:${port}`);

try {
  await app.listen({ port, host });
  app.log.info(`API server listening at http://${host === "0.0.0.0" ? "localhost" : host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
