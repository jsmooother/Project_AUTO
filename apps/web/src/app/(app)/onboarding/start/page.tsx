"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useI18n } from "@/lib/i18n/context";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function OnboardingStartPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const { result, loading } = useOnboardingStatus(customerId);

  const handleContinue = () => router.push("/onboarding/inventory");

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && loading) return <LoadingSpinner />;

  return (
    <OnboardingShell
      stepIndex={0}
      totalSteps={6}
      primaryLabel={t.onboarding.getStarted}
      onPrimary={handleContinue}
      status={result}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
        {t.onboarding.startTitle}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
        {t.onboarding.startDescription}
      </p>
    </OnboardingShell>
  );
}
