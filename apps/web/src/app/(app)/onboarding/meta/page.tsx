"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useI18n } from "@/lib/i18n/context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Megaphone } from "lucide-react";

export default function OnboardingMetaPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const { result, loading } = useOnboardingStatus(customerId);

  const canContinue = result?.meta.status === "ok";
  const handleContinue = () => router.push("/onboarding/ads");
  const handleBack = () => router.push("/onboarding/preview");

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && loading && !result) return <LoadingSpinner />;

  return (
    <OnboardingShell
      stepIndex={3}
      totalSteps={6}
      primaryLabel={t.onboarding.continue}
      onPrimary={handleContinue}
      onBack={handleBack}
      primaryDisabled={!canContinue}
      status={result}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
        {t.onboarding.metaTitle}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
        {t.onboarding.metaDescription}
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "1rem",
            background: "#f9fafb",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius)",
          }}
        >
          <Megaphone style={{ width: 24, height: 24, color: "var(--pa-gray)" }} />
          <div>
            <p style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: 4 }}>{t.onboarding.connectMeta}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: 4 }}>{t.onboarding.selectAdAccount}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>{t.onboarding.verifyAccess}</p>
            <Link
              href="/settings"
              style={{ fontSize: "0.875rem", color: "var(--pa-blue)", textDecoration: "underline" }}
            >
              {t.nav.settings} → Meta
            </Link>
          </div>
        </div>
      </div>
      {!canContinue && (
        <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
          Connect Meta, select an ad account and verify partner access in Settings → Meta, then return here.
        </p>
      )}
    </OnboardingShell>
  );
}
