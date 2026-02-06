"use client";

import { useState, useEffect } from "react";
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
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [isPreFilled, setIsPreFilled] = useState(false);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  // Pre-fill company website from signup suggestion
  useEffect(() => {
    if (typeof window !== "undefined") {
      const suggested = sessionStorage.getItem("suggestedCompanyWebsite");
      if (suggested) {
        setCompanyWebsite(suggested);
        setIsPreFilled(true);
        sessionStorage.removeItem("suggestedCompanyWebsite"); // Clear after reading
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    setErrorHint(null);
    const body: { companyName: string; companyWebsite?: string } = { companyName };
    if (companyWebsite) body.companyWebsite = companyWebsite;
    const res = await apiPost("/onboarding/company", body, { customerId });
    setLoading(false);
    if (res.ok) router.push("/dashboard");
    else {
      setError(res.error);
      setErrorHint(res.errorDetail?.hint ?? null);
    }
  };

  if (auth.status !== "authenticated") return null;

  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Company Information</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>Tell us about your company</p>
      {error && <ErrorBanner message={error} hint={errorHint ?? undefined} />}
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
            type="text"
            value={companyWebsite}
            onChange={(e) => {
              setCompanyWebsite(e.target.value);
              setIsPreFilled(false); // Clear pre-filled flag when user edits
            }}
            placeholder="example.com or https://example.com"
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
          {isPreFilled && (
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#1e40af", fontStyle: "italic" }}>
              ✓ Pre-filled from your email domain - we&apos;ll validate and connect it automatically
            </p>
          )}
          {!isPreFilled && (
            <p style={{ marginTop: "0.25rem", fontSize: "0.875rem", color: "#666" }}>
              You can enter short URLs like &quot;ivarsbil.se&quot; - we&apos;ll validate and format it automatically
            </p>
          )}
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
