"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useI18n } from "@/lib/i18n/context";
import { BarChart3, DollarSign, Megaphone, TrendingUp, Package, AlertTriangle } from "lucide-react";

const DASHBOARD_INVENTORY_COUNT_KEY = "dashboard_last_inventory_count";

interface PerformanceSummary {
  totals?: { impressions?: number; clicks?: number; ctr?: number; reach?: number };
  mode?: string;
  hint?: string;
}

interface BillingStatus {
  balanceSek?: number;
  creditsConsumedSekLast7d?: number;
  creditsConsumedSekMtd?: number;
  hint?: string;
}

interface AdsStatus {
  prerequisites?: { inventory?: { count?: number }; meta?: { ok?: boolean } };
  settings?: { lastSyncedAt?: string | null; status?: string } | null;
  objects?: { status?: string; campaignId?: string } | null;
  lastRuns?: { status: string; finishedAt?: string | null }[];
}

function DashboardContent() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [adsStatus, setAdsStatus] = useState<AdsStatus | null>(null);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevInventoryCountRef = useRef<number | null>(null);

  const load = () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<PerformanceSummary>("/performance/summary?preset=last_7d", { customerId }),
      apiGet<BillingStatus>("/billing/status", { customerId }),
      apiGet<AdsStatus>("/ads/status", { customerId }),
      apiGet<{ data: unknown[] }>("/inventory/items", { customerId }),
    ])
      .then(([perf, bill, ads, inv]) => {
        if (perf.ok) setPerformance(perf.data);
        if (bill.ok) setBilling(bill.data);
        if (ads.ok) setAdsStatus(ads.data);
        if (inv.ok) {
          const count = Array.isArray(inv.data.data) ? inv.data.data.length : 0;
          setInventoryCount(count);
          if (typeof window !== "undefined") {
            const prev = window.localStorage.getItem(DASHBOARD_INVENTORY_COUNT_KEY);
            const prevNum = prev != null ? parseInt(prev, 10) : null;
            if (prevNum !== null && count > prevNum) prevInventoryCountRef.current = prevNum;
            window.localStorage.setItem(DASHBOARD_INVENTORY_COUNT_KEY, String(count));
          }
        }
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  useEffect(() => {
    const metaParam = searchParams.get("meta");
    if (metaParam === "connected" || metaParam === "error") {
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  if (auth.status !== "authenticated" || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  const balanceSek = billing?.balanceSek ?? 0;
  const creditsLast7d = billing?.creditsConsumedSekLast7d ?? 0;
  const creditsMtd = billing?.creditsConsumedSekMtd ?? 0;
  const runwayDays = creditsLast7d > 0 ? balanceSek / (creditsLast7d / 7) : 999;
  const ctr = performance?.totals?.ctr ?? 0;
  const impressions = performance?.totals?.impressions ?? 0;
  const hasCampaign = !!adsStatus?.objects?.campaignId;
  const metaConnected = !!adsStatus?.prerequisites?.meta?.ok;
  const showInventoryIncreased =
    prevInventoryCountRef.current !== null && inventoryCount > prevInventoryCountRef.current;
  const lastRun = adsStatus?.lastRuns?.[0];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
          {t.dashboard.title}
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>{t.dashboard.subtitle}</p>
      </div>

      {/* Upsell banners */}
      {runwayDays < 7 && runwayDays > 0 && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem 1.25rem",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "var(--pa-radius)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <AlertTriangle size={20} color="#92400e" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: "0.875rem", color: "#92400e" }}>{t.dashboard.lowCreditsRunway}</p>
            <Link href="/billing" style={{ fontSize: "0.875rem", color: "var(--pa-blue)", fontWeight: 500 }}>
              {t.dashboard.topUpCta} →
            </Link>
          </div>
        </div>
      )}
      {ctr > 2.5 && runwayDays > 10 && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem 1.25rem",
            background: "#d1fae5",
            border: "1px solid #a7f3d0",
            borderRadius: "var(--pa-radius)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <TrendingUp size={20} color="#059669" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: "0.875rem", color: "#065f46" }}>{t.dashboard.scaleSuggestion}</p>
            <Link href="/billing" style={{ fontSize: "0.875rem", color: "var(--pa-blue)", fontWeight: 500 }}>
              {t.nav.billing} →
            </Link>
          </div>
        </div>
      )}
      {showInventoryIncreased && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem 1.25rem",
            background: "#dbeafe",
            border: "1px solid #93c5fd",
            borderRadius: "var(--pa-radius)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Package size={20} color="#2563eb" />
          <p style={{ fontWeight: 500, fontSize: "0.875rem", color: "#1e40af" }}>{t.dashboard.inventoryIncreased}</p>
        </div>
      )}
      {impressions === 0 && metaConnected && hasCampaign && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "1rem 1.25rem",
            background: "#f3f4f6",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <Megaphone size={20} color="var(--pa-gray)" />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 500, fontSize: "0.875rem", color: "var(--pa-gray)" }}>{t.dashboard.campaignPausedHint}</p>
            <Link href="/ads" style={{ fontSize: "0.875rem", color: "var(--pa-blue)", fontWeight: 500 }}>
              {t.nav.ads} →
            </Link>
          </div>
        </div>
      )}

      {/* Performance snapshot */}
      <div
        style={{
          marginBottom: "1.5rem",
          background: "white",
          border: "1px solid var(--pa-border)",
          borderRadius: "var(--pa-radius-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
          <h2 style={{ fontWeight: 600, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart3 size={18} />
            {t.dashboard.performanceSnapshot}
          </h2>
        </div>
        <div style={{ padding: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: 4 }}>{t.dashboard.impressions}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{performance?.totals?.impressions ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: 4 }}>{t.dashboard.clicks}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{performance?.totals?.clicks ?? 0}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: 4 }}>{t.dashboard.ctr}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{typeof performance?.totals?.ctr === "number" ? `${performance.totals.ctr}%` : "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: 4 }}>{t.dashboard.reach}</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{performance?.totals?.reach ?? 0}</div>
          </div>
        </div>
        {performance?.hint && (
          <div style={{ padding: "0 1.5rem 1rem", fontSize: "0.75rem", color: "var(--pa-gray)" }}>{performance.hint}</div>
        )}
      </div>

      {/* Credits + Ads status row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
        <div
          style={{
            background: "white",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius-lg)",
            padding: "1.25rem 1.5rem",
          }}
        >
          <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <DollarSign size={18} />
            {t.dashboard.creditsRemaining}
          </h3>
          <p style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: 4 }}>{balanceSek} SEK</p>
          <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
            {t.dashboard.creditsUsedMtd}: {creditsMtd} SEK
          </p>
          <Link href="/billing" style={{ fontSize: "0.875rem", color: "var(--pa-blue)", marginTop: "0.5rem", display: "inline-block" }}>
            {t.nav.billing} →
          </Link>
        </div>
        <div
          style={{
            background: "white",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius-lg)",
            padding: "1.25rem 1.5rem",
          }}
        >
          <h3 style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={18} />
            {t.dashboard.adsStatus}
          </h3>
          <p style={{ fontSize: "0.875rem", marginBottom: 4 }}>
            {adsStatus?.objects?.status ? String(adsStatus.objects.status) : "—"}
          </p>
          <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
            {t.dashboard.lastSync}: {lastRun?.finishedAt ? new Date(lastRun.finishedAt).toLocaleDateString() : "—"}
          </p>
          <Link href="/ads" style={{ fontSize: "0.875rem", color: "var(--pa-blue)", marginTop: "0.5rem", display: "inline-block" }}>
            {t.nav.ads} →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}
