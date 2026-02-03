"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminHeaders } from "../../../lib/adminHeaders";

interface Customer {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

const isDev = process.env.NODE_ENV === "development";

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<{
    customerId: string;
    email: string;
    password: string;
  } | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const loadCustomers = useCallback(() => {
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

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

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

      {isDev && (
        <div style={{ marginBottom: "1.5rem", padding: "1rem", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Dev: Seed demo data</h2>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "0.75rem" }}>
            Creates a full demo customer (onboarding complete, website, 10 items, template config + preview, approved).
          </p>
          <button
            type="button"
            disabled={demoLoading}
            onClick={async () => {
              setDemoLoading(true);
              setDemoError(null);
              setDemoResult(null);
              try {
                const res = await fetch(`${apiUrl}/admin/demo/seed`, {
                  method: "POST",
                  headers: getAdminHeaders(),
                });
                const data = await res.json();
                if (!res.ok) {
                  setDemoError(data.message ?? data.error?.message ?? "Seed failed");
                  return;
                }
                setDemoResult({ customerId: data.customerId, email: data.email, password: data.password });
                loadCustomers();
              } catch (e) {
                setDemoError((e as Error).message);
              } finally {
                setDemoLoading(false);
              }
            }}
            style={{
              padding: "0.5rem 1rem",
              background: demoLoading ? "#94a3b8" : "#0ea5e9",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: demoLoading ? "not-allowed" : "pointer",
            }}
          >
            {demoLoading ? "Creating…" : "Create demo customer"}
          </button>
          {demoError && (
            <p style={{ marginTop: "0.5rem", color: "#b91c1c", fontSize: "0.9rem" }}>{demoError}</p>
          )}
          {demoResult && (
            <div style={{ marginTop: "0.75rem", padding: "0.75rem", background: "#fff", borderRadius: "4px", fontSize: "0.9rem" }}>
              <p style={{ marginBottom: "0.25rem" }}><strong>Demo customer created.</strong></p>
              <p>Email: <code style={{ background: "#f1f5f9", padding: "0.1rem 0.3rem" }}>{demoResult.email}</code></p>
              <p>Password: <code style={{ background: "#f1f5f9", padding: "0.1rem 0.3rem" }}>{demoResult.password}</code></p>
              <p>
                <Link href={`/admin/customers/${demoResult.customerId}`} style={{ color: "#0ea5e9" }}>View customer</Link>
                {" · "}
                <a href="/login" style={{ color: "#0ea5e9" }}>Log in as this user</a>
              </p>
            </div>
          )}
        </div>
      )}

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
