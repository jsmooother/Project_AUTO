"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Globe } from "lucide-react";

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

  if (auth.status !== "authenticated") return <LoadingSpinner />;

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            marginBottom: "0.5rem",
            color: "var(--pa-dark)",
          }}
        >
          Connect website
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Add your inventory website URL so we can detect your listings
        </p>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid var(--pa-border)",
          borderRadius: "var(--pa-radius-lg)",
          padding: "1.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "var(--pa-radius)",
              background: "#dbeafe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Globe style={{ width: 24, height: 24, color: "#2563eb" }} />
          </div>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: "1.1rem" }}>Website URL</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
              Enter the URL of your inventory page or listings
            </p>
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: "1rem" }}>
            <ErrorBanner message={error} hint={errorHint ?? undefined} />
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              htmlFor="websiteUrl"
              style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}
            >
              Website URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              placeholder="https://example.com/inventory"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                fontSize: "1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: "6px",
                background: "#f3f4f6",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                background: "white",
                border: "1px solid var(--pa-border)",
                borderRadius: "6px",
                cursor: "pointer",
                color: "var(--pa-gray)",
              }}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "0.5rem 1rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                background: loading ? "#d1d5db" : "var(--pa-dark)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving…" : "Connect"}
            </button>
          </div>
        </form>
      </div>

      <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
        <Link href="/dashboard" style={{ color: "var(--pa-blue)" }}>← Back to Dashboard</Link>
      </p>
    </div>
  );
}
