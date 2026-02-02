"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [source, setSource] = useState<{ id: string; websiteUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = localStorage.getItem("customerId");
    if (!customerId) {
      router.push("/signup");
      return;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/inventory/items`, {
      headers: { "x-customer-id": customerId },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load inventory");
        return res.json();
      })
      .then((data) => {
        setItems(data.data ?? []);
        setSource(data.source ?? null);
      })
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
        <h1>Inventory</h1>
        <Link href="/dashboard" style={{ color: "#0070f3", textDecoration: "none" }}>
          ← Dashboard
        </Link>
      </div>
      {source && (
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Source: <a href={source.websiteUrl} target="_blank" rel="noopener noreferrer">{source.websiteUrl}</a>
        </p>
      )}
      {!source && (
        <p style={{ marginBottom: "1rem" }}>
          No website connected. <Link href="/connect-website">Connect a website</Link> first, then run a crawl.
        </p>
      )}
      {items.length === 0 && (
        <p>No items yet. Connect a website and run a crawl from the dashboard.</p>
      )}
      {items.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ccc", textAlign: "left" }}>
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
    </main>
  );
}
