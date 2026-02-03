import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "../lib/db.js";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Redis = require("ioredis");

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  let redis: { ping: () => Promise<string>; quit: () => Promise<string> } | null = null;
  try {
    // Parse REDIS_URL to get connection options
    const url = process.env["REDIS_URL"];
    if (url) {
      redis = new Redis(url, { maxRetriesPerRequest: 1, connectTimeout: 1000 });
    } else {
      redis = new Redis({ host: "localhost", port: 6379, maxRetriesPerRequest: 1, connectTimeout: 1000 });
    }
    if (!redis) return false;
    await redis.ping();
    await redis.quit();
    return true;
  } catch {
    if (redis) {
      try {
        await redis.quit();
      } catch {
        // Ignore quit errors
      }
    }
    return false;
  }
}

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    const dbOk = await checkDatabase();
    const redisOk = await checkRedis();
    const ok = dbOk && redisOk;
    
    const statusCode = ok ? 200 : 503;
    return reply.status(statusCode).send({
      ok,
      db: dbOk,
      redis: redisOk,
    });
  });
}
