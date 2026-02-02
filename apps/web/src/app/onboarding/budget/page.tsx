"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BudgetOnboardingPage() {
  const router = useRouter();
  const [monthlyBudgetAmount, setMonthlyBudgetAmount] = useState("");
  const [budgetCurrency, setBudgetCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/signup");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/signup");
      return;
    }

    const amount = parseFloat(monthlyBudgetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid budget amount");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/onboarding/budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-customer-id": customerId,
        },
        body: JSON.stringify({
          monthlyBudgetAmount: amount,
          budgetCurrency,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Failed to update budget information");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Budget Information</h1>
      <p>Tell us about your monthly advertising budget</p>

      {error && (
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              fontSize: "1rem",
              background: "#ccc",
              color: "black",
              border: "none",
              borderRadius: "4px",
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
              fontSize: "1rem",
              background: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              flex: 1,
            }}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </main>
  );
}
