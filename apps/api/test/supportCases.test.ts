import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, customers, dataSources, supportCases, runEvents } from "@repo/db";
import { requireCustomerContext } from "../src/middleware/customerContext.js";
import { supportCaseRoutes } from "../src/routes/supportCases.js";

let app: ReturnType<typeof Fastify>;

const createdCustomerIds: string[] = [];
const createdDataSourceIds: string[] = [];
const createdSupportCaseIds: string[] = [];

before(async () => {
  app = Fastify();
  app.addHook("preHandler", (request, reply, done) => {
    requireCustomerContext(request, reply, done);
  });
  await app.register(supportCaseRoutes);
  await app.ready();
});

after(async () => {
  if (createdSupportCaseIds.length > 0) {
    await db.delete(runEvents).where(inArray(runEvents.jobId, createdSupportCaseIds));
    await db.delete(supportCases).where(inArray(supportCases.id, createdSupportCaseIds));
  }
  if (createdDataSourceIds.length > 0) {
    await db.delete(dataSources).where(inArray(dataSources.id, createdDataSourceIds));
  }
  if (createdCustomerIds.length > 0) {
    await db.delete(customers).where(inArray(customers.id, createdCustomerIds));
  }
  await app.close();
});

test("rejects cross-tenant dataSourceId on support case creation", async () => {
  const customerAId = randomUUID();
  const customerBId = randomUUID();

  await db.insert(customers).values([
    { id: customerAId, name: "Customer A", status: "active" },
    { id: customerBId, name: "Customer B", status: "active" },
  ]);
  createdCustomerIds.push(customerAId, customerBId);

  const dataSourceId = randomUUID();
  await db.insert(dataSources).values({
    id: dataSourceId,
    customerId: customerAId,
    name: "Customer A Source",
    baseUrl: "https://example.com",
    strategy: "http",
  });
  createdDataSourceIds.push(dataSourceId);

  const response = await app.inject({
    method: "POST",
    url: "/v1/support-cases",
    headers: { "x-customer-id": customerBId },
    payload: { subject: "Help", dataSourceId },
  });

  assert.equal(response.statusCode, 404);
  const body = response.json() as { error?: { code: string } };
  assert.equal(body.error?.code, "NOT_FOUND");

  const existing = await db
    .select({ id: supportCases.id })
    .from(supportCases)
    .where(eq(supportCases.customerId, customerBId));
  assert.equal(existing.length, 0);
});

test("allows support case creation for owned dataSourceId", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Customer C", status: "active" });
  createdCustomerIds.push(customerId);

  const dataSourceId = randomUUID();
  await db.insert(dataSources).values({
    id: dataSourceId,
    customerId,
    name: "Customer C Source",
    baseUrl: "https://example.org",
    strategy: "http",
  });
  createdDataSourceIds.push(dataSourceId);

  const response = await app.inject({
    method: "POST",
    url: "/v1/support-cases",
    headers: { "x-customer-id": customerId },
    payload: { subject: "Help", dataSourceId },
  });

  assert.equal(response.statusCode, 201);
  const body = response.json() as { id?: string };
  assert.ok(body.id);
  createdSupportCaseIds.push(body.id);

  const rows = await db
    .select({ id: supportCases.id })
    .from(supportCases)
    .where(eq(supportCases.id, body.id));
  assert.equal(rows.length, 1);
});
