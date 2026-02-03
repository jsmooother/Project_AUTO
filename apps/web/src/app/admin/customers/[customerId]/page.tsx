"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getAdminHeaders } from "../../../../lib/adminHeaders";

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

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params.customerId as string;
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string; runId?: string } | null>(null);
  const [crawlLoading, setCrawlLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const isDev = process.env.NODE_ENV === "development";

  const load = useCallback(() => {
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

  useEffect(() => {
    load();
  }, [load]);

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

      {tab === "overview" && (
        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={crawlLoading || !data?.inventorySource}
            onClick={async () => {
              setCrawlLoading(true);
              setToast(null);
              try {
                const res = await fetch(
                  `${apiUrl}/admin/customers/${customerId}/runs/crawl`,
                  { method: "POST", headers: getAdminHeaders() }
                );
                const body = await res.json();
                if (res.ok) {
                  setToast({
                    type: "success",
                    message: `Crawl run started. Run ID: ${body.runId}`,
                    runId: body.runId,
                  });
                  load();
                } else {
                  const msg = body.message ?? body.error?.message ?? "Trigger crawl failed";
                  const hint = body.hint ? ` ${body.hint}` : "";
                  setToast({ type: "error", message: msg + hint });
                }
              } catch (e) {
                setToast({ type: "error", message: (e as Error).message });
              } finally {
                setCrawlLoading(false);
              }
            }}
            style={{
              padding: "0.5rem 1rem",
              background: crawlLoading || !data?.inventorySource ? "#ccc" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: crawlLoading || !data?.inventorySource ? "not-allowed" : "pointer",
            }}
          >
            {crawlLoading ? "Starting…" : "Trigger crawl"}
          </button>
          <button
            type="button"
            disabled={previewLoading || !data?.stats?.templateStatus}
            onClick={async () => {
              setPreviewLoading(true);
              setToast(null);
              try {
                const res = await fetch(
                  `${apiUrl}/admin/customers/${customerId}/runs/preview`,
                  { method: "POST", headers: getAdminHeaders() }
                );
                const body = await res.json();
                if (res.ok) {
                  setToast({
                    type: "success",
                    message: `Preview run started. Run ID: ${body.runId}`,
                    runId: body.runId,
                  });
                  load();
                } else {
                  const msg = body.message ?? body.error?.message ?? "Trigger preview failed";
                  const hint = body.hint ? ` ${body.hint}` : "";
                  setToast({ type: "error", message: msg + hint });
                }
              } catch (e) {
                setToast({ type: "error", message: (e as Error).message });
              } finally {
                setPreviewLoading(false);
              }
            }}
            style={{
              padding: "0.5rem 1rem",
              background: previewLoading || !data?.stats?.templateStatus ? "#ccc" : "#38a169",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: previewLoading || !data?.stats?.templateStatus ? "not-allowed" : "pointer",
            }}
          >
            {previewLoading ? "Starting…" : "Generate previews"}
          </button>
        </div>
      )}

      {toast && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            borderRadius: "8px",
            background: toast.type === "success" ? "#d4edda" : "#f8d7da",
            color: toast.type === "success" ? "#155724" : "#721c24",
          }}
        >
          {toast.message}
          {toast.runId && (
            <>
              {" · "}
              <Link
                href={`/admin/runs/${toast.runId}`}
                style={{ color: "inherit", textDecoration: "underline" }}
              >
                View run
              </Link>
            </>
          )}
        </div>
      )}

      {tab === "overview" && isDev && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>Dev: Reset customer data</h3>
          <p style={{ fontSize: "0.85rem", color: "#92400e", marginBottom: "0.75rem" }}>
            Deletes runs, previews, inventory items, and approvals for this customer. Keeps customer, user, website source, and template config (set back to draft).
          </p>
          <button
            type="button"
            disabled={resetLoading}
            onClick={async () => {
              if (!confirm("Reset all customer data (runs, previews, items, approvals)? This cannot be undone.")) return;
              setResetLoading(true);
              setToast(null);
              try {
                const res = await fetch(`${apiUrl}/admin/customers/${customerId}/reset`, {
                  method: "POST",
                  headers: getAdminHeaders(),
                });
                const body = await res.json();
                if (res.ok) {
                  setToast({ type: "success", message: body.message ?? "Customer data reset." });
                  load();
                } else {
                  setToast({ type: "error", message: body.message ?? body.error?.message ?? "Reset failed" });
                }
              } catch (e) {
                setToast({ type: "error", message: (e as Error).message });
              } finally {
                setResetLoading(false);
              }
            }}
            style={{
              padding: "0.5rem 1rem",
              background: resetLoading ? "#94a3b8" : "#d97706",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: resetLoading ? "not-allowed" : "pointer",
            }}
          >
            {resetLoading ? "Resetting…" : "Reset customer data"}
          </button>
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
