"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [websiteSource, setWebsiteSource] = useState<{ websiteUrl: string } | null>(null);
  const [runNowLoading, setRunNowLoading] = useState(false);
  const [runNowError, setRunNowError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/signup");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    Promise.all([
      fetch(`${apiUrl}/onboarding/status`, { headers: { "x-customer-id": customerId } }).then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch onboarding status");
        return res.json();
      }),
      fetch(`${apiUrl}/inventory/items`, { headers: { "x-customer-id": customerId } }).then(async (res) => {
        if (!res.ok) return { source: null };
        const data = await res.json();
        return { source: data.source ?? null };
      }),
    ])
      .then(([onboarding, inventory]) => {
        setOnboardingStatus(onboarding);
        setWebsiteSource(inventory.source);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [router]);

  const handleRunNow = async () => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) return;
    setRunNowError(null);
    setRunNowLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${apiUrl}/runs/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-customer-id": customerId },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to start crawl");
      }
      router.push("/runs");
    } catch (err) {
      setRunNowError(err instanceof Error ? err.message : "Failed");
    } finally {
      setRunNowLoading(false);
    }
  };

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "2rem" }}>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          Error: {error}
        </div>
      </main>
    );
  }

  if (!onboardingStatus) {
    return null;
  }

  const isCompleted = onboardingStatus.status === "completed";
  const needsCompanyInfo = !onboardingStatus.companyInfoCompleted;
  const needsBudgetInfo = !onboardingStatus.budgetInfoCompleted;

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Dashboard</h1>

      <div style={{ marginTop: "2rem" }}>
        <h2>Onboarding Status</h2>
        <div
          style={{
            padding: "1rem",
            background: isCompleted ? "#efe" : "#fff",
            border: `2px solid ${isCompleted ? "#0c0" : "#ccc"}`,
            borderRadius: "8px",
            marginTop: "1rem",
          }}
        >
          <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "1rem" }}>
            Status: <span style={{ textTransform: "capitalize" }}>{onboardingStatus.status.replace("_", " ")}</span>
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <p>
                <strong>Company Info:</strong> {onboardingStatus.companyInfoCompleted ? "✅ Completed" : "❌ Not completed"}
              </p>
              {onboardingStatus.companyName && <p>Company: {onboardingStatus.companyName}</p>}
            </div>

            <div>
              <p>
                <strong>Budget Info:</strong> {onboardingStatus.budgetInfoCompleted ? "✅ Completed" : "❌ Not completed"}
              </p>
              {onboardingStatus.monthlyBudgetAmount && (
                <p>
                  Budget: {onboardingStatus.budgetCurrency} {onboardingStatus.monthlyBudgetAmount}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {(needsCompanyInfo || needsBudgetInfo) && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Complete Your Onboarding</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {needsCompanyInfo && (
              <Link
                href="/onboarding/company"
                style={{
                  display: "block",
                  padding: "1rem",
                  background: "#0070f3",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
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
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                Add Budget Information →
              </Link>
            )}
          </div>
        </div>
      )}

      {isCompleted && (
        <div style={{ marginTop: "2rem", padding: "1rem", background: "#efe", borderRadius: "4px" }}>
          <p>🎉 Onboarding complete! You're all set.</p>
          <p style={{ marginTop: "0.5rem" }}>
            Optional: <Link href="/connect-website">Connect your website</Link> to run inventory crawls.
          </p>
        </div>
      )}

      <div style={{ marginTop: "2rem" }}>
        <h2>Website &amp; crawl</h2>
        <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", marginTop: "0.5rem" }}>
          <p>
            <strong>Website:</strong>{" "}
            {websiteSource ? (
              <>
                Connected — <a href={websiteSource.websiteUrl} target="_blank" rel="noopener noreferrer">{websiteSource.websiteUrl}</a>
                {" · "}
                <Link href="/connect-website">Change</Link>
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
                  background: runNowLoading ? "#ccc" : "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: runNowLoading ? "not-allowed" : "pointer",
                }}
              >
                {runNowLoading ? "Starting…" : "Run now"}
              </button>
              {runNowError && (
                <span style={{ marginLeft: "1rem", color: "#c00" }}>{runNowError}</span>
              )}
            </div>
          )}
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <Link href="/inventory" style={{ color: "#0070f3", textDecoration: "none" }}>Inventory</Link>
          <Link href="/runs" style={{ color: "#0070f3", textDecoration: "none" }}>Runs / Automation</Link>
        </div>
      </div>
    </main>
  );
}
