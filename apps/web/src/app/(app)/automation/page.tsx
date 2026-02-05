"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useI18n } from "@/lib/i18n/context";
import { Play, RefreshCw, CheckCircle2, DollarSign, Info } from "lucide-react";

interface Run {
  id: string;
  type: "crawl" | "preview";
  trigger: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

interface BillingStatus {
  ok: boolean;
  balanceSek: number;
  plan: {
    billingMode: string;
    customerMonthlyPrice: number;
    pacing: string;
    status: string;
  } | null;
  monthlyPriceSek: number | null;
  creditsConsumedSekMtd: number;
  hints?: string[];
}

function AutomationContent() {
  const { auth } = useAuth();
  const { t, formatCurrency, formatDate, formatDateTime } = useI18n();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") === "history" ? "history" : "automation";
  
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [inventoryItems, setInventoryItems] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSource, setHasSource] = useState(false);
  const [runNowLoading, setRunNowLoading] = useState(false);
  const [runNowError, setRunNowError] = useState<string | null>(null);
  const [runNowHint, setRunNowHint] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [updateBudgetLoading, setUpdateBudgetLoading] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = () => {
    if (!customerId) return;
    setLoading(true);
    Promise.all([
      apiGet<BillingStatus>("/billing/status", { customerId }),
      apiGet<{ data: Run[] }>("/runs?type=crawl&limit=50", { customerId }),
      apiGet<{ data: unknown[]; source?: unknown }>("/inventory/items", { customerId }),
    ])
      .then(([billingRes, runsRes, invRes]) => {
        if (billingRes.ok) {
          setBillingStatus(billingRes.data);
          // Use SEK directly (Swedish default)
          const budgetSek = billingRes.data.plan?.customerMonthlyPrice ?? 50000;
          setBudgetInput(String(budgetSek));
        } else setError(billingRes.error);
        if (runsRes.ok) setRuns(runsRes.data.data ?? []);
        if (invRes?.ok) {
          setHasSource(!!invRes.data.source);
          setInventoryItems(Array.isArray(invRes.data.data) ? invRes.data.data : []);
        }
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  const handleRunNow = async () => {
    if (!customerId) return;
    setRunNowError(null);
    setRunNowHint(null);
    setRunNowLoading(true);
    const res = await apiPost<{ runId: string }>("/runs/crawl", undefined, { customerId });
    setRunNowLoading(false);
    if (res.ok) load();
    else {
      setRunNowError(res.error);
      setRunNowHint(res.errorDetail?.hint ?? null);
    }
  };

  const handleUpdateBudget = async () => {
    if (!customerId || !budgetInput) return;
    setUpdateBudgetLoading(true);
    // TODO: Implement budget update API call when available
    // For now, just show a message
    setTimeout(() => {
      setUpdateBudgetLoading(false);
      alert("Budget update functionality coming soon");
    }, 500);
  };

  if (auth.status !== "authenticated") return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;

  const plan = billingStatus?.plan;
  // Use SEK directly (Swedish default)
  const monthlyBudget = plan?.customerMonthlyPrice ?? 50000;
  const spent = billingStatus?.creditsConsumedSekMtd ?? 0;
  const spentPercent = monthlyBudget > 0 ? Math.min((spent / monthlyBudget) * 100, 100) : 0;
  
  // Calculate days remaining in billing cycle (simplified - assumes monthly cycle)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  const latestRun = runs.length > 0 ? runs[0] : null;
  const lastRunTime = latestRun?.finishedAt 
    ? new Date(latestRun.finishedAt).toLocaleString()
    : "Never";
  const lastRunAgo = latestRun?.finishedAt
    ? (() => {
        const diff = Date.now() - new Date(latestRun.finishedAt).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} ${days > 1 ? "dagar" : "dag"} sedan`;
        if (hours > 0) return `${hours} ${hours > 1 ? "timmar" : "timme"} sedan`;
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes > 0 ? `${minutes} ${minutes > 1 ? "minuter" : "minut"} sedan` : "Nyss";
      })()
    : t.automation.never;

  const statusStyle = (status: string) => {
    if (status === "success") return { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" };
    if (status === "failed") return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
    if (status === "running" || status === "queued") return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    return { bg: "#f3f4f6", color: "var(--pa-gray)", border: "var(--pa-border)" };
  };

  return (
    <div style={{ maxWidth: 1280 }}>
      {/* Header */}
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
          {t.automation.title}
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
          {t.automation.description}
        </p>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {runNowError && <ErrorBanner message={runNowError} hint={runNowHint ?? undefined} />}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
        <Link
          href="/automation"
          style={{
            padding: "0.75rem 1rem",
            borderBottom: activeTab === "automation" ? "2px solid var(--pa-dark)" : "2px solid transparent",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: activeTab === "automation" ? "var(--pa-dark)" : "var(--pa-gray)",
            textDecoration: "none",
            marginBottom: "-1px",
          }}
        >
          {t.automation.title} & Budget
        </Link>
        <Link
          href="/automation?tab=history"
          style={{
            padding: "0.75rem 1rem",
            borderBottom: activeTab === "history" ? "2px solid var(--pa-dark)" : "2px solid transparent",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: activeTab === "history" ? "var(--pa-dark)" : "var(--pa-gray)",
            textDecoration: "none",
            marginBottom: "-1px",
          }}
        >
          {t.automation.runHistory}
        </Link>
      </div>

      {activeTab === "automation" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Monthly Budget Card */}
          <div
            style={{
              background: "white",
              border: "2px solid #86efac",
              borderRadius: "var(--pa-radius-lg)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--pa-radius)",
                    background: "#dcfce7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DollarSign style={{ width: 20, height: 20, color: "#16a34a" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                    {t.automation.monthlyBudget}
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    {t.automation.monthlyBudgetDescription}
                  </p>
                </div>
              </div>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label
                  htmlFor="budget"
                  style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.5rem" }}
                >
                  {t.automation.monthlyBudgetUsd}
                </label>
                <input
                  id="budget"
                  type="number"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  placeholder="50000"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    fontSize: "1rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: "6px",
                  }}
                />
                <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginTop: "0.5rem" }}>
                  {t.automation.metaAdsLimit}
                </p>
              </div>

              {/* Current Usage */}
              <div style={{ padding: "1rem", background: "#f9fafb", borderRadius: "var(--pa-radius)", border: "1px solid var(--pa-border)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>
                    {t.automation.currentMonthUsage}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      border: "1px solid var(--pa-border)",
                      color: "var(--pa-gray)",
                    }}
                  >
                    {now.toLocaleDateString("sv-SE", { month: "short", year: "numeric" })}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.875rem" }}>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(spent)}</span>
                    <span style={{ color: "var(--pa-gray)" }}>av {formatCurrency(monthlyBudget)} budget</span>
                  </div>
                  <div style={{ width: "100%", background: "#e5e7eb", borderRadius: "9999px", height: 10 }}>
                    <div
                      style={{
                        background: "#16a34a",
                        height: 10,
                        borderRadius: "9999px",
                        width: `${spentPercent}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginTop: "0.25rem" }}>
                    {daysRemaining} {t.automation.daysRemaining}
                  </div>
                </div>
              </div>

              {/* Budget Explanation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "1rem",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "var(--pa-radius)",
                }}
              >
                <Info style={{ width: 20, height: 20, color: "#2563eb", flexShrink: 0, marginTop: "0.125rem" }} />
                <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                  <p style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{t.automation.howBudgetWorks}</p>
                  <p>
                    {t.automation.howBudgetWorksText}
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleUpdateBudget}
                  disabled={updateBudgetLoading}
                  style={{
                    padding: "0.5rem 1rem",
                    background: updateBudgetLoading ? "#d1d5db" : "var(--pa-dark)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    cursor: updateBudgetLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {updateBudgetLoading ? t.common.loading : t.automation.updateBudget}
                </button>
              </div>
            </div>
          </div>

          {/* Automation Modes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            {/* Always On */}
            <div
              style={{
                background: "white",
                border: "2px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--pa-radius)",
                      background: "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <RefreshCw style={{ width: 24, height: 24, color: "#2563eb" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>{t.automation.alwaysOn}</h3>
                      <span
                        style={{
                          padding: "0.125rem 0.5rem",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          background: "#16a34a",
                          color: "white",
                        }}
                      >
                        {t.automation.active}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                      {t.automation.alwaysOnDescription}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "var(--pa-radius)",
                      border: "1px solid var(--pa-border)",
                    }}
                  >
                    <div>
                      <label
                        htmlFor="enable-auto"
                        style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.25rem" }}
                      >
                        {t.automation.enableAutomaticSync}
                      </label>
                      <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>
                        {t.automation.enableAutomaticSyncDescription}
                      </p>
                    </div>
                    <label
                      style={{
                        position: "relative",
                        display: "inline-block",
                        width: 44,
                        height: 24,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        id="enable-auto"
                        type="checkbox"
                        checked={autoSyncEnabled}
                        onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                        style={{ opacity: 0, width: 0, height: 0 }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: autoSyncEnabled ? "#374151" : "#d1d5db",
                          borderRadius: "9999px",
                          transition: "0.3s",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: 2,
                            left: autoSyncEnabled ? 22 : 2,
                            width: 20,
                            height: 20,
                            background: "white",
                            borderRadius: "50%",
                            transition: "0.3s",
                          }}
                        />
                      </span>
                    </label>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "var(--pa-radius)",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
                      <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{t.automation.nextScheduledRun}</div>
                      <div>Ikväll kl 02:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* On Demand */}
            <div
              style={{
                background: "white",
                border: "2px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--pa-radius)",
                      background: "#dcfce7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Play style={{ width: 24, height: 24, color: "#16a34a" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>{t.automation.onDemand}</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                      {t.automation.onDemandDescription}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div
                    style={{
                      padding: "1rem",
                      background: "#f9fafb",
                      borderRadius: "var(--pa-radius)",
                      border: "1px solid var(--pa-border)",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.75rem" }}>
                      {t.automation.runManualSyncDescription}
                    </div>
                    <button
                      type="button"
                      onClick={handleRunNow}
                      disabled={runNowLoading || !hasSource}
                      style={{
                        width: "100%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        background: runNowLoading || !hasSource ? "#d1d5db" : "var(--pa-dark)",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        fontWeight: 500,
                        fontSize: "0.875rem",
                        cursor: runNowLoading || !hasSource ? "not-allowed" : "pointer",
                      }}
                    >
                      <Play style={{ width: 16, height: 16 }} />
                      {runNowLoading ? t.common.loading : t.automation.runManualSync}
                    </button>
                  </div>

                  <div
                    style={{
                      padding: "1rem",
                      background: "#f9fafb",
                      border: "1px solid var(--pa-border)",
                      borderRadius: "var(--pa-radius)",
                    }}
                  >
                    <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                      <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>{t.automation.lastManualRun}</div>
                      <div>
                        {lastRunAgo === t.automation.never ? t.automation.never : `${lastRunAgo} • ${latestRun?.status === "success" ? t.automation.completedSuccessfully : latestRun?.status || "Okänt"}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
              <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>{t.automation.currentStatus}</h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>{t.automation.mode}</div>
                  <span
                    style={{
                      padding: "0.25rem 0.5rem",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      background: "#2563eb",
                      color: "white",
                    }}
                  >
                    {t.automation.alwaysOn}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>{t.automation.lastRun}</div>
                  <div style={{ fontWeight: 500 }}>{lastRunAgo}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>{t.automation.status}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#16a34a", fontWeight: 500 }}>
                    <CheckCircle2 style={{ width: 16, height: 16 }} />
                    {t.automation.healthy}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>{t.automation.itemsSynced}</div>
                  <div style={{ fontWeight: 500 }}>
                    {inventoryItems.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How Automation Works */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
              <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>{t.automation.howAutomationWorks}</h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.875rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", marginTop: "0.375rem", flexShrink: 0 }} />
                  <div>
                    <strong>{t.automation.autoCreateAds}</strong> {t.automation.autoCreateAdsText}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", marginTop: "0.375rem", flexShrink: 0 }} />
                  <div>
                    <strong>{t.automation.autoPauseAds}</strong> {t.automation.autoPauseAdsText}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", marginTop: "0.375rem", flexShrink: 0 }} />
                  <div>
                    <strong>{t.automation.budgetDistribution}</strong> {t.automation.budgetDistributionText}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb", marginTop: "0.375rem", flexShrink: 0 }} />
                  <div>
                    <strong>{t.automation.dailyMonitoring}</strong> {t.automation.dailyMonitoringText}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius-lg)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>{t.automation.allRuns}</h2>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>{t.automation.last30Days}</div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            {runs.length === 0 ? (
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--pa-gray)" }}>
                Inga körningar ännu. Kör en manuell synkronisering för att komma igång.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--pa-border)", textAlign: "left" }}>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>{t.automation.started}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>{t.automation.trigger}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>{t.automation.duration}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", textAlign: "right" }}>{t.automation.seen}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", textAlign: "right" }}>{t.automation.new}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", textAlign: "right" }}>{t.automation.removed}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>{t.automation.statusCol}</th>
                    <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {runs.slice(0, 10).map((run) => {
                    const s = statusStyle(run.status);
                    const duration = run.startedAt && run.finishedAt
                      ? (() => {
                          const diff = new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime();
                          const minutes = Math.floor(diff / 60000);
                          const seconds = Math.floor((diff % 60000) / 1000);
                          return `${minutes}m ${seconds}s`;
                        })()
                      : run.startedAt && !run.finishedAt
                      ? t.automation.running
                      : "—";
                    return (
                      <tr key={run.id} style={{ borderBottom: "1px solid var(--pa-border)" }}>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ fontWeight: 500 }}>
                            {run.startedAt ? formatDate(run.startedAt) : "—"}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>
                            {run.startedAt ? new Date(run.startedAt).toLocaleTimeString("sv-SE", { hour: "numeric", minute: "2-digit" }) : "—"}
                          </div>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              border: "1px solid var(--pa-border)",
                              color: "var(--pa-gray)",
                            }}
                          >
                            {run.trigger === "manual" ? t.automation.manual : t.automation.scheduled}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem", color: "var(--pa-gray)" }}>{duration}</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>247</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: "#16a34a", fontWeight: 500 }}>12</td>
                        <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>3</td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <span
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              background: s.bg,
                              color: s.color,
                              border: `1px solid ${s.border}`,
                            }}
                          >
                            {run.status === "success" ? t.automation.success : run.status === "failed" ? t.automation.failed : run.status === "running" ? t.automation.running : run.status === "queued" ? t.automation.queued : run.status}
                          </span>
                        </td>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <Link
                            href={`/runs?type=crawl`}
                            style={{
                              padding: "0.25rem 0.5rem",
                              fontSize: "0.875rem",
                              color: "var(--pa-dark)",
                              textDecoration: "none",
                            }}
                          >
                            {t.common.view}
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AutomationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AutomationContent />
    </Suspense>
  );
}
