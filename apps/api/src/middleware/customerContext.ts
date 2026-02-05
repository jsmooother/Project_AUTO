import type { FastifyRequest, FastifyReply } from "fastify";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../lib/db.js";
import { sessions, users } from "@repo/db/schema";

const CUSTOMER_ID_HEADER = "x-customer-id";
const USER_ID_HEADER = "x-user-id";
const SESSION_COOKIE = "session";

export type CustomerContext = {
  customerId: string;
  userId?: string;
};

declare module "fastify" {
  interface FastifyRequest {
    customer: CustomerContext;
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function clearSessionCookie(reply: FastifyReply): void {
  reply.clearCookie(SESSION_COOKIE, {
    path: "/",
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
  });
}

/**
 * requireCustomerSession: Enforces session cookie + x-customer-id header match.
 * Validates session exists/active, extracts customerId from session, compares to header.
 * Returns 401 if no session, 403 if mismatch.
 */
export async function requireCustomerSession(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
): Promise<void> {
  try {
    // 1) Read session cookie
    const sessionId = request.cookies[SESSION_COOKIE];
    if (!sessionId || typeof sessionId !== "string") {
      reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Missing session cookie", hint: "Log in to continue." },
      });
      return done();
    }

    // 2) Validate session exists/active (same mechanism as GET /auth/me)
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
      .limit(1);

    if (!session) {
      clearSessionCookie(reply);
      reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Session expired or invalid", hint: "Log in again to continue." },
      });
      return done();
    }

    // 3) Get user to extract customerId from session
    const [user] = await db
      .select({ id: users.id, customerId: users.customerId })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      clearSessionCookie(reply);
      reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "User not found", hint: "Log in again to continue." },
      });
      return done();
    }

    const sessionCustomerId = user.customerId;

    // 4) Read and validate x-customer-id header
    const raw = request.headers[CUSTOMER_ID_HEADER];
    const headerCustomerId = Array.isArray(raw) ? raw[0] : raw;
    if (!headerCustomerId || !UUID_REGEX.test(headerCustomerId)) {
      reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Missing or invalid x-customer-id header (UUID required)" },
      });
      return done();
    }

    // 5) Compare session customerId to header customerId
    if (sessionCustomerId !== headerCustomerId) {
      reply.status(403).send({
        error: {
          code: "FORBIDDEN",
          message: "Session customerId does not match x-customer-id header",
          hint: "You can only access resources for your own account. Ensure the x-customer-id header matches your logged-in account.",
        },
      });
      return done();
    }

    // Success: set customer context
    const userIdRaw = request.headers[USER_ID_HEADER];
    const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;
    request.customer = { customerId: sessionCustomerId, userId };
    done();
  } catch (err) {
    done(err instanceof Error ? err : new Error(String(err)));
  }
}

/**
 * Legacy function kept for backward compatibility (if needed).
 * @deprecated Use requireCustomerSession instead.
 */
export function requireCustomerContext(
  request: FastifyRequest,
  reply: FastifyReply,
  done: (err?: Error) => void
): void {
  const raw = request.headers[CUSTOMER_ID_HEADER];
  const customerId = Array.isArray(raw) ? raw[0] : raw;
  if (!customerId || !UUID_REGEX.test(customerId)) {
    reply.status(401).send({
      error: { code: "UNAUTHORIZED", message: "Missing or invalid x-customer-id header (UUID required)" },
    });
    return done();
  }
  const userIdRaw = request.headers[USER_ID_HEADER];
  const userId = Array.isArray(userIdRaw) ? userIdRaw[0] : userIdRaw;
  request.customer = { customerId, userId };
  done();
}
