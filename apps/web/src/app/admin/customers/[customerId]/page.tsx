"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type TabId = "overview" | "runs" | "inventory" | "billing";

interface CustomerDetail {
  customer: { id: string; name: string; status: string; createdAt: string };
  inventorySource: { id: string; websiteUrl: string } | null;
  stats: {
    inventoryItems: number;
    crawlRuns: number;
    previewRuns: number;
    templateStatus: string | null;
  };
}

function getAdminHeaders(): Record<string, string> {
  const key = typeof window !== "undefined" ? localStorage.getItem("adminApiKey") : null;
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (key) h["x-admin-key"] = key;
  return h;
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.customerId as string;
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  useEffect(() => {
    if (!customerId) return;
    fetch(`${apiUrl}/admin/customers/${customerId}`, { headers: getAdminHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load customer");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl, customerId]);

  if (loading) return <p>Loading...</p>;
  if (error) {
    return (
      <div>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error}
        </div>
        <Link href="/admin/customers" style={{ display: "inline-block", marginTop: "1rem" }}>
          ← Back to customers
        </Link>
      </div>
    );
  }
  if (!data) return null;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "runs", label: "Runs" },
    { id: "inventory", label: "Inventory" },
    { id: "billing", label: "Billing" },
  ];

  return (
    <div>
      <Link href="/admin/customers" style={{ display: "inline-block", marginBottom: "1rem" }}>
        ← Back to customers
      </Link>
      <h1 style={{ marginBottom: "0.5rem" }}>{data.customer.name}</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        ID: {data.customer.id} · Status: {data.customer.status}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid #ccc" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: tab === t.id ? "#37474f" : "transparent",
              color: tab === t.id ? "#fff" : "#666",
              cursor: "pointer",
              borderBottom: tab === t.id ? "2px solid #37474f" : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Inventory items</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{data.stats.inventoryItems}</div>
          </div>
          <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Crawl runs</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{data.stats.crawlRuns}</div>
          </div>
          <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Preview runs</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{data.stats.previewRuns}</div>
          </div>
          <div style={{ padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.9rem", color: "#666" }}>Template status</div>
            <div style={{ fontSize: "1rem", fontWeight: 600 }}>
              {data.stats.templateStatus ?? "—"}
            </div>
          </div>
        </div>
      )}

      {tab === "overview" && data.inventorySource && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", border: "1px solid #eee", borderRadius: "8px" }}>
          <strong>Website:</strong>{" "}
          <a href={data.inventorySource.websiteUrl} target="_blank" rel="noopener noreferrer">
            {data.inventorySource.websiteUrl}
          </a>
        </div>
      )}

      {tab === "runs" && (
        <p style={{ color: "#666" }}>
          <Link href={`/admin/runs?customerId=${customerId}`}>View runs for this customer →</Link>
        </p>
      )}

      {tab === "inventory" && (
        <p style={{ color: "#666" }}>
          {data.stats.inventoryItems} items. View in customer app with customerId.
        </p>
      )}

      {tab === "billing" && <p style={{ color: "#666" }}>Billing not implemented.</p>}
    </div>
  );
}
