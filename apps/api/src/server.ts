import "./lib/env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { requireCustomerContext } from "./middleware/customerContext.js";
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

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
const cookieSecret = process.env["COOKIE_SECRET"] ?? "dev-secret-change-in-production";
await app.register(cookie, { secret: cookieSecret });
if (!process.env["COOKIE_SECRET"]) {
  app.log.warn("COOKIE_SECRET is not set; using the insecure default (dev-only).");
}

app.addHook("preHandler", (request, reply, done) => {
  const path = request.url?.split("?")[0];
  if (path === "/health" || path === "/signup" || path?.startsWith("/auth/")) return done();
  if (path?.startsWith("/admin/")) {
    requireAdminContext(request, reply, done);
    return;
  }
  requireCustomerContext(request, reply, done);
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
