"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useI18n } from "@/lib/i18n/context";
import { Search, Download, RefreshCw } from "lucide-react";

interface InventoryItem {
  id: string;
  externalId: string;
  title: string | null;
  url: string | null;
  price: number | null;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
  isAdEligible?: boolean;
}

const THUMB_COLORS: string[] = ["#3b82f6", "#6b7280", "#ef4444", "#22c55e", "#8b5cf6", "#eab308", "#6366f1"];

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}

function thumbColor(externalId: string): string {
  let h = 0;
  for (let i = 0; i < externalId.length; i++) h = (h << 5) - h + externalId.charCodeAt(i);
  const idx = Math.abs(h) % THUMB_COLORS.length;
  return THUMB_COLORS[idx] ?? "#6b7280";
}

const PAGE_SIZE = 10;

export default function InventoryPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [source, setSource] = useState<{ id: string; websiteUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(0);
  const [selectionSaving, setSelectionSaving] = useState(false);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [localSelections, setLocalSelections] = useState<Record<string, boolean>>({});

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = useCallback(() => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    apiGet<{ data: InventoryItem[]; source?: { id: string; websiteUrl: string } }>(
      "/inventory/items",
      { customerId }
    )
      .then((res) => {
        if (res.ok) {
          const loadedItems = res.data.data ?? [];
          setItems(loadedItems);
          setSource(res.data.source ?? null);
          // Initialize local selections from loaded items
          const selections: Record<string, boolean> = {};
          for (const item of loadedItems) {
            selections[item.id] = item.isAdEligible ?? true;
          }
          setLocalSelections(selections);
        } else {
          setError(res.error);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load inventory");
      })
      .finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    if (customerId) load();
  }, [customerId, load]);

  // All hooks must be called before any conditional returns
  const oneDayAgo = useMemo(() => Date.now() - 24 * 60 * 60 * 1000, []);
  
  const newCount = useMemo(() => {
    return items.filter((i) => {
      try {
        return i.firstSeenAt && new Date(i.firstSeenAt).getTime() > oneDayAgo;
      } catch {
        return false;
      }
    }).length;
  }, [items, oneDayAgo]);
  
  const filtered = useMemo(() => {
    let list = [...items];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          (i.title ?? "").toLowerCase().includes(q) ||
          (i.externalId ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter === "active") list = list.filter((i) => i.status === "active");
    if (statusFilter === "new") {
      list = list.filter((i) => {
        try {
          return i.firstSeenAt && new Date(i.firstSeenAt).getTime() > oneDayAgo;
        } catch {
          return false;
        }
      });
    }
    if (statusFilter === "removed") list = list.filter((i) => i.status === "removed");
    if (sortBy === "recent") {
      list.sort((a, b) => {
        try {
          return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
        } catch {
          return 0;
        }
      });
    }
    if (sortBy === "price-high") list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    if (sortBy === "price-low") list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === "title") list.sort((a, b) => (a.title ?? "").localeCompare(b.title ?? ""));
    return list;
  }, [items, search, statusFilter, sortBy, oneDayAgo]);

  const handleSyncNow = async () => {
    if (!customerId) return;
    setSyncLoading(true);
    const res = await apiPost<{ runId: string }>("/runs/crawl", undefined, { customerId });
    setSyncLoading(false);
    if (res.ok) load();
  };

  const handleToggleSelection = async (itemIds: string[], isAdEligible: boolean) => {
    if (!customerId) return;
    setSelectionSaving(true);
    setSelectionError(null);
    
    // Optimistic update
    const newSelections = { ...localSelections };
    for (const id of itemIds) {
      newSelections[id] = isAdEligible;
    }
    setLocalSelections(newSelections);

    const res = await apiPost<{ updated: number; isAdEligible: boolean }>(
      "/inventory/items/select",
      { itemIds, isAdEligible },
      { customerId }
    );
    
    setSelectionSaving(false);
    if (!res.ok) {
      setSelectionError(res.error);
      // Revert optimistic update
      setLocalSelections((prev) => {
        const reverted = { ...prev };
        for (const id of itemIds) {
          reverted[id] = items.find((i) => i.id === id)?.isAdEligible ?? true;
        }
        return reverted;
      });
    } else {
      // Reload to sync with backend
      load();
    }
  };

  const handleBulkAction = (action: "includeAll" | "excludeAll" | "includeTop10") => {
    if (!customerId || items.length === 0) return;
    
    let itemIds: string[] = [];
    let isAdEligible = true;
    
    if (action === "includeAll") {
      itemIds = filtered.map((i) => i.id);
      isAdEligible = true;
    } else if (action === "excludeAll") {
      itemIds = filtered.map((i) => i.id);
      isAdEligible = false;
    } else if (action === "includeTop10") {
      const sorted = [...filtered].sort((a, b) => {
        try {
          return new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime();
        } catch {
          return 0;
        }
      });
      itemIds = sorted.slice(0, 10).map((i) => i.id);
      isAdEligible = true;
    }
    
    if (itemIds.length > 0) {
      handleToggleSelection(itemIds, isAdEligible);
    }
  };

  // Now we can do conditional returns after all hooks
  if (auth.status !== "authenticated") return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;

  const sourceDomain = source?.websiteUrl ? (() => {
    try { return new URL(source.websiteUrl).hostname; } catch { return source.websiteUrl; }
  })() : "—";
  
  const removedCount = 0; // MVP: not tracked
  const withImagesPct = items.length > 0 ? "—" : "—"; // MVP: no image data

  const totalFiltered = filtered.length;
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(totalFiltered / PAGE_SIZE);
  const start = totalFiltered === 0 ? 0 : page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, totalFiltered);

  return (
    <div style={{ maxWidth: 1280 }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              marginBottom: "0.5rem",
              color: "var(--pa-dark)",
            }}
          >
            Inventory
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
            {source
              ? `${items.length} active items detected from ${sourceDomain}`
              : "Connect a website first, then run a crawl to import inventory."}
          </p>
        </div>
        {source && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: 6,
                background: "white",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <Download size={16} />
              Export
            </button>
            <button
              type="button"
              onClick={handleSyncNow}
              disabled={syncLoading}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: 6,
                background: "white",
                cursor: syncLoading ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              <RefreshCw size={16} style={syncLoading ? { animation: "spin 1s linear infinite" } : undefined} />
              {syncLoading ? "Syncing…" : "Sync Now"}
            </button>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {selectionError && (
        <ErrorBanner
          message={`${t.inventory.selectionSaveFailed}: ${selectionError}`}
          onRetry={() => setSelectionError(null)}
        />
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
          description="Run a crawl from the dashboard to detect listings."
          actionLabel="Go to Dashboard"
          actionHref="/dashboard"
        />
      )}

      {source && items.length > 0 && (
        <>
          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>{items.length}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>Total active</div>
            </div>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "var(--pa-radius-lg)",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#166534", marginBottom: "0.25rem" }}>{newCount}</div>
              <div style={{ fontSize: "0.875rem", color: "#15803d" }}>New (24h)</div>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>{removedCount}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>Removed (24h)</div>
            </div>
            <div
              style={{
                background: "white",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                padding: "1.25rem",
              }}
            >
              <div style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>{withImagesPct}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>With images</div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              padding: "1rem 1.5rem",
              marginBottom: "1rem",
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", marginRight: "0.5rem" }}>
              {t.inventory.includeInAds}:
            </span>
            <button
              type="button"
              onClick={() => handleBulkAction("includeAll")}
              disabled={selectionSaving || filtered.length === 0}
              style={{
                padding: "0.375rem 0.75rem",
                border: "1px solid var(--pa-border)",
                borderRadius: 6,
                background: "white",
                cursor: selectionSaving || filtered.length === 0 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: selectionSaving || filtered.length === 0 ? 0.5 : 1,
              }}
            >
              {t.inventory.includeAll}
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("excludeAll")}
              disabled={selectionSaving || filtered.length === 0}
              style={{
                padding: "0.375rem 0.75rem",
                border: "1px solid var(--pa-border)",
                borderRadius: 6,
                background: "white",
                cursor: selectionSaving || filtered.length === 0 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: selectionSaving || filtered.length === 0 ? 0.5 : 1,
              }}
            >
              {t.inventory.excludeAll}
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction("includeTop10")}
              disabled={selectionSaving || filtered.length === 0}
              style={{
                padding: "0.375rem 0.75rem",
                border: "1px solid var(--pa-border)",
                borderRadius: 6,
                background: "white",
                cursor: selectionSaving || filtered.length === 0 ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                opacity: selectionSaving || filtered.length === 0 ? 0.5 : 1,
              }}
            >
              {t.inventory.includeTop10}
            </button>
            {selectionSaving && <span style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>{t.common.loading}</span>}
          </div>

          {/* Filters */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--pa-gray)" }} />
                <input
                  type="text"
                  placeholder="Search by title, VIN..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem 0.5rem 2.5rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    fontSize: "1rem",
                  }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                style={{
                  padding: "0.5rem 2rem 0.5rem 0.75rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: 6,
                  background: "white",
                  fontSize: "0.875rem",
                }}
              >
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="new">New (24h)</option>
                <option value="removed">Removed (24h)</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
                style={{
                  padding: "0.5rem 2rem 0.5rem 0.75rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: 6,
                  background: "white",
                  fontSize: "0.875rem",
                }}
              >
                <option value="recent">Most recent</option>
                <option value="price-high">Price: High to low</option>
                <option value="price-low">Price: Low to high</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>

          {/* Info banner */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "var(--pa-radius)",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#1e40af" }}>
              <strong>Read-only for MVP:</strong> Item details are automatically synced from your website.
              Editing and manual overrides coming in a future update.
            </p>
          </div>

          {/* Items table */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
              <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>All items ({totalFiltered})</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--pa-border)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", width: 64 }} />
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Title</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Price</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Last seen</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", width: 150 }}>
                      {t.inventory.includeInAds}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((item) => {
                    const isNew = new Date(item.firstSeenAt).getTime() > oneDayAgo;
                    return (
                      <tr
                        key={item.id}
                        style={{
                          borderBottom: "1px solid var(--pa-border)",
                          background: isNew ? "#f0fdf4" : undefined,
                        }}
                      >
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: 6,
                              background: `linear-gradient(135deg, ${thumbColor(item.externalId)}99, ${thumbColor(item.externalId)})`,
                            }}
                          />
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ fontWeight: 500 }}>{item.title ?? "—"}</div>
                          <div style={{ fontSize: "0.8rem", color: "var(--pa-gray)" }}>
                            ID: {item.externalId}
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>
                          {item.price != null ? (typeof item.price === "number" ? `$${item.price.toLocaleString()}` : item.price) : "—"}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {formatRelativeTime(item.lastSeenAt)}
                            {isNew && (
                              <span
                                style={{
                                  padding: "0.15rem 0.4rem",
                                  background: "#059669",
                                  color: "white",
                                  borderRadius: 4,
                                  fontSize: "0.7rem",
                                  fontWeight: 500,
                                }}
                              >
                                New
                              </span>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              background: item.status === "active" ? "#d1fae5" : "#f3f4f6",
                              color: item.status === "active" ? "#065f46" : "var(--pa-gray)",
                              border: `1px solid ${item.status === "active" ? "#a7f3d0" : "var(--pa-border)"}`,
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                              cursor: selectionSaving ? "not-allowed" : "pointer",
                              opacity: selectionSaving ? 0.5 : 1,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={localSelections[item.id] ?? (item.isAdEligible ?? true)}
                              onChange={(e) => {
                                if (!selectionSaving) {
                                  handleToggleSelection([item.id], e.target.checked);
                                }
                              }}
                              disabled={selectionSaving}
                              style={{ width: 16, height: 16, cursor: selectionSaving ? "not-allowed" : "pointer" }}
                            />
                            <span style={{ fontSize: "0.875rem" }}>
                              {localSelections[item.id] ?? (item.isAdEligible ?? true) ? "✓" : "✗"}
                            </span>
                          </label>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--pa-border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.875rem",
                color: "var(--pa-gray)",
              }}
            >
              <span>
                Showing {totalFiltered === 0 ? 0 : start}-{end} of {totalFiltered} items
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={{
                    padding: "0.375rem 0.75rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    cursor: page === 0 ? "not-allowed" : "pointer",
                    opacity: page === 0 ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  style={{
                    padding: "0.375rem 0.75rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
                    opacity: page >= totalPages - 1 ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
