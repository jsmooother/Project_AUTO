import { eq, and } from "drizzle-orm";
import { db } from "../lib/db.js";
import {
  adSettings,
  adRuns,
  metaAdObjects,
  metaConnections,
  adTemplateConfigs,
  approvals,
  adPreviews,
  inventorySources,
  adsBudgetPlans,
  onboardingStates,
} from "@repo/db/schema";
import type { QueuedJob } from "@repo/queue";
import { metaPost, type MetaGraphError } from "../lib/metaGraph.js";

/**
 * ADS_PUBLISH job: Campaign publish
 * 
 * Additional validation:
 * - ad_settings exists
 * - geo config valid
 * - at least one format enabled
 * - meta_connections connected with selected_ad_account_id (for real mode)
 * 
 * Execution modes:
 * 1. Real mode (ALLOW_REAL_META_WRITE=true):
 *    - Create PAUSED campaign in Meta
 *    - Create PAUSED adset with simple targeting
 *    - Store real Meta IDs
 * 2. Dev sim mode (ALLOW_DEV_ADS_PUBLISH_SIM=true):
 *    - Write placeholder Meta IDs
 * 3. Disabled: Fail with error
 */
export async function processAdsPublish(job: QueuedJob<Record<string, never>>): Promise<void> {
  const { payload, correlation } = job;
  const { customerId, runId } = correlation;

  if (!customerId || !runId) {
    const msg = "Missing correlation: customerId and runId required";
    await job.deadLetter(msg);
    return;
  }

  const allowRealWrite = process.env["ALLOW_REAL_META_WRITE"] === "true";
  const allowDevPublish = process.env["ALLOW_DEV_ADS_PUBLISH_SIM"] === "true";
  const now = new Date();

  try {
    console.log(JSON.stringify({ event: "ads_publish_job_start", runId, customerId, mode: allowRealWrite ? "real" : allowDevPublish ? "sim" : "disabled" }));
    await db
      .update(adRuns)
      .set({ status: "running", startedAt: now })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

    // Validation: ad_settings exists
    const [settings] = await db
      .select()
      .from(adSettings)
      .where(eq(adSettings.customerId, customerId))
      .limit(1);

    if (!settings) {
      const msg = "Ad settings not found. Configure ads settings first.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Validation: geo config valid
    if (settings.geoMode === "radius") {
      if (!settings.geoCenterText || !settings.geoRadiusKm) {
        const msg = "Invalid geo config: radius mode requires center and radius";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }
    } else if (settings.geoMode === "regions") {
      if (!settings.geoRegionsJson || !Array.isArray(settings.geoRegionsJson) || (settings.geoRegionsJson as unknown[]).length === 0) {
        const msg = "Invalid geo config: regions mode requires at least one region";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }
    }

    // Validation: at least one format enabled
    const formats = (settings.formatsJson as unknown[]) || [];
    if (!Array.isArray(formats) || formats.length === 0) {
      const msg = "No ad formats enabled. Enable at least one format in settings.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    // Pricing & spend: load or seed ads_budget_plans (internal only)
    let [budgetPlan] = await db
      .select()
      .from(adsBudgetPlans)
      .where(eq(adsBudgetPlans.customerId, customerId))
      .limit(1);

    if (!budgetPlan) {
      const [onboarding] = await db
        .select({ monthlyBudgetAmount: onboardingStates.monthlyBudgetAmount })
        .from(onboardingStates)
        .where(eq(onboardingStates.customerId, customerId))
        .limit(1);

      const customerMonthlyPrice = onboarding?.monthlyBudgetAmount
        ? parseFloat(String(onboarding.monthlyBudgetAmount))
        : null;
      if (customerMonthlyPrice != null && customerMonthlyPrice > 0) {
        const metaMonthlyCap = customerMonthlyPrice * 0.3;
        const marginPercent = 70;
        await db.insert(adsBudgetPlans).values({
          customerId,
          customerMonthlyPrice: String(customerMonthlyPrice),
          metaMonthlyCap: String(metaMonthlyCap),
          marginPercent: String(marginPercent),
          pacing: "daily",
          status: "active",
        });
        [budgetPlan] = await db
          .select()
          .from(adsBudgetPlans)
          .where(eq(adsBudgetPlans.customerId, customerId))
          .limit(1);
      }
    }

    if (!budgetPlan) {
      const msg = "Pricing plan missing for customer.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: `CONFIG_ERROR: ${msg}` })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    if (budgetPlan.status === "paused") {
      const msg = "Ads are paused for this customer. Update budget plan in admin to resume.";
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    const customerPrice = parseFloat(String(budgetPlan.customerMonthlyPrice));
    const metaSpendCap = parseFloat(String(budgetPlan.metaMonthlyCap));
    const dailyMetaBudget = metaSpendCap / 30;
    const derivedDailyBudgetCents = Math.floor(dailyMetaBudget * 100);
    const minDailyBudgetCentsRaw = parseInt(process.env["META_MIN_DAILY_BUDGET_CENTS"] ?? "100", 10);
    const minDailyBudgetCents = Number.isFinite(minDailyBudgetCentsRaw) ? minDailyBudgetCentsRaw : 100;

    if (!Number.isFinite(derivedDailyBudgetCents) || derivedDailyBudgetCents <= 0 || derivedDailyBudgetCents < minDailyBudgetCents) {
      const msg = `Derived daily budget is too low (${derivedDailyBudgetCents} cents). Increase monthly budget or adjust META_MIN_DAILY_BUDGET_CENTS.`;
      await db
        .update(adRuns)
        .set({ status: "failed", finishedAt: new Date(), errorMessage: `CONFIG_ERROR: ${msg}` })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
      await job.deadLetter(msg);
      return;
    }

    console.log(
      JSON.stringify({
        event: "ads_publish_budget",
        runId,
        customerId,
        customer_price: customerPrice,
        meta_spend_cap: metaSpendCap,
        derived_daily_budget: dailyMetaBudget,
        derived_daily_budget_cents: derivedDailyBudgetCents,
      })
    );

    // Mode check: real write mode
    if (allowRealWrite) {
      // Validation: meta_connections with selected_ad_account_id
      const [metaConn] = await db
        .select()
        .from(metaConnections)
        .where(and(eq(metaConnections.customerId, customerId), eq(metaConnections.status, "connected")))
        .limit(1);

      if (!metaConn) {
        const msg = "Meta connection not found or not connected. Connect Meta account first.";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }

      if (!metaConn.selectedAdAccountId) {
        const msg = "No ad account selected. Select an ad account in Settings → Meta.";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }

      if (!metaConn.accessToken || metaConn.accessToken === "dev-token-placeholder") {
        const msg = "Invalid Meta access token. Reconnect Meta account.";
        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
        await job.deadLetter(msg);
        return;
      }

      const adAccountId = metaConn.selectedAdAccountId;
      const accessToken = metaConn.accessToken;
      const actId = adAccountId.replace("act_", "");

      // Load existing meta_ad_objects (Step 3 may have already run)
      const [existingObjects] = await db
        .select()
        .from(metaAdObjects)
        .where(eq(metaAdObjects.customerId, customerId))
        .limit(1);

      let campaignId: string | null = existingObjects?.campaignId ?? null;
      let adsetId: string | null = existingObjects?.adsetId ?? null;

      const upsertObjects = async (updates: {
        campaignId?: string | null;
        adsetId?: string | null;
        creativeId?: string | null;
        adId?: string | null;
        status?: string;
        lastPublishStep?: string | null;
        lastPublishError?: string | null;
      }) => {
        const set = {
          ...updates,
          lastSyncedAt: now,
          updatedAt: now,
        };
        const [updated] = await db
          .update(metaAdObjects)
          .set(set)
          .where(eq(metaAdObjects.customerId, customerId))
          .returning({ id: metaAdObjects.id });
        if (!updated) {
          await db.insert(metaAdObjects).values({
            customerId,
            campaignId: updates.campaignId ?? null,
            adsetId: updates.adsetId ?? null,
            creativeId: updates.creativeId ?? null,
            adId: updates.adId ?? null,
            status: updates.status ?? "paused",
            lastPublishStep: updates.lastPublishStep ?? null,
            lastPublishError: updates.lastPublishError ?? null,
            lastSyncedAt: now,
            updatedAt: now,
          });
        }
      };

      try {
        // Step 3: Create campaign + adset if missing (use budget plan cap for Meta spend)
        if (!campaignId || !adsetId) {
          const campaignPath = `/act_${actId}/campaigns`;
          const campaignBodyBase: Record<string, unknown> = {
            name: "Project Auto - Test Campaign",
            status: "PAUSED",
            special_ad_categories: [],
          };

          for (const objective of ["OUTCOME_SALES", "OUTCOME_LEADS"] as const) {
            try {
              const campaignRes = (await metaPost(campaignPath, accessToken, { ...campaignBodyBase, objective })) as { id?: string };
              if (campaignRes?.id) {
                campaignId = campaignRes.id;
                if (objective === "OUTCOME_LEADS") {
                  console.log(JSON.stringify({ event: "objective_fallback", runId, customerId, attempted: "OUTCOME_SALES", used: "OUTCOME_LEADS" }));
                }
                break;
              }
            } catch (campaignErr) {
              const isObjectiveError =
                campaignErr &&
                typeof campaignErr === "object" &&
                "code" in campaignErr &&
                (campaignErr as { code?: number }).code === 100 &&
                typeof (campaignErr as { message?: string }).message === "string" &&
                ((campaignErr as { message?: string }).message ?? "").toLowerCase().includes("objective");
              if (objective === "OUTCOME_SALES" && isObjectiveError) {
                console.log(JSON.stringify({ event: "objective_fallback", runId, customerId, attempted: "OUTCOME_SALES", retrying: "OUTCOME_LEADS" }));
                continue;
              }
              throw campaignErr;
            }
          }

          if (!campaignId) throw new Error("Campaign creation failed: No ID returned");
          console.log(JSON.stringify({ event: "meta_campaign_created", runId, customerId, campaignId }));

          const adsetPath = `/act_${actId}/adsets`;
          const adsetBody: Record<string, unknown> = {
            name: "Project Auto - Test Ad Set",
            campaign_id: campaignId,
            status: "PAUSED",
            billing_event: "IMPRESSIONS",
            optimization_goal: "OFFSITE_CONVERSIONS",
            daily_budget: derivedDailyBudgetCents,
            targeting: { geo_locations: { countries: ["SE"] } },
          };

          const adsetRes = (await metaPost(adsetPath, accessToken, adsetBody)) as { id?: string };
          if (!adsetRes.id) {
            try {
              await metaPost(`/${campaignId}`, accessToken, { status: "DELETED" });
            } catch (deleteErr) {
              console.log(JSON.stringify({ event: "meta_campaign_cleanup_failed", runId, customerId, campaignId, error: String(deleteErr) }));
            }
            throw new Error("Adset creation failed: No ID returned");
          }
          adsetId = adsetRes.id;
          console.log(JSON.stringify({ event: "meta_adset_created", runId, customerId, campaignId, adsetId }));

          await upsertObjects({ campaignId, adsetId, status: "paused", lastPublishStep: "adset", lastPublishError: null });
        }

        // Step 4: Ad Creative + Ad (prereqs: template approved + at least one preview; inventory can be stub)
        const pageId = process.env["META_PAGE_ID"];
        if (!pageId) {
          const msg = "META_PAGE_ID is required for creating ad creative. Set it in the worker environment.";
          await db
            .update(metaAdObjects)
            .set({ lastPublishError: msg, updatedAt: now })
            .where(eq(metaAdObjects.customerId, customerId));
          await db
            .update(adRuns)
            .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
            .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
          await job.deadLetter(msg);
          return;
        }

        const [approval] = await db
          .select({ templateConfigId: approvals.templateConfigId })
          .from(approvals)
          .where(eq(approvals.customerId, customerId))
          .limit(1);

        if (!approval) {
          const msg = "Template config must be approved before publishing. Approve your template first.";
          await db
            .update(metaAdObjects)
            .set({ lastPublishError: msg, updatedAt: now })
            .where(eq(metaAdObjects.customerId, customerId));
          await db
            .update(adRuns)
            .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
            .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
          await job.deadLetter(msg);
          return;
        }

        const [config] = await db
          .select({ brandName: adTemplateConfigs.brandName })
          .from(adTemplateConfigs)
          .where(eq(adTemplateConfigs.id, approval.templateConfigId))
          .limit(1);

        const previewCount = await db
          .select()
          .from(adPreviews)
          .where(
            and(eq(adPreviews.customerId, customerId), eq(adPreviews.templateConfigId, approval.templateConfigId))
          )
          .limit(1);
        if (previewCount.length === 0) {
          const msg = "At least one template preview must exist. Run a preview first.";
          await db
            .update(metaAdObjects)
            .set({ lastPublishError: msg, updatedAt: now })
            .where(eq(metaAdObjects.customerId, customerId));
          await db
            .update(adRuns)
            .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
            .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
          await job.deadLetter(msg);
          return;
        }

        let destinationUrl: string | undefined = process.env["META_DESTINATION_URL"];
        if (!destinationUrl) {
          const [source] = await db
            .select({ websiteUrl: inventorySources.websiteUrl })
            .from(inventorySources)
            .where(eq(inventorySources.customerId, customerId))
            .limit(1);
          destinationUrl = source?.websiteUrl ?? undefined;
        }
        if (!destinationUrl) {
          const msg = "Set META_DESTINATION_URL or connect a website (inventory source) for the ad link.";
          await db
            .update(metaAdObjects)
            .set({ lastPublishError: msg, updatedAt: now })
            .where(eq(metaAdObjects.customerId, customerId));
          await db
            .update(adRuns)
            .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
            .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
          await job.deadLetter(msg);
          return;
        }

        const message = config?.brandName ?? "New arrivals";

        // Create Ad Creative (link ad)
        const creativePath = `/act_${actId}/adcreatives`;
        const creativeBody: Record<string, unknown> = {
          name: "Project Auto - Test Creative",
          object_story_spec: {
            page_id: pageId,
            link_data: {
              link: destinationUrl,
              message,
              call_to_action: { type: "LEARN_MORE", value: { link: destinationUrl } },
            },
          },
        };

        const creativeRes = (await metaPost(creativePath, accessToken, creativeBody)) as { id?: string };
        if (!creativeRes.id) throw new Error("Ad creative creation failed: No ID returned");
        const creativeId = creativeRes.id;
        console.log(JSON.stringify({ event: "meta_creative_created", runId, customerId, creativeId }));

        await upsertObjects({ creativeId, lastPublishStep: "creative", lastPublishError: null });

        // Create Ad (PAUSED)
        const adsPath = `/act_${actId}/ads`;
        const adBody: Record<string, unknown> = {
          name: "Project Auto - Test Ad",
          adset_id: adsetId,
          creative: { creative_id: creativeId },
          status: "PAUSED",
        };

        const adRes = (await metaPost(adsPath, accessToken, adBody)) as { id?: string };
        if (!adRes.id) throw new Error("Ad creation failed: No ID returned");
        const adId = adRes.id;
        console.log(JSON.stringify({ event: "meta_ad_created", runId, customerId, adId }));

        await upsertObjects({ adId, lastPublishStep: "ad", lastPublishError: null });

        await db
          .update(adSettings)
          .set({ status: "active", lastPublishedAt: now, lastError: null, updatedAt: now })
          .where(eq(adSettings.customerId, customerId));

        await db
          .update(adRuns)
          .set({ status: "success", finishedAt: new Date() })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

        console.log(JSON.stringify({ event: "ads_publish_job_finish", runId, customerId, status: "success", mode: "real", campaignId, adsetId, creativeId, adId }));
        await job.ack();
        return;
      } catch (err) {
        let errorMessage = err instanceof Error ? err.message : String(err);
        let errorHint = "Check Meta API response and permissions.";

        if (err && typeof err === "object" && "message" in err && "hint" in err) {
          const metaErr = err as MetaGraphError;
          errorMessage = metaErr.message;
          errorHint = metaErr.hint;
          const code = metaErr.code;
          const sub = metaErr.error_subcode;
          const storedMessage =
            code != null ? `${code}${sub != null ? ` (sub ${sub})` : ""}: ${errorMessage}` : errorMessage;
          errorMessage = storedMessage;
          const lowerMsg = (metaErr.message || "").toLowerCase();
          if (lowerMsg.includes("ad account") || lowerMsg.includes("adaccount") || lowerMsg.includes("act_")) {
            errorHint = "Re-select ad account in Settings.";
          }
        }

        const fullError = `${errorMessage}. ${errorHint}`.trim();

        await db
          .update(metaAdObjects)
          .set({ status: "error", lastPublishError: fullError, updatedAt: now })
          .where(eq(metaAdObjects.customerId, customerId));

        await db
          .update(adSettings)
          .set({ status: "error", lastError: fullError, updatedAt: now })
          .where(eq(adSettings.customerId, customerId));

        await db
          .update(adRuns)
          .set({ status: "failed", finishedAt: new Date(), errorMessage: fullError })
          .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

        console.log(JSON.stringify({ event: "ads_publish_job_finish", runId, customerId, status: "failed", mode: "real", error: errorMessage }));
        await job.deadLetter(fullError);
        return;
      }
    }

    // Mode check: dev sim mode
    if (allowDevPublish) {
      // Write placeholder Meta IDs
      const catalogId = `dev-catalog-${customerId.slice(0, 8)}`;
      const campaignId = `dev-campaign-${customerId.slice(0, 8)}`;
      const adsetId = `dev-adset-${customerId.slice(0, 8)}`;
      const adId = `dev-ad-${customerId.slice(0, 8)}`;

      // Update meta_ad_objects
      const [existingObjects] = await db
        .select()
        .from(metaAdObjects)
        .where(eq(metaAdObjects.customerId, customerId))
        .limit(1);

      if (existingObjects) {
        await db
          .update(metaAdObjects)
          .set({
            catalogId,
            campaignId,
            adsetId,
            adId,
            status: "active",
            updatedAt: now,
          })
          .where(eq(metaAdObjects.customerId, customerId));
      } else {
        await db.insert(metaAdObjects).values({
          customerId,
          catalogId,
          campaignId,
          adsetId,
          adId,
          status: "active",
          updatedAt: now,
        });
      }

      // Update ad_settings
      await db
        .update(adSettings)
        .set({
          status: "active",
          lastPublishedAt: now,
          lastError: null,
          updatedAt: now,
        })
        .where(eq(adSettings.customerId, customerId));

      await db
        .update(adRuns)
        .set({ status: "success", finishedAt: new Date() })
        .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));

      console.log(JSON.stringify({ event: "ads_publish_job_finish", runId, customerId, status: "success", mode: "sim" }));
      await job.ack();
      return;
    }

    // Mode check: disabled
    const msg = "Ads publish is disabled. Enable ALLOW_REAL_META_WRITE=true or ALLOW_DEV_ADS_PUBLISH_SIM=true.";
    await db
      .update(adRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: msg })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
    await job.deadLetter(msg);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(JSON.stringify({ event: "ads_publish_job_finish", runId, customerId, status: "failed", error: message }));

    // Update ad_settings with error
    await db
      .update(adSettings)
      .set({
        status: "error",
        lastError: message,
        updatedAt: now,
      })
      .where(eq(adSettings.customerId, customerId));

    await db
      .update(adRuns)
      .set({ status: "failed", finishedAt: new Date(), errorMessage: message })
      .where(and(eq(adRuns.id, runId), eq(adRuns.customerId, customerId)));
    await job.deadLetter(message);
  }
}
