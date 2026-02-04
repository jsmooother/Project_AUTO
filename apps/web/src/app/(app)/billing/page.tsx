"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Wallet, Calendar, Eye, MousePointerClick, TrendingUp, Users } from "lucide-react";

interface BillingPlan {
  billingMode: "time_based" | "impression_based";
  customerMonthlyPrice: number;
  customerCpmSek?: number;
  pacing: string;
  status: string;
}

interface BillingStatus {
  ok: boolean;
  balanceSek: number;
  plan: BillingPlan | null;
  creditsConsumedSekLast7d?: number;
  creditsConsumedSekLast30d?: number;
  creditsConsumedSekMtd?: number;
  deliverySummary?: { impressions: number; clicks: number; ctr: number; reach: number };
  usage: {
    period: { preset: string; since: string; until: string };
    creditsConsumedSek: number;
    impressions: number;
    clicks: number;
    ctr: number;
    reach: number;
  };
  hints?: string[];
}

export default function BillingPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<BillingStatus | null>(null);
  const [preset, setPreset] = useState<"last_7_days" | "last_30_days">("last_7_days");

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.user.customerId) return;
    setLoading(true);
    setError(null);
    apiGet<BillingStatus>(`/billing/status?preset=${preset}`, { customerId: auth.user.customerId })
      .then((res) => {
        if (!res.ok) {
          setError(res.errorDetail?.hint || res.error || "Failed to load billing");
          return;
        }
        setData(res.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load billing"))
      .finally(() => setLoading(false));
  }, [auth.status, auth.status === "authenticated" ? auth.user.customerId : null, preset]);

  if (auth.status === "loading" || loading) return <LoadingSpinner />;
  if (auth.status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  return (
    <div style={{ maxWidth: 1280 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            marginBottom: "0.5rem",
            color: "var(--pa-dark)",
          }}
        >
          Billing & Credits
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
          Your Project Auto credits and delivery metrics
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {data?.hints && data.hints.length > 0 && (
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            color: "#92400e",
          }}
        >
          {data.hints.map((h, i) => (
            <div key={i}>{h}</div>
          ))}
        </div>
      )}

      {data && (
        <>
          {/* Credits remaining */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Wallet style={{ width: 22, height: 22, color: "#37474f" }} />
              <span style={{ fontSize: "0.95rem", color: "#6b7280", fontWeight: 500 }}>Credits remaining</span>
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "#37474f" }}>
              {data.balanceSek.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
            </div>
          </div>

          {/* Plan */}
          {data.plan && (
            <div
              style={{
                background: "white",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                padding: "2rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Calendar style={{ width: 20, height: 20, color: "#6b7280" }} />
                <span style={{ fontSize: "1rem", fontWeight: 600, color: "#37474f" }}>Plan</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>Billing</div>
                  <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                    {data.plan.billingMode === "time_based" ? "Time-based" : "Impression-based"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>Monthly price</div>
                  <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                    {data.plan.customerMonthlyPrice.toLocaleString("sv-SE")} SEK
                  </div>
                </div>
                {data.plan.customerCpmSek != null && (
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>CPM (SEK)</div>
                    <div style={{ fontSize: "1rem", fontWeight: 500 }}>{data.plan.customerCpmSek} SEK</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>Status</div>
                  <div>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 500,
                        background: data.plan.status === "active" ? "#d1fae5" : "#fef3c7",
                        color: data.plan.status === "active" ? "#065f46" : "#92400e",
                      }}
                    >
                      {data.plan.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery summary (no spend) */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              padding: "2rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "#37474f" }}>
              Delivery summary
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
              <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <Eye style={{ width: 18, height: 18, color: "#6b7280" }} />
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Impressions</span>
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{data.usage.impressions.toLocaleString()}</div>
              </div>
              <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <MousePointerClick style={{ width: 18, height: 18, color: "#6b7280" }} />
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Clicks</span>
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{data.usage.clicks.toLocaleString()}</div>
              </div>
              <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <TrendingUp style={{ width: 18, height: 18, color: "#6b7280" }} />
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>CTR</span>
                </div>
                <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{data.usage.ctr.toFixed(2)}%</div>
              </div>
              {data.usage.reach > 0 && (
                <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Users style={{ width: 18, height: 18, color: "#6b7280" }} />
                    <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Reach</span>
                  </div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{data.usage.reach.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Usage in period */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              padding: "2rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#37474f" }}>Credits used</h2>
              <div style={{ display: "flex", gap: "0.25rem", background: "#f3f4f6", padding: "0.25rem", borderRadius: "6px" }}>
                <button
                  type="button"
                  onClick={() => setPreset("last_7_days")}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: "4px",
                    border: "none",
                    background: preset === "last_7_days" ? "white" : "transparent",
                    color: preset === "last_7_days" ? "#37474f" : "#6b7280",
                    fontSize: "0.875rem",
                    fontWeight: preset === "last_7_days" ? 500 : 400,
                    cursor: "pointer",
                    boxShadow: preset === "last_7_days" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  onClick={() => setPreset("last_30_days")}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: "4px",
                    border: "none",
                    background: preset === "last_30_days" ? "white" : "transparent",
                    color: preset === "last_30_days" ? "#37474f" : "#6b7280",
                    fontSize: "0.875rem",
                    fontWeight: preset === "last_30_days" ? 500 : 400,
                    cursor: "pointer",
                    boxShadow: preset === "last_30_days" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  }}
                >
                  Last 30 days
                </button>
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "0.5rem" }}>
              {data.usage.period.since} – {data.usage.period.until}
            </p>
            <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "#37474f", marginBottom: "0.75rem" }}>
              {data.usage.creditsConsumedSek.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
            </div>
            {typeof data.creditsConsumedSekMtd === "number" && (
              <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                This month (MTD): {data.creditsConsumedSekMtd.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
              </p>
            )}
          </div>
        </>
      )}

      {!loading && !data && !error && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius-lg)",
            padding: "2rem",
          }}
        >
          <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem" }}>No billing data available.</p>
        </div>
      )}
    </div>
  );
}
