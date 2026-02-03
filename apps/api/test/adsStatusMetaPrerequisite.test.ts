import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db, customers, metaConnections } from "@repo/db";
import { requireCustomerContext } from "../src/middleware/customerContext.js";
import { adsRoutes } from "../src/routes/ads.js";

let app: ReturnType<typeof Fastify>;

const createdCustomerIds: string[] = [];
const createdMetaConnectionIds: string[] = [];

before(async () => {
  app = Fastify();
  app.addHook("preHandler", (request, reply, done) => {
    requireCustomerContext(request, reply, done);
  });
  await app.register(adsRoutes);
  await app.ready();
});

after(async () => {
  if (createdMetaConnectionIds.length > 0) {
    await db.delete(metaConnections).where(inArray(metaConnections.id, createdMetaConnectionIds));
  }
  if (createdCustomerIds.length > 0) {
    await db.delete(customers).where(inArray(customers.id, createdCustomerIds));
  }
  await app.close();
});

test("GET /ads/status meta prerequisite requires selected_ad_account_id", async () => {
  const customerId = randomUUID();

  await db.insert(customers).values({
    id: customerId,
    name: "Test Customer",
    status: "active",
  });
  createdCustomerIds.push(customerId);

  // Test 1: No Meta connection -> meta.ok = false
  const res1 = await app.inject({
    method: "GET",
    url: "/ads/status",
    headers: { "x-customer-id": customerId },
    cookies: { session: "test-session" },
  });

  assert.equal(res1.statusCode, 200);
  const data1 = res1.json() as { prerequisites?: { meta?: { ok?: boolean; hint?: string } } };
  assert.equal(data1.prerequisites?.meta?.ok, false);
  assert.equal(data1.prerequisites?.meta?.hint, "Connect your Meta account");

  // Test 2: Meta connected but no selected_ad_account_id -> meta.ok = false
  const [metaConn1] = await db
    .insert(metaConnections)
    .values({
      customerId,
      status: "connected",
      metaUserId: "test-user-123",
      accessToken: "dev-token-placeholder",
      adAccountId: "act_123",
    })
    .returning();

  if (metaConn1) {
    createdMetaConnectionIds.push(metaConn1.id);
  }

  const res2 = await app.inject({
    method: "GET",
    url: "/ads/status",
    headers: { "x-customer-id": customerId },
    cookies: { session: "test-session" },
  });

  assert.equal(res2.statusCode, 200);
  const data2 = res2.json() as { prerequisites?: { meta?: { ok?: boolean; hint?: string } } };
  assert.equal(data2.prerequisites?.meta?.ok, false);
  assert.equal(data2.prerequisites?.meta?.hint, "Select an ad account in Settings → Meta");

  // Test 3: Meta connected with selected_ad_account_id -> meta.ok = true
  await db
    .update(metaConnections)
    .set({ selectedAdAccountId: "act_456" })
    .where(eq(metaConnections.customerId, customerId));

  const res3 = await app.inject({
    method: "GET",
    url: "/ads/status",
    headers: { "x-customer-id": customerId },
    cookies: { session: "test-session" },
  });

  assert.equal(res3.statusCode, 200);
  const data3 = res3.json() as { prerequisites?: { meta?: { ok?: boolean; hint?: string | null } } };
  assert.equal(data3.prerequisites?.meta?.ok, true);
  assert.equal(data3.prerequisites?.meta?.hint, null);
});
