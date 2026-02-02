"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

function getAdminHeaders(): Record<string, string> {
  const key = typeof window !== "undefined" ? localStorage.getItem("adminApiKey") : null;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h["x-admin-key"] = key;
  return h;
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (statusFilter) params.set("status", statusFilter);
    fetch(`${apiUrl}/admin/customers?${params}`, { headers: getAdminHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load customers");
        return res.json();
      })
      .then((data) => setCustomers(data.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl, search, statusFilter]);

  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: "1rem" }}>Customers</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ marginBottom: "1rem" }}>Customers</h1>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: "1rem" }}>Customers</h1>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Search by name or ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", minWidth: 200 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="error">Error</option>
        </select>
      </div>
      {customers.length === 0 ? (
        <p style={{ color: "#666" }}>No customers found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Name</th>
                <th style={{ padding: "0.5rem" }}>ID</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: "1px solid #eee", cursor: "pointer" }}
                  onClick={() => router.push(`/admin/customers/${c.id}`)}
                >
                  <td style={{ padding: "0.5rem" }}>{c.name}</td>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {c.id.slice(0, 8)}…
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: 4,
                        background: c.status === "active" ? "#efe" : "#eee",
                      }}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
