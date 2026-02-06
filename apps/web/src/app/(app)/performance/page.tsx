"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState } from "@/components/EmptyState";
import { Eye, MousePointerClick, TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";

interface PerformanceSummary {
  mode: "real" | "sim" | "disabled";
  meta: { connected: boolean; selectedAdAccountId?: string };
  objects: { campaignId?: string; adsetId?: string; adId?: string };
  dateRange: { preset?: "last_7d" | "last_30d"; since: string; until: string };
  totals: { impressions: number; reach: number; clicks: number; ctr: number };
  byDay: Array<{ date: string; impressions: number; clicks: number }>;
  hint?: string;
  _debug?: {
    adAccountId: string | null;
    campaignId: string | null;
    graphVersion: string;
    hasData: boolean;
  };
}

export default function PerformancePage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PerformanceSummary | null>(null);
  const [preset, setPreset] = useState<"last_7d" | "last_30d">("last_7d");
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (!customerId) {
        setError("Not authenticated");
        return;
      }
      const result = await apiGet<PerformanceSummary>(`/performance/summary?preset=${preset}`, {
        customerId,
      });

      if (!result.ok) {
        // Handle OAuth errors specifically (check error message for OAuth hints)
        const errorMsg = result.errorDetail?.hint || result.error || "";
        if (errorMsg.toLowerCase().includes("reconnect") || errorMsg.toLowerCase().includes("oauth")) {
          setError(errorMsg || "Meta connection expired. Please reconnect.");
          // Optionally redirect to settings after a delay
          setTimeout(() => {
            if (typeof window !== "undefined") {
              window.location.href = "/settings";
            }
          }, 3000);
        } else {
          setError(errorMsg || "Failed to load performance data");
        }
        return;
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customerId, preset]);

  useEffect(() => {
    if (auth.status === "authenticated" && customerId) {
      loadData();
    }
  }, [auth.status, customerId, loadData]);

  if (auth.status === "loading" || loading) {
    return <LoadingSpinner />;
  }

  if (auth.status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  // Empty states
  if (data && data.mode === "disabled") {
    if (!data.meta.connected) {
      return (
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Performance</h1>
          <EmptyState
            title="Meta account not connected"
            description={data.hint || "Connect your Meta account to view campaign performance."}
            actionLabel="Go to Settings"
            actionHref="/settings"
          />
        </div>
      );
    }

    if (!data.objects.campaignId) {
      return (
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Performance</h1>
          <EmptyState
            title="No campaign published yet"
            description={data.hint || "Publish a campaign from the Ads page to start tracking performance."}
            actionLabel="Go to Ads"
            actionHref="/ads"
          />
        </div>
      );
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Performance</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* Date range selector */}
          <div style={{ display: "flex", gap: "0.25rem", background: "#f3f4f6", padding: "0.25rem", borderRadius: "6px" }}>
            <button
              type="button"
              onClick={() => setPreset("last_7d")}
              style={{
                padding: "0.375rem 0.75rem",
                borderRadius: "4px",
                border: "none",
                background: preset === "last_7d" ? "white" : "transparent",
                color: preset === "last_7d" ? "#37474f" : "#6b7280",
                fontSize: "0.875rem",
                fontWeight: preset === "last_7d" ? 500 : 400,
                cursor: "pointer",
                boxShadow: preset === "last_7d" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              Last 7 days
            </button>
            <button
              type="button"
              onClick={() => setPreset("last_30d")}
              style={{
                padding: "0.375rem 0.75rem",
                borderRadius: "4px",
                border: "none",
                background: preset === "last_30d" ? "white" : "transparent",
                color: preset === "last_30d" ? "#37474f" : "#6b7280",
                fontSize: "0.875rem",
                fontWeight: preset === "last_30d" ? 500 : 400,
                cursor: "pointer",
                boxShadow: preset === "last_30d" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              }}
            >
              Last 30 days
            </button>
          </div>
          {/* Refresh button */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: refreshing ? "#9ca3af" : "#37474f",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: refreshing ? "not-allowed" : "pointer",
            }}
          >
            <RefreshCw style={{ width: 16, height: 16, animation: refreshing ? "spin 1s linear infinite" : undefined }} />
            Refresh
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {data?.mode === "sim" && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "#92400e",
          }}
        >
          <AlertTriangle style={{ width: 16, height: 16 }} />
          <span>{data.hint || "Dev/sim mode — not real Meta spend"}</span>
        </div>
      )}

      {/* Empty data message for paused/new campaigns */}
      {data && data.mode === "real" && data.byDay.length === 0 && data.totals.impressions === 0 && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "6px",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            color: "#075985",
          }}
        >
          <strong>No delivery yet.</strong> Campaign may be paused, still learning, or too new. Check back after the campaign has been active.
        </div>
      )}

      {/* Meta Debug Panel */}
      {data && data._debug && typeof window !== "undefined" && process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <details
            style={{
              padding: "0.75rem 1rem",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "0.875rem",
            }}
          >
            <summary
              style={{
                cursor: "pointer",
                fontWeight: 500,
                color: "#6b7280",
                userSelect: "none",
              }}
            >
              Meta Debug Info
            </summary>
            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #e5e7eb", display: "grid", gap: "0.5rem" }}>
              <div>
                <strong style={{ color: "#37474f" }}>Ad Account ID:</strong>{" "}
                <code style={{ background: "#f3f4f6", padding: "0.125rem 0.375rem", borderRadius: "3px", fontSize: "0.8125rem" }}>
                  {data._debug.adAccountId || "Not set"}
                </code>
              </div>
              <div>
                <strong style={{ color: "#37474f" }}>Campaign ID:</strong>{" "}
                <code style={{ background: "#f3f4f6", padding: "0.125rem 0.375rem", borderRadius: "3px", fontSize: "0.8125rem" }}>
                  {data._debug.campaignId || "Not set"}
                </code>
              </div>
              <div>
                <strong style={{ color: "#37474f" }}>Date Range:</strong> {data.dateRange.since} to {data.dateRange.until} ({data.dateRange.preset || "N/A"})
              </div>
              <div>
                <strong style={{ color: "#37474f" }}>Graph API Version:</strong> {data._debug.graphVersion}
              </div>
              <div>
                <strong style={{ color: "#37474f" }}>Has Data:</strong> {data._debug.hasData ? "Yes" : "No"}
              </div>
            </div>
          </details>
        </div>
      )}

      {data && (
        <>
          {/* Summary cards - no spend metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Eye style={{ width: 20, height: 20, color: "#6b7280" }} />
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Impressions</div>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37474f" }}>
                {data.totals.impressions.toLocaleString()}
              </div>
            </div>

            <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <MousePointerClick style={{ width: 20, height: 20, color: "#6b7280" }} />
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Clicks</div>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37474f" }}>{data.totals.clicks.toLocaleString()}</div>
            </div>

            <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <TrendingUp style={{ width: 20, height: 20, color: "#6b7280" }} />
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>CTR</div>
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37474f" }}>
                {data.totals.ctr.toFixed(2)}%
              </div>
            </div>

            {data.totals.reach > 0 && (
              <div style={{ padding: "1.5rem", background: "white", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.5rem" }}>Reach</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37474f" }}>
                  {data.totals.reach.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* Daily breakdown table */}
          <div style={{ background: "white", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Daily Breakdown</h2>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontSize: "0.875rem", fontWeight: 600, color: "#6b7280" }}>
                      Date
                    </th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.875rem", fontWeight: 600, color: "#6b7280" }}>
                      Impressions
                    </th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.875rem", fontWeight: 600, color: "#6b7280" }}>
                      Clicks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.byDay.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "2rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
                        No data available for this period
                      </td>
                    </tr>
                  ) : (
                    data.byDay.map((day) => (
                      <tr key={day.date} style={{ borderBottom: "1px solid #f3f4f6" }}>
                        <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "#37474f" }}>
                          {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.875rem", color: "#37474f" }}>
                          {day.impressions.toLocaleString()}
                        </td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.875rem", color: "#37474f" }}>
                          {day.clicks.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
