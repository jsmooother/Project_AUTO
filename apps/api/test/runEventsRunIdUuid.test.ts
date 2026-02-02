import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, customers, dataSources, scrapeRuns, runEvents } from "@repo/db";
import { requireCustomerContext } from "../src/middleware/customerContext.js";
import { runsRoutes } from "../src/routes/runs.js";
import { emitRunEvent } from "@repo/observability/runEvents";

let app: ReturnType<typeof Fastify>;
const createdCustomerIds: string[] = [];
const createdDataSourceIds: string[] = [];
const createdRunIds: string[] = [];
const createdEventIds: string[] = [];

before(async () => {
  app = Fastify();
  app.addHook("preHandler", (request, reply, done) => {
    requireCustomerContext(request, reply, done);
  });
  await app.register(runsRoutes);
  await app.ready();
});

after(async () => {
  if (createdEventIds.length > 0) {
    await db.delete(runEvents).where(inArray(runEvents.id, createdEventIds));
  }
  if (createdRunIds.length > 0) {
    await db.delete(scrapeRuns).where(inArray(scrapeRuns.id, createdRunIds));
  }
  if (createdDataSourceIds.length > 0) {
    await db.delete(dataSources).where(inArray(dataSources.id, createdDataSourceIds));
  }
  if (createdCustomerIds.length > 0) {
    await db.delete(customers).where(inArray(customers.id, createdCustomerIds));
  }
  await app.close();
});

test("scrape-run events populate run_id_uuid", async () => {
  const customerId = randomUUID();
  const dataSourceId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Run Events Customer", status: "active" });
  createdCustomerIds.push(customerId);
  await db.insert(dataSources).values({
    id: dataSourceId,
    customerId,
    name: "Test Source",
    baseUrl: "https://example.com",
    strategy: "http",
  });
  createdDataSourceIds.push(dataSourceId);

  const [run] = await db
    .insert(scrapeRuns)
    .values({
      customerId,
      dataSourceId,
      runType: "prod",
      status: "success",
    })
    .returning({ id: scrapeRuns.id });
  assert.ok(run);
  createdRunIds.push(run.id);
  const runId = String(run.id);

  await emitRunEvent(db, {
    customerId,
    jobType: "SCRAPE_PROD",
    jobId: "test-job-1",
    runId,
    runIdUuid: runId,
    dataSourceId,
    level: "info",
    stage: "init",
    eventCode: "SYSTEM_JOB_START",
    message: "Job started",
  });

  const rows = await db
    .select({ id: runEvents.id, runId: runEvents.runId, runIdUuid: runEvents.runIdUuid })
    .from(runEvents)
    .where(eq(runEvents.runId, runId));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].runIdUuid, runId);
  if (rows[0].id) createdEventIds.push(rows[0].id);
});

test("GET /v1/scrape-runs/:runId/events returns events (run_id_uuid or run_id fallback)", async () => {
  const customerId = randomUUID();
  const dataSourceId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Events API Customer", status: "active" });
  createdCustomerIds.push(customerId);
  await db.insert(dataSources).values({
    id: dataSourceId,
    customerId,
    name: "Events Source",
    baseUrl: "https://example.org",
    strategy: "http",
  });
  createdDataSourceIds.push(dataSourceId);

  const [run] = await db
    .insert(scrapeRuns)
    .values({
      customerId,
      dataSourceId,
      runType: "test",
      status: "success",
    })
    .returning({ id: scrapeRuns.id });
  assert.ok(run);
  createdRunIds.push(run.id);
  const runId = String(run.id);

  await emitRunEvent(db, {
    customerId,
    jobType: "SCRAPE_TEST",
    jobId: "test-job-2",
    runId,
    runIdUuid: runId,
    dataSourceId,
    level: "info",
    stage: "init",
    eventCode: "SYSTEM_JOB_START",
    message: "Test job enqueued",
  });

  // Wait for event to be visible (transaction commit + query visibility)
  // Poll up to 1 second with 50ms intervals
  let eventVisible = false;
  for (let i = 0; i < 20; i++) {
    const check = await db
      .select({ id: runEvents.id })
      .from(runEvents)
      .where(eq(runEvents.runId, runId))
      .limit(1);
    if (check.length > 0) {
      eventVisible = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(eventVisible, "Event should be visible in DB before API query");

  const response = await app.inject({
    method: "GET",
    url: `/v1/scrape-runs/${runId}/events`,
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { data?: Array<{ id: string; event_code: string }> };
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data!.length >= 1);
  assert.ok(body.data!.some((e) => e.event_code === "SYSTEM_JOB_START"));
  for (const e of body.data!) {
    if (e.id) createdEventIds.push(e.id);
  }
});
