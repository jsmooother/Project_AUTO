import Fastify from "fastify";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@repo/db";
import { customers, inventorySources, inventoryItems, metaConnections } from "@repo/db/schema";
import { requireCustomerContext } from "../src/middleware/customerContext.js";
import { adsRoutes } from "../src/routes/ads.js";

let app: ReturnType<typeof Fastify>;

const createdCustomerIds: string[] = [];
const createdSourceIds: string[] = [];
const createdItemIds: string[] = [];
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
  // Cleanup
  if (createdItemIds.length > 0) {
    await db.delete(inventoryItems).where(eq(inventoryItems.customerId, createdCustomerIds[0]));
  }
  if (createdSourceIds.length > 0) {
    await db.delete(inventorySources).where(eq(inventorySources.customerId, createdCustomerIds[0]));
  }
  if (createdMetaConnectionIds.length > 0) {
    await db.delete(metaConnections).where(eq(metaConnections.customerId, createdCustomerIds[0]));
  }
  if (createdCustomerIds.length > 0) {
    await db.delete(customers).where(eq(customers.id, createdCustomerIds[0]));
  }
  await app.close();
});

test("GET /ads/publish-preview returns ok=false with hint when no items", async () => {
  const customerId = randomUUID();
  createdCustomerIds.push(customerId);

  // Create customer
  await db.insert(customers).values({
    id: customerId,
    name: "Test Customer",
    status: "active",
  });

  const response = await app.inject({
    method: "GET",
    url: "/ads/publish-preview",
    headers: {
      "x-customer-id": customerId,
    },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, false);
  assert.ok(body.hint);
  assert.ok(body.hint.includes("No valid inventory items"));
});

test("GET /ads/publish-preview returns ok=false when QA gate fails", async () => {
  const customerId = randomUUID();
  createdCustomerIds.push(customerId);

  // Create customer
  await db.insert(customers).values({
    id: customerId,
    name: "Test Customer",
    status: "active",
  });

  // Create inventory source
  const [source] = await db
    .insert(inventorySources)
    .values({
      customerId,
      websiteUrl: "https://example.com",
      status: "active",
    })
    .returning({ id: inventorySources.id });
  if (source) createdSourceIds.push(source.id);

  // Create invalid items (missing price, missing image, etc.)
  for (let i = 0; i < 10; i++) {
    const [item] = await db
      .insert(inventoryItems)
      .values({
        customerId,
        inventorySourceId: source?.id ?? "",
        title: `Item ${i}`,
        url: `https://example.com/item-${i}`,
        price: null, // Invalid: no price
        detailsJson: {
          title: `Item ${i}`,
          // Missing priceAmount, images, etc.
        },
        firstSeenAt: new Date(),
      })
      .returning({ id: inventoryItems.id });
    if (item) createdItemIds.push(item.id);
  }

  const response = await app.inject({
    method: "GET",
    url: "/ads/publish-preview",
    headers: {
      "x-customer-id": customerId,
    },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, false);
  assert.ok(body.qaGate);
  assert.ok(body.qaGate.invalidRate > 0.3); // Should fail QA gate
  assert.ok(body.hint);
  assert.ok(body.hint.includes("quality too low") || body.hint.includes("Scrape quality"));
});

test("GET /ads/publish-preview returns ok=true with projected items when valid", async () => {
  const customerId = randomUUID();
  createdCustomerIds.push(customerId);

  // Create customer
  await db.insert(customers).values({
    id: customerId,
    name: "Test Customer",
    status: "active",
  });

  // Create inventory source
  const [source] = await db
    .insert(inventorySources)
    .values({
      customerId,
      websiteUrl: "https://example.com",
      status: "active",
    })
    .returning({ id: inventorySources.id });
  if (source) createdSourceIds.push(source.id);

  // Create valid items for QA gate (10 items)
  for (let i = 0; i < 10; i++) {
    const [item] = await db
      .insert(inventoryItems)
      .values({
        customerId,
        inventorySourceId: source?.id ?? "",
        title: `Valid Item ${i}`,
        url: `https://example.com/item-${i}`,
        price: 100000, // Valid: >= 50k
        detailsJson: {
          title: `Valid Item ${i}`,
          priceAmount: 100000,
          currency: "SEK",
          primaryImageUrl: `https://example.com/image-${i}.jpg`,
        },
        firstSeenAt: new Date(),
      })
      .returning({ id: inventoryItems.id });
    if (item) createdItemIds.push(item.id);
  }

  // Create 2 valid items for projection
  for (let i = 0; i < 2; i++) {
    const [item] = await db
      .insert(inventoryItems)
      .values({
        customerId,
        inventorySourceId: source?.id ?? "",
        title: `Project Item ${i}`,
        url: `https://example.com/project-${i}`,
        price: 150000,
        detailsJson: {
          title: `Project Item ${i}`,
          priceAmount: 150000,
          currency: "SEK",
          primaryImageUrl: `https://example.com/project-${i}.jpg`,
        },
        firstSeenAt: new Date(Date.now() + i * 1000), // Ensure they're latest
      })
      .returning({ id: inventoryItems.id });
    if (item) createdItemIds.push(item.id);
  }

  const response = await app.inject({
    method: "GET",
    url: "/ads/publish-preview",
    headers: {
      "x-customer-id": customerId,
    },
  });

  assert.equal(response.statusCode, 200);
  const body = JSON.parse(response.body);
  assert.equal(body.ok, true);
  assert.ok(body.qaGate);
  assert.ok(body.qaGate.invalidRate <= 0.3); // Should pass QA gate
  assert.ok(Array.isArray(body.projectedItems));
  assert.ok(body.projectedItems.length > 0);
  assert.ok(body.projectedItems.length <= 2);
  
  // Verify projected item structure
  const item = body.projectedItems[0];
  assert.ok(item.title);
  assert.ok(item.priceAmount >= 50000);
  assert.ok(item.currency);
  assert.ok(item.imageUrl);
  assert.ok(item.destinationUrl);
  assert.ok(item.vehicleId);
});
