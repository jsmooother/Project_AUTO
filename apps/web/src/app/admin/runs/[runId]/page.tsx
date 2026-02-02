"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface RunDetail {
  id: string;
  type: "crawl" | "preview";
  customerId: string;
  trigger: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

function getAdminHeaders(): Record<string, string> {
  const key = typeof window !== "undefined" ? localStorage.getItem("adminApiKey") : null;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h["x-admin-key"] = key;
  return h;
}

export default function AdminRunDetailPage() {
  const params = useParams();
  const runId = params.runId as string;
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!runId) return;
    fetch(`${apiUrl}/admin/runs/${runId}`, { headers: getAdminHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load run");
        return res.json();
      })
      .then(setRun)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl, runId]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error}
        </div>
        <Link href="/admin/runs" style={{ display: "inline-block", marginTop: "1rem" }}>
          ← Back to runs
        </Link>
      </div>
    );
  }
  if (!run) return null;

  return (
    <div>
      <Link href="/admin/runs" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Back to runs
      </Link>
      <h1 style={{ marginBottom: "0.5rem" }}>
        Run {run.type} — {run.id.slice(0, 8)}…
      </h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Status: {run.status} · Trigger: {run.trigger}
      </p>

      {run.errorMessage && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.25rem",
            border: "2px solid #dc2626",
            background: "#fef2f2",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "0.9rem",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <strong style={{ display: "block", marginBottom: "0.5rem", color: "#b91c1c" }}>
            Run error (failure reason)
          </strong>
          {run.errorMessage}
        </div>
      )}

      <div style={{ display: "grid", gap: "1rem", maxWidth: 600 }}>
        <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
          <strong>Customer ID:</strong>{" "}
          <Link href={`/admin/customers/${run.customerId}`}>{run.customerId}</Link>
        </div>
        <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
          <strong>Started:</strong> {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
        </div>
        <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
          <strong>Finished:</strong> {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "—"}
        </div>
      </div>
    </div>
  );
}
