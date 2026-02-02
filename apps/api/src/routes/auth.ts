import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { customers, users, onboardingStates } from "@repo/db/schema";

const signupBody = z.object({
  email: z.string().email(),
  name: z.string().min(1), // Organization name
  role: z.string().default("owner"),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /signup - creates user + org + initial onboarding state
  // This endpoint does NOT require customer context
  app.post("/signup", async (request, reply) => {
    const parsed = signupBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    try {
      // Create customer (organization)
      const [customer] = await db
        .insert(customers)
        .values({
          name: parsed.data.name,
          status: "active",
        })
        .returning({ id: customers.id });

      if (!customer) {
        return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create organization" } });
      }

      // Create user
      const [user] = await db
        .insert(users)
        .values({
          customerId: customer.id,
          email: parsed.data.email,
          role: parsed.data.role,
        })
        .returning({ id: users.id });

      if (!user) {
        return reply.status(500).send({ error: { code: "INTERNAL", message: "Failed to create user" } });
      }

      // Create initial onboarding state
      await db.insert(onboardingStates).values({
        customerId: customer.id,
        companyInfoCompleted: false,
        budgetInfoCompleted: false,
      });

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
}
