import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../lib/db.js";
import { customers, users, onboardingStates, sessions } from "@repo/db/schema";
import { hashPassword, verifyPassword } from "../lib/password.js";

const SESSION_COOKIE = "session";
const SESSION_DAYS = 7;

const signupBody = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
  role: z.string().default("owner"),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function setSessionCookie(
  reply: { setCookie: (name: string, value: string, options: object) => void },
  sessionId: string
): void {
  reply.setCookie(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

function clearSessionCookie(reply: { clearCookie: (name: string, options?: object) => void }): void {
  reply.clearCookie(SESSION_COOKIE, { path: "/" });
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /signup - creates user + org + session
  app.post("/signup", async (request, reply) => {
    const parsed = signupBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    try {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.email, parsed.data.email))
        .limit(1);
      if (existing) {
        return reply.status(400).send({
          error: { code: "VALIDATION_ERROR", message: "Email already registered" },
        });
      }

      const passwordHash = await hashPassword(parsed.data.password);

      const [customer] = await db
        .insert(customers)
        .values({ name: parsed.data.name, status: "active" })
        .returning({ id: customers.id });

      if (!customer) {
        return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create organization" } });
      }

      const [user] = await db
        .insert(users)
        .values({
          customerId: customer.id,
          email: parsed.data.email,
          role: parsed.data.role,
          passwordHash,
        })
        .returning({ id: users.id });

      if (!user) {
        return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create user" } });
      }

      await db.insert(onboardingStates).values({
        customerId: customer.id,
        companyInfoCompleted: false,
        budgetInfoCompleted: false,
      });

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

      const [session] = await db
        .insert(sessions)
        .values({
          userId: user.id,
          customerId: customer.id,
          expiresAt,
        })
        .returning({ id: sessions.id });

      if (!session) {
        return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create session" } });
      }

      setSessionCookie(reply, session.id);

      return reply.status(201).send({
        customerId: customer.id,
        userId: user.id,
        email: parsed.data.email,
      });
    } catch (err) {
      request.log.error(err);
      return reply.status(500).send({
        error: { code: "INTERNAL", message: "Signup failed" },
      });
    }
  });

  // POST /auth/login
  app.post("/auth/login", async (request, reply) => {
    const parsed = loginBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (!user) {
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
    }

    if (!user.passwordHash) {
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Account has no password set. Sign up again or contact support." },
      });
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Invalid email or password" },
      });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        customerId: user.customerId,
        expiresAt,
      })
      .returning({ id: sessions.id });

    if (!session) {
      return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create session" } });
    }

    setSessionCookie(reply, session.id);

    return reply.status(200).send({
      userId: user.id,
      customerId: user.customerId,
      email: user.email,
    });
  });

  // POST /auth/logout
  app.post("/auth/logout", async (_request, reply) => {
    clearSessionCookie(reply);
    return reply.status(200).send({ message: "Logged out" });
  });

  // GET /auth/me - requires valid session cookie
  app.get("/auth/me", async (request, reply) => {
    const sessionId = request.cookies[SESSION_COOKIE];
    if (!sessionId) {
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Not logged in" },
      });
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.id, sessionId),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!session) {
      clearSessionCookie(reply);
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "Session expired" },
      });
    }

    const [user] = await db
      .select({ id: users.id, email: users.email, customerId: users.customerId })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user) {
      clearSessionCookie(reply);
      return reply.status(401).send({
        error: { code: "UNAUTHORIZED", message: "User not found" },
      });
    }

    return reply.send({
      userId: user.id,
      customerId: user.customerId,
      email: user.email,
    });
  });
}
