"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { ErrorBanner } from "@/components/ErrorBanner";

export default function BudgetOnboardingPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [monthlyBudgetAmount, setMonthlyBudgetAmount] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    const amount = parseFloat(monthlyBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await apiPost(
      "/onboarding/budget",
      { monthlyBudgetAmount: amount, budgetCurrency },
      { customerId }
    );
    setLoading(false);
    if (res.ok) router.push("/dashboard");
    else setError(res.error);
  };

  if (auth.status !== "authenticated") return null;

  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Budget Information</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        Tell us about your monthly advertising budget
      </p>
      {error && <ErrorBanner message={error} />}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "500px" }}
      >
        <div>
          <label htmlFor="budgetCurrency" style={{ display: "block", marginBottom: "0.5rem" }}>
            Currency
          </label>
          <select
            id="budgetCurrency"
            value={budgetCurrency}
            onChange={(e) => setBudgetCurrency(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
          </select>
        </div>
        <div>
          <label htmlFor="monthlyBudgetAmount" style={{ display: "block", marginBottom: "0.5rem" }}>
            Monthly Budget Amount *
          </label>
          <input
            id="monthlyBudgetAmount"
            type="number"
            step="0.01"
            min="0"
            value={monthlyBudgetAmount}
            onChange={(e) => setMonthlyBudgetAmount(e.target.value)}
            required
            placeholder="0.00"
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "0.75rem",
              background: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem",
              background: loading ? "#cbd5e0" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              flex: 1,
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </>
  );
}
