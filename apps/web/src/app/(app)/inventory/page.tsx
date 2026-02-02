"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";

interface InventoryItem {
  id: string;
  externalId: string;
  title: string | null;
  url: string | null;
  price: number | null;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
}

export default function InventoryPage() {
  const { auth } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [source, setSource] = useState<{ id: string; websiteUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = () => {
    if (!customerId) return;
    apiGet<{ data: InventoryItem[]; source?: { id: string; websiteUrl: string } }>(
      "/inventory/items",
      { customerId }
    )
      .then((res) => {
        if (res.ok) {
          setItems(res.data.data ?? []);
          setSource(res.data.source ?? null);
        } else setError(res.error);
      })
      .catch(() => setError("Failed to load inventory"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  if (auth.status !== "authenticated") return <LoadingSpinner />;

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Inventory</h1>
      {error && <ErrorBanner message={error} onRetry={load} />}
      {source && (
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Source: <a href={source.websiteUrl} target="_blank" rel="noopener noreferrer">{source.websiteUrl}</a>
        </p>
      )}
      {!source && !error && (
        <EmptyState
          title="No website connected"
          description="Connect a website first, then run a crawl to import inventory."
          actionLabel="Connect website"
          actionHref="/connect-website"
        />
      )}
      {source && items.length === 0 && !error && (
        <EmptyState
          title="No items yet"
          description="Connect a website and run a crawl from the dashboard."
          actionLabel="Go to Dashboard"
          actionHref="/dashboard"
        />
      )}
      {items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Title</th>
                <th style={{ padding: "0.5rem" }}>URL</th>
                <th style={{ padding: "0.5rem" }}>Price</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>{item.title ?? "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.9rem" }}>
                        {item.url.length > 50 ? item.url.slice(0, 50) + "…" : item.url}
                      </a>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{item.price != null ? item.price : "—"}</td>
                  <td style={{ padding: "0.5rem" }}>{item.status}</td>
                  <td style={{ padding: "0.5rem" }}>{new Date(item.lastSeenAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
