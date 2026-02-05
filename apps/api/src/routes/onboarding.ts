import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../lib/db.js";
import { onboardingStates, inventorySources } from "@repo/db/schema";

const companyBody = z.object({
  companyName: z.string().min(1),
  companyWebsite: z.string().optional(),
});

// Normalize website URL: accepts short URLs like "ivarsbil.se" and formats them
function normalizeWebsiteUrl(raw: string): { url: string } | { error: string; hint: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { error: "Website URL is required.", hint: "Enter a valid URL (e.g. https://example.com)." };
  }
  let url = trimmed;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        error: "Only http and https URLs are allowed.",
        hint: "Use a URL that starts with https:// or http://.",
      };
    }
    return { url: parsed.href };
  } catch {
    return {
      error: "Invalid URL format.",
      hint: "Enter a valid URL (e.g. https://example.com or example.com).",
    };
  }
}

// Validate URL by checking if it's reachable (try https first, then http)
async function validateWebsiteUrl(url: string): Promise<{ valid: boolean; finalUrl?: string; error?: string }> {
  try {
    const parsed = new URL(url);
    const protocols = parsed.protocol === "https:" ? ["https:", "http:"] : ["http:", "https:"];
    
    for (const protocol of protocols) {
      const testUrl = `${protocol}//${parsed.host}${parsed.pathname}${parsed.search}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(testUrl, {
          method: "HEAD",
          signal: controller.signal,
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; ProjectAuto/1.0)",
          },
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status < 500) {
          return { valid: true, finalUrl: testUrl };
        }
      } catch (err) {
        clearTimeout(timeoutId);
        // Try next protocol
        continue;
      }
    }
    
    return { valid: false, error: "Website is not reachable" };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

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
        error: "VALIDATION_ERROR",
        message: parsed.error.message,
      });
    }

    let normalizedWebsiteUrl: string | null = null;
    let websiteConnected = false;

    // If website URL is provided, normalize and validate it
    if (parsed.data.companyWebsite) {
      const normalized = normalizeWebsiteUrl(parsed.data.companyWebsite);
      if ("error" in normalized) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          message: normalized.error,
          hint: normalized.hint,
        });
      }

      // Validate URL is reachable
      const validation = await validateWebsiteUrl(normalized.url);
      if (!validation.valid) {
        return reply.status(400).send({
          error: "VALIDATION_ERROR",
          message: validation.error ?? "Website URL is not reachable",
          hint: "Please check the URL and try again. Make sure the website is accessible.",
        });
      }

      normalizedWebsiteUrl = validation.finalUrl ?? normalized.url;

      // Automatically connect the website by creating/updating inventory source
      try {
        const [existingSource] = await db
          .select()
          .from(inventorySources)
          .where(eq(inventorySources.customerId, customerId))
          .limit(1);

        if (existingSource) {
          await db
            .update(inventorySources)
            .set({
              websiteUrl: normalizedWebsiteUrl,
              status: "active",
            })
            .where(eq(inventorySources.id, existingSource.id));
        } else {
          await db.insert(inventorySources).values({
            customerId,
            websiteUrl: normalizedWebsiteUrl,
            status: "active",
          });
        }
        websiteConnected = true;
      } catch (err) {
        // Log error but don't fail the onboarding - website connection is optional
        request.log.warn({ err, customerId, websiteUrl: normalizedWebsiteUrl }, "Failed to auto-connect website");
      }
    }

    const [updated] = await db
      .update(onboardingStates)
      .set({
        companyInfoCompleted: true,
        companyName: parsed.data.companyName,
        companyWebsite: normalizedWebsiteUrl,
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
      websiteConnected,
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
