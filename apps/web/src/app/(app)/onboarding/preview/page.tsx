"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useI18n } from "@/lib/i18n/context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LayoutTemplate } from "lucide-react";

export default function OnboardingPreviewPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const { result, loading } = useOnboardingStatus(customerId);

  const canContinue = result?.templates.status === "ok";
  const handleContinue = () => router.push("/onboarding/meta");
  const handleBack = () => router.push("/onboarding/inventory");

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && loading && !result) return <LoadingSpinner />;

  return (
    <OnboardingShell
      stepIndex={2}
      totalSteps={6}
      primaryLabel={t.onboarding.continue}
      onPrimary={handleContinue}
      onBack={handleBack}
      primaryDisabled={!canContinue}
      status={result}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
        {t.onboarding.previewTitle}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
        {t.onboarding.previewDescription}
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
        <LayoutTemplate style={{ width: 24, height: 24, color: "var(--pa-gray)" }} />
        <div>
          <p style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: 4 }}>
            {t.onboarding.approveTemplate}
          </p>
          <Link
            href="/templates"
            style={{ fontSize: "0.875rem", color: "var(--pa-blue)", textDecoration: "underline" }}
          >
            {t.nav.templates} →
          </Link>
        </div>
      </div>
      {!canContinue && (
        <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
          Configure a template and approve the preview in Templates, then return here to continue.
        </p>
      )}
    </OnboardingShell>
  );
}
