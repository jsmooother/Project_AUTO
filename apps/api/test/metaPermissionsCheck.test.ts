import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@repo/db";
import { customers, metaConnections } from "@repo/db/schema";
import { requireCustomerContext } from "../src/middleware/customerContext.js";
import { metaRoutes } from "../src/routes/meta.js";

let app: ReturnType<typeof Fastify>;
const createdCustomerIds: string[] = [];
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

before(async () => {
  app = Fastify();
  app.addHook("preHandler", (request, reply, done) => {
    requireCustomerContext(request, reply, done);
  });
  await app.register(metaRoutes);
  await app.ready();
});

after(async () => {
  for (const customerId of createdCustomerIds) {
    await db.delete(metaConnections).where(eq(metaConnections.customerId, customerId));
    await db.delete(customers).where(eq(customers.id, customerId));
  }
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
  await app.close();
});

async function createCustomer(): Promise<string> {
  const customerId = randomUUID();
  createdCustomerIds.push(customerId);
  await db.insert(customers).values({
    id: customerId,
    name: "Test Customer",
    status: "active",
  });
  return customerId;
}

test("GET /meta/permissions/check returns ok false when no selected ad account", async () => {
  const customerId = await createCustomer();
  await db.insert(metaConnections).values({
    customerId,
    status: "connected",
    selectedAdAccountId: null,
    partnerAccessStatus: "pending",
  });

  const response = await app.inject({
    method: "GET",
    url: "/meta/permissions/check",
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, false);
  assert.equal(body.status, "missing_ad_account");
  assert.ok(body.hint?.includes("Select an ad account"));
});

test("GET /meta/permissions/check returns ok false when system token not configured", async () => {
  const customerId = await createCustomer();
  await db.insert(metaConnections).values({
    customerId,
    status: "connected",
    selectedAdAccountId: "act_123456789",
    partnerAccessStatus: "pending",
  });
  const had = process.env.META_SYSTEM_USER_ACCESS_TOKEN;
  delete process.env.META_SYSTEM_USER_ACCESS_TOKEN;

  const response = await app.inject({
    method: "GET",
    url: "/meta/permissions/check",
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, false);
  assert.equal(body.status, "not_configured");
  assert.ok(body.debug?.adAccountIdMasked);
  if (had !== undefined) process.env.META_SYSTEM_USER_ACCESS_TOKEN = had;
});

test("GET /meta/permissions/check returns ok true and updates DB to verified when Meta returns success", async () => {
  const customerId = await createCustomer();
  await db.insert(metaConnections).values({
    customerId,
    status: "connected",
    selectedAdAccountId: "act_123456789",
    partnerAccessStatus: "pending",
  });
  process.env.META_SYSTEM_USER_ACCESS_TOKEN = "test-token";

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ id: "act_123456789", name: "Test Account", account_status: 1, currency: "USD" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  const response = await app.inject({
    method: "GET",
    url: "/meta/permissions/check",
    headers: { "x-customer-id": customerId },
  });

  globalThis.fetch = originalFetch;

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.equal(body.status, "verified");
  assert.ok(body.checkedAt);
  assert.ok(body.debug?.adAccountIdMasked);

  const [conn] = await db
    .select({ partnerAccessStatus: metaConnections.partnerAccessStatus, partnerAccessCheckedAt: metaConnections.partnerAccessCheckedAt })
    .from(metaConnections)
    .where(eq(metaConnections.customerId, customerId))
    .limit(1);
  assert.equal(conn?.partnerAccessStatus, "verified");
  assert.ok(conn?.partnerAccessCheckedAt);
});

test("GET /meta/permissions/check returns ok false and updates DB to failed when Meta returns error", async () => {
  const customerId = await createCustomer();
  await db.insert(metaConnections).values({
    customerId,
    status: "connected",
    selectedAdAccountId: "act_987654321",
    partnerAccessStatus: "pending",
  });
  process.env.META_SYSTEM_USER_ACCESS_TOKEN = "test-token";

  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        error: { message: "Permission denied", type: "OAuthException", code: 200 },
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );

  const response = await app.inject({
    method: "GET",
    url: "/meta/permissions/check",
    headers: { "x-customer-id": customerId },
  });

  globalThis.fetch = originalFetch;

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, false);
  assert.equal(body.status, "failed");
  assert.ok(body.hint);
  assert.ok(body.debug?.adAccountIdMasked);

  const [conn] = await db
    .select({ partnerAccessStatus: metaConnections.partnerAccessStatus, partnerAccessError: metaConnections.partnerAccessError })
    .from(metaConnections)
    .where(eq(metaConnections.customerId, customerId))
    .limit(1);
  assert.equal(conn?.partnerAccessStatus, "failed");
  assert.ok(conn?.partnerAccessError);
});
