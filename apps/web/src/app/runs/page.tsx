"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface CrawlRun {
  id: string;
  trigger: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function RunsPage() {
  const router = useRouter();
  const [runs, setRuns] = useState<CrawlRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/signup");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/runs?type=crawl&limit=50`, {
      headers: { "x-customer-id": customerId },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load runs");
        return res.json();
      })
      .then((data) => setRuns(data.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
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
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>{error}</div>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1>Runs / Automation</h1>
        <Link href="/dashboard" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        Crawl run history. Trigger a run from the dashboard with &quot;Run now&quot;.
      </p>
      {runs.length === 0 && <p>No crawl runs yet.</p>}
      {runs.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Trigger</th>
                <th style={{ padding: "0.5rem" }}>Started</th>
                <th style={{ padding: "0.5rem" }}>Finished</th>
                <th style={{ padding: "0.5rem" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          run.status === "success"
                            ? "#efe"
                            : run.status === "failed"
                              ? "#fee"
                              : run.status === "running"
                                ? "#ffeaa7"
                                : "#eee",
                      }}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{run.trigger}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    {run.errorMessage ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
