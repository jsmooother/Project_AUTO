import "./lib/env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { requireCustomerContext } from "./middleware/customerContext.js";
import { healthRoutes } from "./routes/health.js";
import { authRoutes } from "./routes/auth.js";
import { onboardingRoutes } from "./routes/onboarding.js";
import { dataSourceRoutes } from "./routes/dataSources.js";
import { runsRoutes } from "./routes/runs.js";
import { crawlRunsRoutes } from "./routes/crawlRuns.js";
import { inventoryRoutes } from "./routes/inventory.js";
import { supportCaseRoutes } from "./routes/supportCases.js";
import { itemsRoutes } from "./routes/items.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.addHook("preHandler", (request, reply, done) => {
  const path = request.url?.split("?")[0];
  if (path === "/health" || path === "/signup") return done();
  requireCustomerContext(request, reply, done);
});

await app.register(healthRoutes);
await app.register(authRoutes);
await app.register(onboardingRoutes);
await app.register(dataSourceRoutes);
await app.register(runsRoutes, { prefix: "" });
await app.register(crawlRunsRoutes);
await app.register(inventoryRoutes);
await app.register(itemsRoutes);
await app.register(supportCaseRoutes);

const port = parseInt(process.env["PORT"] ?? "3001", 10);
const host = process.env["HOST"] ?? "0.0.0.0";

try {
  await app.listen({ port, host });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
