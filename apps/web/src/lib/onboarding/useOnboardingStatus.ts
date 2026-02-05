"use client";

import { useState, useCallback, useEffect } from "react";
import { apiGet } from "@/lib/api";

export type StepStatus = "ok" | "pending" | "fail";

export interface OnboardingStepState {
  status: StepStatus;
  hint?: string;
  recommendedAction?: string;
}

export interface OnboardingStatusResult {
  /** Website connected and at least one inventory item */
  inventory: OnboardingStepState;
  /** Template config approved */
  templates: OnboardingStepState;
  /** Meta connected, ad account selected, partner verified */
  meta: OnboardingStepState;
  /** Ads settings saved (geo/formats/cta) */
  ads: OnboardingStepState;
  /** Billing plan or credits exist */
  billing: OnboardingStepState;
  /** All steps ok */
  overallComplete: boolean;
  /** Raw counts / hints for UI */
  inventoryCount: number;
  hasWebsiteUrl: boolean;
  templateStatus: string | null;
  metaPartnerVerified: boolean;
  billingHint: string | null;
}

const defaultStep = (): OnboardingStepState => ({ status: "pending" });

export function useOnboardingStatus(customerId: string | null) {
  const [result, setResult] = useState<OnboardingStatusResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (!customerId) {
      setResult(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<{ data: unknown[]; source?: { websiteUrl: string } }>("/inventory/items", { customerId }),
      apiGet<{ id: string; status: string } | null>("/templates/config", { customerId }),
      apiGet<{
        status: string;
        selectedAdAccountId?: string | null;
        partnerAccessStatus?: string;
        systemUserConfigured?: boolean;
      }>("/meta/status", { customerId }),
      apiGet<{
        prerequisites?: {
          website: { ok: boolean };
          inventory: { ok: boolean };
          templates: { ok: boolean };
          meta: { ok: boolean };
        };
        settings?: { id: string } | null;
      }>("/ads/status", { customerId }),
      apiGet<{
        ok?: boolean;
        balanceSek?: number;
        monthlyPriceSek?: number | null;
        hint?: string;
      }>("/billing/status", { customerId }),
    ])
      .then(([inv, tpl, meta, ads, billing]) => {
        const invData = inv.ok ? inv.data : null;
        const tplData = tpl.ok ? tpl.data : null;
        const metaData = meta.ok ? meta.data : null;
        const adsData = ads.ok ? ads.data : null;
        const billingData = billing.ok ? billing.data : null;

        const hasWebsiteUrl = !!(invData?.source?.websiteUrl);
        const inventoryCount = Array.isArray(invData?.data) ? invData.data.length : 0;
        const inventoryOk = hasWebsiteUrl && inventoryCount >= 1;

        const templateStatus = tplData?.status ?? null;
        const templatesOk = templateStatus === "approved";

        const metaConnected =
          metaData?.status === "connected" || metaData?.systemUserConfigured === true;
        const hasAdAccount = !!metaData?.selectedAdAccountId;
        const metaPartnerVerified = metaData?.partnerAccessStatus === "verified";
        const metaOk = !!metaConnected && !!hasAdAccount && !!metaPartnerVerified;

        const adsSettingsOk = !!adsData?.settings?.id;
        const adsOk = !!adsSettingsOk;

        const hasPlan = billingData?.monthlyPriceSek != null && billingData.monthlyPriceSek > 0;
        const hasBalance = typeof billingData?.balanceSek === "number";
        const billingOk = !!hasPlan || (hasBalance && !billingData?.hint);
        const billingHint = billingData?.hint ?? null;

        setResult({
          inventory: {
            status: inventoryOk ? "ok" : inventoryCount === 0 && hasWebsiteUrl ? "pending" : "fail",
            hint: hasWebsiteUrl
              ? inventoryCount === 0
                ? "Run a crawl to detect inventory"
                : undefined
              : "Connect a website and add inventory",
            recommendedAction: hasWebsiteUrl
              ? inventoryCount === 0
                ? "Run crawl"
                : undefined
              : "Connect website",
          },
          templates: {
            status: templatesOk ? "ok" : templateStatus ? "pending" : "fail",
            hint: !templateStatus ? "Configure a template" : templateStatus !== "approved" ? "Approve your template" : undefined,
            recommendedAction: !templateStatus ? "Configure template" : templateStatus !== "approved" ? "Approve template" : undefined,
          },
          meta: {
            status: metaOk ? "ok" : metaConnected && hasAdAccount ? "pending" : "fail",
            hint:
              !metaConnected
                ? "Connect Meta account"
                : !hasAdAccount
                  ? "Select an ad account"
                  : !metaPartnerVerified
                    ? "Verify partner access in Settings"
                    : undefined,
            recommendedAction: !metaConnected ? "Connect Meta" : !hasAdAccount ? "Select ad account" : !metaPartnerVerified ? "Verify access" : undefined,
          },
          ads: {
            status: adsOk ? "ok" : "fail",
            hint: !adsOk ? "Save ads settings (geo, formats, CTA)" : undefined,
            recommendedAction: !adsOk ? "Save ads settings" : undefined,
          },
          billing: {
            status: billingOk ? "ok" : "pending",
            hint: billingHint ?? (!hasPlan ? "Set up billing or request a proposal" : undefined),
            recommendedAction: !billingOk ? "Set up billing" : undefined,
          },
          overallComplete: inventoryOk && templatesOk && metaOk && adsOk && billingOk,
          inventoryCount,
          hasWebsiteUrl,
          templateStatus,
          metaPartnerVerified: !!metaPartnerVerified,
          billingHint,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load onboarding status");
        setResult(null);
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { result, loading, error, refresh };
}
