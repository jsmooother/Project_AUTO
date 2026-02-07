"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { getAdminHeaders } from "../../../lib/adminHeaders";

interface Run {
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

function RunsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type") ?? "";
  const statusFilter = searchParams.get("status") ?? "";
  const customerIdFilter = searchParams.get("customerId") ?? "";

  const [runs, setRuns] = useState<Run[]>([]);
  const [customerInput, setCustomerInput] = useState(customerIdFilter);
  useEffect(() => {
    setCustomerInput(customerIdFilter);
  }, [customerIdFilter]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (customerIdFilter) params.set("customerId", customerIdFilter);
    fetch(`${apiUrl}/admin/runs?${params}`, { headers: getAdminHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load runs");
        return res.json();
      })
      .then((data) => setRuns(data.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl, typeFilter, statusFilter, customerIdFilter]);

  const buildQuery = (updates: Record<string, string>) => {
    const p = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    return p.toString();
  };

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Runs</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Run monitoring</p>
        </div>
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Runs</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Run monitoring</p>
        </div>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Runs</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Run monitoring</p>
      </div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <select
          value={typeFilter}
          onChange={(e) => router.push(`/admin/runs?${buildQuery({ type: e.target.value })}`)}
          style={{ padding: "0.5rem" }}
        >
          <option value="">All types</option>
          <option value="crawl">Crawl</option>
          <option value="preview">Preview</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => router.push(`/admin/runs?${buildQuery({ status: e.target.value })}`)}
          style={{ padding: "0.5rem" }}
        >
          <option value="">All statuses</option>
          <option value="queued">Queued</option>
          <option value="running">Running</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/admin/runs?${buildQuery({ customerId: customerInput.trim() })}`);
          }}
          style={{ display: "flex", gap: "0.5rem" }}
        >
          <input
            name="customerId"
            type="text"
            placeholder="Customer ID"
            value={customerInput}
            onChange={(e) => setCustomerInput(e.target.value)}
            style={{ padding: "0.5rem", minWidth: 220 }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem", cursor: "pointer" }}>
            Filter
          </button>
        </form>
      </div>
      {runs.length === 0 ? (
        <p style={{ color: "#666" }}>No runs found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Type</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Customer</th>
                <th style={{ padding: "0.5rem" }}>Trigger</th>
                <th style={{ padding: "0.5rem" }}>Started</th>
                <th style={{ padding: "0.5rem" }}>Finished</th>
                <th style={{ padding: "0.5rem" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                  onClick={() => router.push(`/admin/runs/${r.id}`)}
                >
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        background: r.type === "preview" ? "#e3f2fd" : "#f5f5f5",
                      }}
                    >
                      {r.type}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        background:
                          r.status === "success"
                            ? "#efe"
                            : r.status === "failed"
                              ? "#fee"
                              : r.status === "running"
                                ? "#ffeaa7"
                                : "#eee",
                      }}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    <Link
                      href={`/admin/customers/${r.customerId}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {r.customerId.slice(0, 8)}…
                    </Link>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{r.trigger}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {r.startedAt ? new Date(r.startedAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {r.finishedAt ? new Date(r.finishedAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem", maxWidth: 200 }}>
                    {r.errorMessage ? (
                      <span style={{ color: "#c00" }} title={r.errorMessage}>
                        {r.errorMessage.slice(0, 50)}…
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminRunsPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RunsContent />
    </Suspense>
  );
}
