import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { onboardingStates } from "@repo/db/schema";

const companyBody = z.object({
  companyName: z.string().min(1),
  companyWebsite: z.string().url().optional(),
});

const budgetBody = z.object({
  monthlyBudgetAmount: z.number().positive(),
  budgetCurrency: z.string().default("USD"),
});

// Helper function to compute onboarding status
function computeStatus(companyInfoCompleted: boolean, budgetInfoCompleted: boolean): string {
  if (companyInfoCompleted && budgetInfoCompleted) {
    return "completed";
  } else if (companyInfoCompleted || budgetInfoCompleted) {
    return "in_progress";
  } else {
    return "not_started";
  }
}

export async function onboardingRoutes(app: FastifyInstance): Promise<void> {
  // POST /onboarding/company - updates company info step
  app.post("/onboarding/company", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = companyBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    const [updated] = await db
      .update(onboardingStates)
      .set({
        companyInfoCompleted: true,
        companyName: parsed.data.companyName,
        companyWebsite: parsed.data.companyWebsite ?? null,
        updatedAt: new Date(),
      })
      .where(eq(onboardingStates.customerId, customerId))
      .returning();

    if (!updated) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: "Onboarding state not found" },
      });
    }

    return reply.send({
      companyInfoCompleted: updated.companyInfoCompleted,
      companyName: updated.companyName,
      companyWebsite: updated.companyWebsite,
      status: computeStatus(updated.companyInfoCompleted, updated.budgetInfoCompleted),
    });
  });

  // POST /onboarding/budget - updates budget info step
  app.post("/onboarding/budget", async (request, reply) => {
    const customerId = request.customer.customerId;
    const parsed = budgetBody.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: { code: "VALIDATION_ERROR", message: parsed.error.message },
      });
    }

    const [updated] = await db
      .update(onboardingStates)
      .set({
        budgetInfoCompleted: true,
        monthlyBudgetAmount: parsed.data.monthlyBudgetAmount.toString(),
        budgetCurrency: parsed.data.budgetCurrency,
        updatedAt: new Date(),
      })
      .where(eq(onboardingStates.customerId, customerId))
      .returning();

    if (!updated) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: "Onboarding state not found" },
      });
    }

    return reply.send({
      budgetInfoCompleted: updated.budgetInfoCompleted,
      monthlyBudgetAmount: updated.monthlyBudgetAmount,
      budgetCurrency: updated.budgetCurrency,
      status: computeStatus(updated.companyInfoCompleted, updated.budgetInfoCompleted),
    });
  });

  // GET /onboarding/status - returns onboarding status
  app.get("/onboarding/status", async (request, reply) => {
    const customerId = request.customer.customerId;

    const [state] = await db
      .select()
      .from(onboardingStates)
      .where(eq(onboardingStates.customerId, customerId))
      .limit(1);

    if (!state) {
      return reply.status(404).send({
        error: { code: "NOT_FOUND", message: "Onboarding state not found" },
      });
    }

    const status = computeStatus(state.companyInfoCompleted, state.budgetInfoCompleted);

    return reply.send({
      status,
      companyInfoCompleted: state.companyInfoCompleted,
      budgetInfoCompleted: state.budgetInfoCompleted,
      companyName: state.companyName,
      companyWebsite: state.companyWebsite,
      monthlyBudgetAmount: state.monthlyBudgetAmount,
      budgetCurrency: state.budgetCurrency,
    });
  });
}
