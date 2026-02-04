import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@repo/db";
import {
  customers,
  customerLedgerEntries,
  customerBalanceCache,
  adsBudgetPlans,
} from "@repo/db/schema";
import { requireCustomerContext } from "../src/middleware/customerContext.js";
import { billingRoutes } from "../src/routes/billing.js";

let app: ReturnType<typeof Fastify>;
const createdCustomerIds: string[] = [];

before(async () => {
  app = Fastify();
  app.addHook("preHandler", (request, reply, done) => {
    requireCustomerContext(request, reply, done);
  });
  await app.register(billingRoutes);
  await app.ready();
});

after(async () => {
  if (createdCustomerIds.length > 0) {
    await db.delete(customerLedgerEntries).where(inArray(customerLedgerEntries.customerId, createdCustomerIds));
    await db.delete(customerBalanceCache).where(inArray(customerBalanceCache.customerId, createdCustomerIds));
    await db.delete(adsBudgetPlans).where(inArray(adsBudgetPlans.customerId, createdCustomerIds));
    await db.delete(customers).where(inArray(customers.id, createdCustomerIds));
  }
  await app.close();
});

test("GET /billing/status returns balance and plan", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Billing Test", status: "active" });
  createdCustomerIds.push(customerId);

  const response = await app.inject({
    method: "GET",
    url: "/billing/status",
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { ok: boolean; balanceSek: number; plan: unknown; usage: unknown };
  assert.equal(body.ok, true);
  assert.equal(typeof body.balanceSek, "number");
  assert.equal(body.balanceSek, 0);
  assert.equal(body.plan, null);
  assert.ok(body.usage && typeof (body.usage as { creditsConsumedSek: number }).creditsConsumedSek === "number");
});

test("GET /billing/status with ledger topup and consumption returns correct balanceSek and creditsConsumedSek", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Ledger Test", status: "active" });
  createdCustomerIds.push(customerId);

  await db.insert(customerLedgerEntries).values([
    { customerId, type: "topup", amountSek: "1000", refType: "admin", note: "Test top-up" },
    { customerId, type: "consumption", amountSek: "-100", refType: "system", note: "Burn" },
  ]);

  const response = await app.inject({
    method: "GET",
    url: "/billing/status?preset=last_30_days",
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { ok: boolean; balanceSek: number; usage: { creditsConsumedSek: number } };
  assert.equal(body.ok, true);
  assert.equal(body.balanceSek, 900);
  assert.equal(body.usage.creditsConsumedSek, 100);
});

test("GET /billing/status propagates plan billing_mode", async () => {
  const customerId = randomUUID();
  await db.insert(customers).values({ id: customerId, name: "Plan Test", status: "active" });
  createdCustomerIds.push(customerId);
  await db.insert(adsBudgetPlans).values({
    customerId,
    customerMonthlyPrice: "5000",
    metaMonthlyCap: "1500",
    marginPercent: "70",
    pacing: "daily",
    status: "active",
    billingMode: "impression_based",
    customerCpmSek: "250",
  });

  const response = await app.inject({
    method: "GET",
    url: "/billing/status",
    headers: { "x-customer-id": customerId },
  });

  assert.equal(response.statusCode, 200);
  const body = response.json() as { ok: boolean; plan: { billingMode: string; customerCpmSek: number } };
  assert.equal(body.ok, true);
  assert.ok(body.plan);
  assert.equal(body.plan.billingMode, "impression_based");
  assert.equal(body.plan.customerCpmSek, 250);
});
