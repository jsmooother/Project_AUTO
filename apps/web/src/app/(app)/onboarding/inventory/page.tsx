"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useI18n } from "@/lib/i18n/context";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Globe, Shield } from "lucide-react";

export default function OnboardingInventoryPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const { result, loading, refresh } = useOnboardingStatus(customerId);

  const [websiteUrl, setWebsiteUrl] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const handleConnectWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setSubmitLoading(true);
    setError(null);
    setErrorHint(null);
    const res = await apiPost("/inventory/source", { websiteUrl: websiteUrl.trim() }, { customerId });
    setSubmitLoading(false);
    if (res.ok) refresh();
    else {
      setError(!res.ok ? res.error : "Failed");
      setErrorHint(res.errorDetail?.hint ?? null);
    }
  };

  const handleRunCrawl = async () => {
    if (!customerId) return;
    setCrawlLoading(true);
    setError(null);
    const res = await apiPost<{ runId: string }>("/runs/crawl", undefined, { customerId });
    setCrawlLoading(false);
    if (res.ok) {
      refresh();
      router.push("/runs");
      return;
    }
    setError(!res.ok ? res.error : "Failed");
  };

  const canContinue = result?.inventory.status === "ok";
  const hasWebsite = result?.hasWebsiteUrl ?? false;
  const inventoryCount = result?.inventoryCount ?? 0;

  const handleContinue = () => router.push("/onboarding/preview");
  const handleBack = () => router.push("/onboarding/start");

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && loading && !result) return <LoadingSpinner />;

  return (
    <OnboardingShell
      stepIndex={1}
      totalSteps={6}
      primaryLabel={t.onboarding.continue}
      onPrimary={handleContinue}
      onBack={handleBack}
      primaryDisabled={!canContinue}
      status={result}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
        {t.onboarding.inventoryTitle}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "1rem" }}>
        {t.onboarding.inventoryDescription}
      </p>

      {/* Trust/reassurance banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem 1rem",
          background: "#ecfdf5",
          border: "1px solid #a7f3d0",
          borderRadius: "var(--pa-radius)",
          marginBottom: "1rem",
        }}
      >
        <Shield size={20} color="#059669" />
        <p style={{ fontSize: "0.875rem", color: "#065f46", margin: 0 }}>
          {t.onboarding.inventoryReassurance}
        </p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="websiteUrl" style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
          {t.onboarding.websiteUrl}
        </label>
        <form onSubmit={handleConnectWebsite} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com/listings"
            style={{
              flex: 1,
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--pa-border)",
              borderRadius: 6,
              fontSize: "0.875rem",
            }}
          />
          <button
            type="submit"
            disabled={submitLoading || !websiteUrl.trim()}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: 6,
              background: submitLoading ? "#d1d5db" : "var(--pa-dark)",
              color: "white",
              cursor: submitLoading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
            }}
          >
            {submitLoading ? t.common.loading : t.common.save}
          </button>
        </form>
      </div>

      {hasWebsite && (
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={handleRunCrawl}
            disabled={crawlLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              border: "none",
              borderRadius: 6,
              background: crawlLoading ? "#d1d5db" : "var(--pa-dark)",
              color: "white",
              cursor: crawlLoading ? "not-allowed" : "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <Globe size={16} />
            {crawlLoading ? t.onboarding.crawlStarting : t.onboarding.runCrawl}
          </button>
          <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginTop: "0.5rem" }}>
            {t.onboarding.runCrawlHelper}
          </p>
          {inventoryCount > 0 && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem 1rem",
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: "var(--pa-radius)",
              }}
            >
              <p style={{ fontSize: "0.875rem", color: "#065f46", fontWeight: 500, margin: 0 }}>
                ✓ {inventoryCount} {t.onboarding.itemsDetected}
              </p>
            </div>
          )}
        </div>
      )}

      {error && <ErrorBanner message={error} hint={errorHint ?? undefined} />}
    </OnboardingShell>
  );
}
