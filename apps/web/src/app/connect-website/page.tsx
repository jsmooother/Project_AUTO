"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConnectWebsitePage() {
  const router = useRouter();
  const [websiteUrl, setWebsiteUrl] = useState("");
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

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    try {
      const res = await fetch(`${apiUrl}/inventory/source`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-customer-id": customerId,
        },
        body: JSON.stringify({ websiteUrl: websiteUrl.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to connect website");
      }
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Connect website</h1>
      <p>Add your inventory website URL. You can skip this and do it later from the dashboard.</p>

      {error && (
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              background: "#ccc",
              color: "black",
              border: "none",
              borderRadius: "4px",
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
              background: loading ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              flex: 1,
            }}
          >
            {loading ? "Saving..." : "Connect"}
          </button>
        </div>
      </form>
    </main>
  );
}
