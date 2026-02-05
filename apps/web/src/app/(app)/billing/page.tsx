"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PageHeader, Card, CardHeader, CardContent, StatCard, Banner, Badge } from "@/components/ui";
import { Wallet, Calendar, Eye, MousePointerClick, TrendingUp, Users } from "lucide-react";

interface BillingPlan {
  billingMode: "time_based" | "impression_based";
  customerMonthlyPrice: number;
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
      <PageHeader
        title="Billing & Credits"
        description="Your Project Auto credits and delivery metrics"
      />

      {error && <ErrorBanner message={error} />}

      {data?.hints && data.hints.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Banner variant="warning">
            {data.hints.map((h, i) => (
              <div key={i}>{h}</div>
            ))}
          </Banner>
        </div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Credits remaining */}
          <Card>
            <CardContent>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Wallet style={{ width: 22, height: 22, color: "var(--pa-gray)" }} />
                <span style={{ fontSize: "0.95rem", color: "var(--pa-gray)", fontWeight: 500 }}>Credits remaining</span>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--pa-dark)" }}>
                {data.balanceSek.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
              </div>
            </CardContent>
          </Card>

          {/* Plan */}
          {data.plan && (
            <Card>
              <CardHeader title="Plan" />
              <CardContent>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginBottom: "0.25rem" }}>Billing</div>
                    <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                      {data.plan.billingMode === "time_based" ? "Time-based" : "Impression-based"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginBottom: "0.25rem" }}>Monthly price</div>
                    <div style={{ fontSize: "1rem", fontWeight: 500 }}>
                      {data.plan.customerMonthlyPrice.toLocaleString("sv-SE")} SEK
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginBottom: "0.25rem" }}>Status</div>
                    <Badge variant={data.plan.status === "active" ? "success" : "warning"}>
                      {data.plan.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery summary (no spend) */}
          <Card>
            <CardHeader title="Delivery summary" />
            <CardContent>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "1rem" }}>
                <StatCard label="Impressions" value={data.usage.impressions.toLocaleString()} icon={Eye} />
                <StatCard label="Clicks" value={data.usage.clicks.toLocaleString()} icon={MousePointerClick} />
                <StatCard label="CTR" value={`${data.usage.ctr.toFixed(2)}%`} icon={TrendingUp} />
                {data.usage.reach > 0 && (
                  <StatCard label="Reach" value={data.usage.reach.toLocaleString()} icon={Users} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Usage in period */}
          <Card>
            <CardHeader
              title="Credits used"
              actions={
                <div style={{ display: "flex", gap: "0.25rem", background: "#f3f4f6", padding: "0.25rem", borderRadius: "6px" }}>
                  <button
                    type="button"
                    onClick={() => setPreset("last_7_days")}
                    style={{
                      padding: "0.375rem 0.75rem",
                      borderRadius: "4px",
                      border: "none",
                      background: preset === "last_7_days" ? "white" : "transparent",
                      color: preset === "last_7_days" ? "var(--pa-dark)" : "var(--pa-gray)",
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
                      color: preset === "last_30_days" ? "var(--pa-dark)" : "var(--pa-gray)",
                      fontSize: "0.875rem",
                      fontWeight: preset === "last_30_days" ? 500 : 400,
                      cursor: "pointer",
                      boxShadow: preset === "last_30_days" ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                    }}
                  >
                    Last 30 days
                  </button>
                </div>
              }
            />
            <CardContent>
              <p style={{ fontSize: "0.9rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                {data.usage.period.since} – {data.usage.period.until}
              </p>
              <div style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--pa-dark)", marginBottom: "0.75rem" }}>
                {data.usage.creditsConsumedSek.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
              </div>
              {typeof data.creditsConsumedSekMtd === "number" && (
                <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                  This month (MTD): {data.creditsConsumedSekMtd.toLocaleString("sv-SE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} SEK
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!loading && !data && !error && (
        <Card>
          <CardContent>
            <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem" }}>No billing data available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
