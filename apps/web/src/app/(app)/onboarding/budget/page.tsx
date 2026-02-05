"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useI18n } from "@/lib/i18n/context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { DollarSign } from "lucide-react";

const ONBOARDING_COMPLETE_KEY = "onboardingComplete";

export default function OnboardingBudgetPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const { result, loading } = useOnboardingStatus(customerId);

  const [billingStatus, setBillingStatus] = useState<{
    ok?: boolean;
    balanceSek?: number;
    monthlyPriceSek?: number | null;
    hint?: string;
  } | null>(null);

  useEffect(() => {
    if (!customerId) return;
    apiGet<{ ok?: boolean; balanceSek?: number; monthlyPriceSek?: number | null; hint?: string }>(
      "/billing/status",
      { customerId }
    ).then((res) => {
      if (res.ok) setBillingStatus(res.data);
    });
  }, [customerId]);

  const billingOk = result?.billing.status === "ok";
  const handleContinue = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    }
    router.push("/onboarding/done");
  };
  const handleBack = () => router.push("/onboarding/ads");

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && loading && !result) return <LoadingSpinner />;

  return (
    <OnboardingShell
      stepIndex={5}
      totalSteps={6}
      primaryLabel={t.onboarding.continue}
      onPrimary={handleContinue}
      onBack={handleBack}
      status={result}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
        {t.onboarding.budgetTitle}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
        {t.onboarding.budgetDescription}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
          padding: "1rem",
          background: "#f9fafb",
          border: "1px solid var(--pa-border)",
          borderRadius: "var(--pa-radius)",
        }}
      >
        <DollarSign style={{ width: 24, height: 24, color: "var(--pa-gray)" }} />
        <div>
          {billingOk && typeof billingStatus?.balanceSek === "number" && (
            <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>
              {t.dashboard.creditsRemaining}: {billingStatus.balanceSek} SEK
            </p>
          )}
          {result?.billing.status !== "ok" && (
            <>
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: 4 }}>
                {result?.billing.hint ?? t.onboarding.contactUs}
              </p>
              <Link
                href="/billing"
                style={{ fontSize: "0.875rem", color: "var(--pa-blue)", textDecoration: "underline" }}
              >
                {t.nav.billing} →
              </Link>
              <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                {t.onboarding.requestProposal}
              </span>
            </>
          )}
        </div>
      </div>

      <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
        You can set up billing now or continue to the dashboard and do it later.
      </p>
    </OnboardingShell>
  );
}
