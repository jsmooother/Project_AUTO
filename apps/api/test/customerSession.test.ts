import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@repo/db";
import { customers, users, sessions, customerLedgerEntries, customerBalanceCache } from "@repo/db/schema";
import { hashPassword } from "../src/lib/password.js";
import { requireCustomerSession } from "../src/middleware/customerContext.js";
import { billingRoutes } from "../src/routes/billing.js";

let app: ReturnType<typeof Fastify>;
const createdCustomerIds: string[] = [];
const createdUserIds: string[] = [];
const createdSessionIds: string[] = [];

before(async () => {
  app = Fastify();
  await app.register(import("@fastify/cookie"), { secret: "test-secret" });
  app.addHook("preHandler", async (request, reply, done) => {
    await requireCustomerSession(request, reply, done);
  });
  await app.register(billingRoutes);
  await app.ready();
});

after(async () => {
  if (createdSessionIds.length > 0) {
    await db.delete(sessions).where(inArray(sessions.id, createdSessionIds));
  }
  if (createdUserIds.length > 0) {
    await db.delete(users).where(inArray(users.id, createdUserIds));
  }
  if (createdCustomerIds.length > 0) {
    await db.delete(customerLedgerEntries).where(inArray(customerLedgerEntries.customerId, createdCustomerIds));
    await db.delete(customerBalanceCache).where(inArray(customerBalanceCache.customerId, createdCustomerIds));
    await db.delete(customers).where(inArray(customers.id, createdCustomerIds));
  }
  await app.close();
});

async function createTestSession(customerId: string, userId: string): Promise<string> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const sessionId = randomUUID();
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });
  createdSessionIds.push(sessionId);
  return sessionId;
}

test("GET /billing/status without cookie returns 401", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Test Customer", status: "active" });
  createdCustomerIds.push(customerId);

  const response = await app.inject({
    method: "GET",
    url: "/billing/status",
    headers: { "x-customer-id": customerId },
    // No cookie
  });

  assert.equal(response.statusCode, 401);
  const body = response.json() as { error: { code: string; message: string } };
  assert.equal(body.error.code, "UNAUTHORIZED");
  assert.ok(body.error.message.toLowerCase().includes("session") || body.error.message.toLowerCase().includes("cookie"));
});

test("GET /billing/status with cookie but wrong x-customer-id returns 403", async () => {
  const customerId1 = randomUUID();
  const customerId2 = randomUUID();
  await db.insert(customers).values([
    { id: customerId1, name: "Customer 1", status: "active" },
    { id: customerId2, name: "Customer 2", status: "active" },
  ]);
  createdCustomerIds.push(customerId1, customerId2);

  const passwordHash = await hashPassword("test-password");
  const [user] = await db
    .insert(users)
    .values({
      customerId: customerId1,
      email: "test1@example.com",
      role: "owner",
      passwordHash,
    })
    .returning({ id: users.id });
  if (!user) throw new Error("Failed to create user");
  createdUserIds.push(user.id);

  const sessionId = await createTestSession(customerId1, user.id);

  const response = await app.inject({
    method: "GET",
    url: "/billing/status",
    headers: { "x-customer-id": customerId2 }, // Wrong customer ID
    cookies: { session: sessionId },
  });

  assert.equal(response.statusCode, 403);
  const body = response.json() as { error: { code: string; message: string; hint?: string } };
  assert.equal(body.error.code, "FORBIDDEN");
  assert.ok(body.error.message.toLowerCase().includes("match") || body.error.message.toLowerCase().includes("customer"));
  assert.ok(body.error.hint);
});

test("GET /billing/status with cookie and correct x-customer-id returns 200", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Test Customer", status: "active" });
  createdCustomerIds.push(customerId);

  const passwordHash = await hashPassword("test-password");
  const [user] = await db
    .insert(users)
    .values({
      customerId,
      email: "test@example.com",
      role: "owner",
      passwordHash,
    })
    .returning({ id: users.id });
  if (!user) throw new Error("Failed to create user");
  createdUserIds.push(user.id);

  const sessionId = await createTestSession(customerId, user.id);

  const response = await app.inject({
    method: "GET",
    url: "/billing/status",
    headers: { "x-customer-id": customerId },
    cookies: { session: sessionId },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { ok: boolean; balanceSek: number };
  assert.equal(body.ok, true);
  assert.equal(typeof body.balanceSek, "number");
});
