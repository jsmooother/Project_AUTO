"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { ErrorBanner } from "@/components/ErrorBanner";

export default function ConnectWebsitePage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setLoading(true);
    setError(null);
    setErrorHint(null);
    const res = await apiPost(
      "/inventory/source",
      { websiteUrl: websiteUrl.trim() },
      { customerId }
    );
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
      <h1 style={{ marginBottom: "1rem" }}>Connect website</h1>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        Add your inventory website URL. You can skip this and do it later from the dashboard.
      </p>
      {error && <ErrorBanner message={error} hint={errorHint ?? undefined} />}
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "500px" }}
      >
        <div>
          <label htmlFor="websiteUrl" style={{ display: "block", marginBottom: "0.5rem" }}>
            Website URL *
          </label>
          <input
            id="websiteUrl"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            placeholder="https://example.com/inventory"
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
              background: "#e2e8f0",
              color: "#4a5568",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              flex: 1,
            }}
          >
            Skip
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem",
              fontSize: "1rem",
              background: loading ? "#cbd5e0" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              flex: 1,
            }}
          >
            {loading ? "Saving..." : "Connect"}
          </button>
        </div>
      </form>
    </>
  );
}
