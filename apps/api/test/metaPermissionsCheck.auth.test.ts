import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@repo/db";
import { customers } from "@repo/db/schema";
import { requireCustomerSession } from "../src/middleware/customerContext.js";
import { metaRoutes } from "../src/routes/meta.js";

let app: ReturnType<typeof Fastify>;
const createdCustomerIds: string[] = [];

before(async () => {
  app = Fastify();
  await app.register(import("@fastify/cookie"), { secret: "test-secret" });
  app.addHook("preHandler", async (request, reply, done) => {
    await requireCustomerSession(request, reply, done);
  });
  await app.register(metaRoutes);
  await app.ready();
});

after(async () => {
  for (const customerId of createdCustomerIds) {
    await db.delete(customers).where(eq(customers.id, customerId));
  }
  await app.close();
});

test("GET /meta/permissions/check without session cookie returns 401", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Test Customer", status: "active" });
  createdCustomerIds.push(customerId);

  const response = await app.inject({
    method: "GET",
    url: "/meta/permissions/check",
    headers: { "x-customer-id": customerId },
    // No cookie
  });

  assert.equal(response.statusCode, 401);
  const body = response.json() as { error: { code: string; message: string } };
  assert.equal(body.error.code, "UNAUTHORIZED");
  assert.ok(
    body.error.message.toLowerCase().includes("session") || body.error.message.toLowerCase().includes("cookie"),
    `Expected message to mention session or cookie, got: ${body.error.message}`
  );
});
