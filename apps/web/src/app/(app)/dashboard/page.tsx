"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";

interface OnboardingStatus {
  status: "not_started" | "in_progress" | "completed";
  companyInfoCompleted: boolean;
  budgetInfoCompleted: boolean;
  companyName?: string;
  companyWebsite?: string;
  monthlyBudgetAmount?: string;
  budgetCurrency?: string;
}

export default function DashboardPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [websiteSource, setWebsiteSource] = useState<{ websiteUrl: string } | null>(null);
  const [templateConfig, setTemplateConfig] = useState<{ id: string; status: string } | null>(null);
  const [runNowLoading, setRunNowLoading] = useState(false);
  const [runNowError, setRunNowError] = useState<string | null>(null);
  const [runNowHint, setRunNowHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<OnboardingStatus>("/onboarding/status", { customerId }),
      apiGet<{ data: unknown[]; source?: { websiteUrl: string } }>("/inventory/items", {
        customerId,
      }),
      apiGet<{ id: string; status: string } | null>("/templates/config", { customerId }),
    ])
      .then(([onb, inv, cfg]) => {
        if (onb.ok) setOnboardingStatus(onb.data);
        if (inv.ok) setWebsiteSource(inv.data.source ?? null);
        if (cfg.ok) setTemplateConfig(cfg.data ?? null);
        if (!onb.ok && !inv.ok && !cfg.ok) setError("Failed to load dashboard data");
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  const handleRunNow = async () => {
    if (!customerId) return;
    setRunNowError(null);
    setRunNowHint(null);
    setRunNowLoading(true);
    const res = await apiPost<{ runId: string }>("/runs/crawl", undefined, {
      customerId,
    });
    setRunNowLoading(false);
    if (res.ok) {
      router.push("/runs");
    } else {
      setRunNowError(res.error);
      setRunNowHint(res.errorDetail?.hint ?? null);
    }
  };

  if (auth.status !== "authenticated" || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <>
        <ErrorBanner message={error} onRetry={load} />
        <p>Go to <Link href="/dashboard">Dashboard</Link> to retry.</p>
      </>
    );
  }

  if (!onboardingStatus) return null;

  const isCompleted = onboardingStatus.status === "completed";
  const needsCompanyInfo = !onboardingStatus.companyInfoCompleted;
  const needsBudgetInfo = !onboardingStatus.budgetInfoCompleted;

  return (
    <>
      <h1 style={{ marginBottom: "1.5rem" }}>Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Onboarding Status</h2>
        <div
          style={{
            padding: "1rem",
            background: isCompleted ? "#f0fff4" : "#fff",
            border: `2px solid ${isCompleted ? "#9ae6b4" : "#e2e8f0"}`,
            borderRadius: "8px",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "1rem" }}>
            Status: <span style={{ textTransform: "capitalize" }}>{onboardingStatus.status.replace("_", " ")}</span>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <p><strong>Company Info:</strong> {onboardingStatus.companyInfoCompleted ? "✅ Completed" : "❌ Not completed"}</p>
            {onboardingStatus.companyName && <p>Company: {onboardingStatus.companyName}</p>}
            <p><strong>Budget Info:</strong> {onboardingStatus.budgetInfoCompleted ? "✅ Completed" : "❌ Not completed"}</p>
            {onboardingStatus.monthlyBudgetAmount && (
              <p>Budget: {onboardingStatus.budgetCurrency} {onboardingStatus.monthlyBudgetAmount}</p>
            )}
          </div>
        </div>
      </section>

      {(needsCompanyInfo || needsBudgetInfo) && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Complete Your Onboarding</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {needsCompanyInfo && (
              <Link
                href="/onboarding/company"
                style={{
                  display: "block",
                  padding: "1rem",
                  background: "#0070f3",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                Add Company Information →
              </Link>
            )}
            {needsBudgetInfo && (
              <Link
                href="/onboarding/budget"
                style={{
                  display: "block",
                  padding: "1rem",
                  background: "#0070f3",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "6px",
                  textAlign: "center",
                }}
              >
                Add Budget Information →
              </Link>
            )}
          </div>
        </section>
      )}

      {isCompleted && (
        <section style={{ marginBottom: "2rem", padding: "1rem", background: "#f0fff4", borderRadius: "6px" }}>
          <p>🎉 Onboarding complete!</p>
          <p style={{ marginTop: "0.5rem" }}>
            Optional: <Link href="/connect-website" style={{ color: "#0070f3" }}>Connect your website</Link> to run inventory crawls.
          </p>
        </section>
      )}

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Website &amp; Crawl</h2>
        <div style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <p>
            <strong>Website:</strong>{" "}
            {websiteSource ? (
              <>
                Connected — <a href={websiteSource.websiteUrl} target="_blank" rel="noopener noreferrer">{websiteSource.websiteUrl}</a>
                {" · "}
                <Link href="/connect-website" style={{ color: "#0070f3" }}>Change</Link>
              </>
            ) : (
              <>
                Not connected.{" "}
                <Link href="/connect-website" style={{ color: "#0070f3" }}>Connect a website</Link>
              </>
            )}
          </p>
          {websiteSource && (
            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleRunNow}
                disabled={runNowLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: runNowLoading ? "#cbd5e0" : "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: runNowLoading ? "not-allowed" : "pointer",
                }}
              >
                {runNowLoading ? "Starting…" : "Run crawl"}
              </button>
              {(runNowError || runNowHint) && (
                <div style={{ marginTop: "0.5rem" }}>
                  {runNowError && <ErrorBanner message={runNowError} hint={runNowHint ?? undefined} />}
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/inventory" style={{ color: "#0070f3", textDecoration: "none" }}>Inventory</Link>
          <Link href="/runs" style={{ color: "#0070f3", textDecoration: "none" }}>Runs / Automation</Link>
          <Link href="/templates" style={{ color: "#0070f3", textDecoration: "none" }}>Templates</Link>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Template Status</h2>
        <div style={{ padding: "1rem", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
          <p>
            <strong>Status:</strong>{" "}
            {templateConfig ? (
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  background:
                    templateConfig.status === "approved"
                      ? "#d4edda"
                      : templateConfig.status === "preview_ready"
                        ? "#fff3cd"
                        : "#f0f0f0",
                }}
              >
                {templateConfig.status.replace("_", " ")}
              </span>
            ) : (
              "Not configured"
            )}
          </p>
          {!templateConfig && (
            <Link
              href="/templates"
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                background: "#0070f3",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Choose template
            </Link>
          )}
          {templateConfig?.status === "draft" && (
            <Link
              href="/templates"
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                background: "#0070f3",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Generate previews
            </Link>
          )}
          {templateConfig?.status === "preview_ready" && (
            <Link
              href="/templates"
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.5rem 1rem",
                background: "#38a169",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
              }}
            >
              Review &amp; approve
            </Link>
          )}
          {templateConfig?.status === "approved" && (
            <p style={{ marginTop: "0.5rem", color: "#276749" }}>Ready for Meta connection (future)</p>
          )}
        </div>
      </section>

      {process.env.NODE_ENV === "development" && (
        <section
          style={{
            marginTop: "2rem",
            padding: "1rem",
            background: "#1a202c",
            color: "#e2e8f0",
            borderRadius: "8px",
            fontSize: "0.85rem",
          }}
        >
          <h3 style={{ marginBottom: "0.75rem", fontSize: "0.9rem" }}>Dev diagnostics</h3>
          <pre style={{ margin: 0, fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {JSON.stringify(
              {
                customerId: customerId ?? "(null)",
                "x-customer-id": customerId ? "set" : "not set",
                sourceUrl: websiteSource?.websiteUrl ?? "(none)",
                templateConfigId: templateConfig?.id ?? "(none)",
                templateStatus: templateConfig?.status ?? "(none)",
              },
              null,
              2
            )}
          </pre>
        </section>
      )}
    </>
  );
}
