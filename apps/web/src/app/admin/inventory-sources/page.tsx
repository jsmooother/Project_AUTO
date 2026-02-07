"use client";

import { useEffect, useState } from "react";
import { getAdminHeaders } from "../../../lib/adminHeaders";
import Link from "next/link";

interface Source {
  id: string;
  customerId: string;
  websiteUrl: string;
  status: string;
  lastCrawledAt: string | null;
  createdAt: string;
}

export default function AdminInventorySourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    fetch(`${apiUrl}/admin/inventory-sources`, { headers: getAdminHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load inventory sources");
        return res.json();
      })
      .then((data) => setSources(data.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Sources</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Data sources</p>
        </div>
        <p>Loading...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Sources</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Data sources</p>
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Sources</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Data sources</p>
      </div>
      {sources.length === 0 ? (
        <p style={{ color: "#666" }}>No inventory sources.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Website</th>
                <th style={{ padding: "0.5rem" }}>Customer</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Last crawled</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <a href={s.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {s.websiteUrl}
                    </a>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <Link href={`/admin/customers/${s.customerId}`}>{s.customerId.slice(0, 8)}…</Link>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{s.status}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {s.lastCrawledAt ? new Date(s.lastCrawledAt).toLocaleString() : "—"}
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
