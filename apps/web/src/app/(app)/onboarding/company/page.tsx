"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { ErrorBanner } from "@/components/ErrorBanner";

export default function CompanyOnboardingPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    const body: { companyName: string; companyWebsite?: string } = { companyName };
    if (companyWebsite) body.companyWebsite = companyWebsite;
    const res = await apiPost("/onboarding/company", body, { customerId });
    setLoading(false);
    if (res.ok) router.push("/dashboard");
    else setError(res.error);
  };

  if (auth.status !== "authenticated") return null;

  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Company Information</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>Tell us about your company</p>
      {error && <ErrorBanner message={error} />}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "500px" }}
      >
        <div>
          <label htmlFor="companyName" style={{ display: "block", marginBottom: "0.5rem" }}>
            Company Name *
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>
        <div>
          <label htmlFor="companyWebsite" style={{ display: "block", marginBottom: "0.5rem" }}>
            Company Website (optional)
          </label>
          <input
            id="companyWebsite"
            type="url"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
            placeholder="https://example.com"
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
