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
await app.register(cookie, { secret: process.env["COOKIE_SECRET"] ?? "dev-secret-change-in-production" });

app.addHook("preHandler", (request, reply, done) => {
  const path = request.url?.split("?")[0];
  if (path === "/health" || path === "/signup" || path?.startsWith("/auth/")) return done();
  if (path?.startsWith("/admin/")) {
    requireAdminContext(request, reply, done);
    return;
  }
  requireCustomerContext(request, reply, done);
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

const port = parseInt(process.env["PORT"] ?? "3001", 10);
const host = process.env["HOST"] ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
