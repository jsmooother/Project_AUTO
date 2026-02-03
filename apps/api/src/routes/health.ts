import type { FastifyInstance } from "fastify";
import { sql } from "drizzle-orm";
import { db } from "../lib/db.js";
import { Redis } from "ioredis";

const DB_CHECK_TIMEOUT_MS = 1000;
const REDIS_CHECK_TIMEOUT_MS = 1000;

/**
 * Wraps a promise with a timeout.
 * Returns false if timeout is exceeded or promise rejects.
 */
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | false> {
  return Promise.race([
    promise,
    new Promise<false>((resolve) => {
      setTimeout(() => resolve(false), timeoutMs);
    }),
  ]);
}

/**
 * Checks database connectivity with timeout.
 * Never throws - always returns boolean.
 */
async function checkDatabase(): Promise<boolean> {
  try {
    const result = await withTimeout(db.execute(sql`SELECT 1`), DB_CHECK_TIMEOUT_MS);
    return result !== false;
  } catch {
    // Catch any unexpected errors (shouldn't happen with withTimeout, but be safe)
    return false;
  }
}

/**
 * Checks Redis connectivity with timeout.
 * Never throws - always returns boolean.
 */
async function checkRedis(): Promise<boolean> {
  let redis: Redis | null = null;
  try {
    const url = process.env["REDIS_URL"];
    redis = url
      ? new Redis(url, {
          maxRetriesPerRequest: 1,
          connectTimeout: REDIS_CHECK_TIMEOUT_MS,
          lazyConnect: false,
          enableReadyCheck: false,
        })
      : new Redis({
          host: "localhost",
          port: 6379,
          maxRetriesPerRequest: 1,
          connectTimeout: REDIS_CHECK_TIMEOUT_MS,
          lazyConnect: false,
          enableReadyCheck: false,
        });

    if (!redis) return false;

    // Use timeout wrapper for ping
    const pingResult = await withTimeout(redis.ping(), REDIS_CHECK_TIMEOUT_MS);
    if (pingResult === false) {
      return false;
    }

    // Clean up connection
    await redis.quit().catch(() => {
      // Ignore quit errors
    });
    return true;
  } catch {
    // Catch any unexpected errors
    if (redis) {
      try {
        await redis.quit().catch(() => {
          // Ignore quit errors
        });
      } catch {
        // Ignore cleanup errors
      }
    }
    return false;
  }
}

/**
 * Health check endpoint.
 * Never throws - always returns a response with status 200 or 503.
 */
export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (_request, reply) => {
    try {
      // Run checks in parallel for faster response
      const [dbOk, redisOk] = await Promise.all([checkDatabase(), checkRedis()]);
      const ok = dbOk && redisOk;

      const statusCode = ok ? 200 : 503;
      return reply.status(statusCode).send({
        ok,
        db: dbOk,
        redis: redisOk,
      });
    } catch (error) {
      // This should never happen, but catch everything just in case
      // Log error for debugging but don't crash
      _request.log?.error({ err: error }, "Unexpected error in health check");
      return reply.status(503).send({
        ok: false,
        db: false,
        redis: false,
      });
    }
  });
}
