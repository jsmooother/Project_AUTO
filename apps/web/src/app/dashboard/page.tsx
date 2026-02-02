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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/signup");
      return;
    }

    fetch("http://localhost:3001/onboarding/status", {
      headers: {
        "x-customer-id": customerId,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch onboarding status");
        }
        return res.json();
      })
      .then((data) => {
        setOnboardingStatus(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

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
        </div>
      )}
    </main>
  );
}
