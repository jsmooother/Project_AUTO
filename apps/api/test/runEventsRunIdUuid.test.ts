import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray, count } from "drizzle-orm";
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

/**
 * Verify a customer exists by SELECT (by primary key)
 */
async function verifyCustomerExists(customerId: string): Promise<void> {
  const [row] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);
  if (!row) {
    throw new Error(`Customer ${customerId} not found after insert`);
  }
}

/**
 * Verify a dataSource exists by SELECT (by primary key)
 */
async function verifyDataSourceExists(dataSourceId: string): Promise<void> {
  const [row] = await db.select().from(dataSources).where(eq(dataSources.id, dataSourceId)).limit(1);
  if (!row) {
    throw new Error(`DataSource ${dataSourceId} not found after insert`);
  }
}

/**
 * Verify a scrapeRun exists by SELECT (by primary key)
 */
async function verifyScrapeRunExists(runId: string): Promise<void> {
  const [row] = await db.select().from(scrapeRuns).where(eq(scrapeRuns.id, runId)).limit(1);
  if (!row) {
    throw new Error(`ScrapeRun ${runId} not found after insert`);
  }
}

/**
 * Poll until event count for runId reaches expected count, or timeout
 */
async function pollForEventCount(
  runId: string,
  expectedCount: number,
  maxAttempts: number = 20,
  delayMs: number = 50
): Promise<number> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await db
      .select({ count: count() })
      .from(runEvents)
      .where(eq(runEvents.runId, runId));
    const currentCount = result[0]?.count ?? 0;
    if (currentCount >= expectedCount) {
      return currentCount;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  // Final check
  const result = await db.select({ count: count() }).from(runEvents).where(eq(runEvents.runId, runId));
  return result[0]?.count ?? 0;
}

test("scrape-run events populate run_id_uuid", async () => {
  // Generate all IDs upfront
  const customerId = randomUUID();
  const dataSourceId = randomUUID();
  const runId = randomUUID();
  const jobId = `test-job-${randomUUID()}`;

  // Insert customer with explicit ID
  await db.insert(customers).values({ id: customerId, name: "Run Events Customer", status: "active" });
  createdCustomerIds.push(customerId);
  await verifyCustomerExists(customerId);

  // Insert dataSource with explicit ID
  await db.insert(dataSources).values({
    id: dataSourceId,
    customerId,
    name: "Test Source",
    baseUrl: "https://example.com",
    strategy: "http",
  });
  createdDataSourceIds.push(dataSourceId);
  await verifyDataSourceExists(dataSourceId);

  // Insert scrapeRun with explicit ID
  await db.insert(scrapeRuns).values({
    id: runId,
    customerId,
    dataSourceId,
    runType: "prod",
    status: "success",
  });
  createdRunIds.push(runId);
  await verifyScrapeRunExists(runId);

  // Get initial event count
  const initialCount = await db.select({ count: count() }).from(runEvents).where(eq(runEvents.runId, runId));
  const beforeCount = initialCount[0]?.count ?? 0;

  // Emit event
  await emitRunEvent(db, {
    customerId,
    jobType: "SCRAPE_PROD",
    jobId,
    runId,
    runIdUuid: runId,
    dataSourceId,
    level: "info",
    stage: "init",
    eventCode: "SYSTEM_JOB_START",
    message: "Job started",
  });

  // Verify event was inserted by polling for count increase
  const afterCount = await pollForEventCount(runId, beforeCount + 1);
  assert.equal(afterCount, beforeCount + 1, `Expected ${beforeCount + 1} events, got ${afterCount}`);

  // Verify run_id_uuid is populated
  const rows = await db
    .select({ id: runEvents.id, runId: runEvents.runId, runIdUuid: runEvents.runIdUuid })
    .from(runEvents)
    .where(eq(runEvents.runId, runId));
  assert.equal(rows.length, 1, `Expected 1 event, got ${rows.length}`);
  assert.equal(rows[0].runIdUuid, runId, `Expected run_id_uuid to equal runId`);
  if (rows[0].id) createdEventIds.push(rows[0].id);
});

test("GET /v1/scrape-runs/:runId/events returns events (run_id_uuid or run_id fallback)", async () => {
  // Generate all IDs upfront
  const customerId = randomUUID();
  const dataSourceId = randomUUID();
  const runId = randomUUID();
  const jobId = `test-job-${randomUUID()}`;

  // Insert customer with explicit ID
  await db.insert(customers).values({ id: customerId, name: "Events API Customer", status: "active" });
  createdCustomerIds.push(customerId);
  await verifyCustomerExists(customerId);

  // Insert dataSource with explicit ID
  await db.insert(dataSources).values({
    id: dataSourceId,
    customerId,
    name: "Events Source",
    baseUrl: "https://example.org",
    strategy: "http",
  });
  createdDataSourceIds.push(dataSourceId);
  await verifyDataSourceExists(dataSourceId);

  // Insert scrapeRun with explicit ID
  await db.insert(scrapeRuns).values({
    id: runId,
    customerId,
    dataSourceId,
    runType: "test",
    status: "success",
  });
  createdRunIds.push(runId);
  await verifyScrapeRunExists(runId);

  // Get initial event count
  const initialCount = await db.select({ count: count() }).from(runEvents).where(eq(runEvents.runId, runId));
  const beforeCount = initialCount[0]?.count ?? 0;

  // Emit event
  await emitRunEvent(db, {
    customerId,
    jobType: "SCRAPE_TEST",
    jobId,
    runId,
    runIdUuid: runId,
    dataSourceId,
    level: "info",
    stage: "init",
    eventCode: "SYSTEM_JOB_START",
    message: "Test job enqueued",
  });

  // Poll for event count increase (DB verification first)
  const afterCount = await pollForEventCount(runId, beforeCount + 1);
  assert.equal(afterCount, beforeCount + 1, `Expected ${beforeCount + 1} events in DB, got ${afterCount}`);

  // Verify event exists with correct run_id_uuid
  const eventRows = await db
    .select({ id: runEvents.id, runId: runEvents.runId, runIdUuid: runEvents.runIdUuid, eventCode: runEvents.eventCode })
    .from(runEvents)
    .where(eq(runEvents.runId, runId));
  assert.equal(eventRows.length, 1, `Expected 1 event in DB, got ${eventRows.length}`);
  assert.equal(eventRows[0].runIdUuid, runId, `Expected run_id_uuid to equal runId`);
  assert.equal(eventRows[0].eventCode, "SYSTEM_JOB_START", `Expected event_code to be SYSTEM_JOB_START`);
  if (eventRows[0].id) createdEventIds.push(eventRows[0].id);

  // Now call API endpoint (event is verified in DB first)
  const response = await app.inject({
    method: "GET",
    url: `/v1/scrape-runs/${runId}/events`,
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200, `Expected 200, got ${response.statusCode}`);
  const body = response.json() as { data?: Array<{ id: string; event_code: string; [key: string]: unknown }> };
  assert.ok(Array.isArray(body.data), `Expected body.data to be an array, got: ${JSON.stringify(body)}`);
  assert.ok(body.data!.length >= 1, `Expected at least 1 event, got ${body.data!.length}. Response: ${JSON.stringify(body)}`);
  
  // Debug: log actual event codes returned
  const eventCodes = body.data!.map((e) => e.event_code || e.eventCode || JSON.stringify(e));
  const hasSystemJobStart = body.data!.some((e) => e.event_code === "SYSTEM_JOB_START" || e.eventCode === "SYSTEM_JOB_START");
  assert.ok(
    hasSystemJobStart,
    `Expected at least one event with code SYSTEM_JOB_START. Got event codes: ${eventCodes.join(", ")}. Full response: ${JSON.stringify(body.data)}`
  );
  for (const e of body.data!) {
    if (e.id) createdEventIds.push(e.id);
  }
});
