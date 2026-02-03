"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { AlertTriangle, Globe, RefreshCw, CheckCircle2 } from "lucide-react";

function MetaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z" />
    </svg>
  );
}

interface OnboardingStatus {
  status: "not_started" | "in_progress" | "completed";
  companyInfoCompleted: boolean;
  budgetInfoCompleted: boolean;
}

interface MetaConnectionStatus {
  status: "disconnected" | "connected" | "error";
  metaUserId: string | null;
  adAccountId: string | null;
  scopes: string[] | null;
}

export default function DashboardPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [websiteSource, setWebsiteSource] = useState<{ websiteUrl: string } | null>(null);
  const [itemsCount, setItemsCount] = useState(0);
  const [templateConfig, setTemplateConfig] = useState<{ id: string; status: string } | null>(null);
  const [metaConnection, setMetaConnection] = useState<MetaConnectionStatus | null>(null);
  const [runNowLoading, setRunNowLoading] = useState(false);
  const [runNowError, setRunNowError] = useState<string | null>(null);
  const [runNowHint, setRunNowHint] = useState<string | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const allowDevMeta = process.env.NEXT_PUBLIC_ALLOW_DEV_META === "true";

  const load = () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      apiGet<OnboardingStatus>("/onboarding/status", { customerId }),
      apiGet<{ data: unknown[]; source?: { websiteUrl: string } }>("/inventory/items", { customerId }),
      apiGet<{ id: string; status: string } | null>("/templates/config", { customerId }),
      apiGet<MetaConnectionStatus>("/meta/status", { customerId }),
    ])
      .then(([onb, inv, cfg, meta]) => {
        if (onb.ok) setOnboardingStatus(onb.data);
        if (inv.ok) {
          setWebsiteSource(inv.data.source ?? null);
          setItemsCount(Array.isArray(inv.data.data) ? inv.data.data.length : 0);
        }
        if (cfg.ok) setTemplateConfig(cfg.data ?? null);
        if (meta.ok) setMetaConnection(meta.data);
        if (!onb.ok && !inv.ok && !cfg.ok && !meta.ok) setError("Failed to load dashboard data");
      })
      .catch(() => setError("Failed to load dashboard"))
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
    if (res.ok) router.push("/runs");
    else {
      setRunNowError(res.error);
      setRunNowHint(res.errorDetail?.hint ?? null);
    }
  };

  if (auth.status !== "authenticated" || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <>
        <ErrorBanner message={error} onRetry={load} />
        <p>Go to <Link href="/dashboard">Dashboard</Link> to retry.</p>
      </>
    );
  }

  const websiteConnected = !!websiteSource;
  const hasInventory = itemsCount > 0;
  const metaConnected = metaConnection?.status === "connected";
  const isSetupComplete = websiteConnected && hasInventory; // Automation ready when website + inventory
  const needsOnboarding = onboardingStatus && !onboardingStatus.companyInfoCompleted;

  const handleMetaConnect = async () => {
    if (!customerId) return;
    setMetaLoading(true);
    setMetaError(null);
    const res = await apiPost<MetaConnectionStatus>("/meta/dev-connect", undefined, { customerId });
    setMetaLoading(false);
    if (res.ok) {
      setMetaConnection(res.data);
    } else {
      setMetaError(res.error);
    }
  };

  const handleMetaDisconnect = async () => {
    if (!customerId) return;
    setMetaLoading(true);
    setMetaError(null);
    const res = await apiPost<{ success: boolean }>("/meta/disconnect", undefined, { customerId });
    setMetaLoading(false);
    if (res.ok) {
      setMetaConnection({ status: "disconnected", metaUserId: null, adAccountId: null, scopes: null });
    } else {
      setMetaError(res.error);
    }
  };

  // Only show action-required banner when there's an actual problem with clear next step
  const setupProblem: { type: "no_website" | "no_inventory"; message: string; action: string; href: string } | null =
    !websiteConnected
      ? { type: "no_website", message: "Connect your website to start detecting inventory and running automated campaigns.", action: "Connect website", href: "/connect-website" }
      : websiteConnected && !hasInventory
        ? { type: "no_inventory", message: "Run a crawl to detect listings from your website.", action: "Run crawl", href: "/runs" }
        : null;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
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
          Dashboard
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
          Monitor your automation status and inventory
        </p>
      </div>

      {/* Onboarding redirect */}
      {needsOnboarding && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.5rem",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "var(--pa-radius-lg)",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
            Complete onboarding to get started
          </p>
          <Link
            href="/onboarding/company"
            style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              background: "var(--pa-dark)",
              color: "white",
              borderRadius: "6px",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Add company information →
          </Link>
        </div>
      )}

      {/* Action required – only when there's an actual problem */}
      {setupProblem && !needsOnboarding && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1.5rem",
            background: "#fef9c3",
            border: "1px solid #fde047",
            borderRadius: "var(--pa-radius-lg)",
            display: "flex",
            gap: "1rem",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#fef08a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle style={{ width: 20, height: 20, color: "#ca8a04" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
              <h3 style={{ fontWeight: 600, fontSize: "1rem" }}>
                {setupProblem.type === "no_website" ? "Connect your website" : "No inventory yet"}
              </h3>
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  background: "#ea580c",
                  color: "white",
                  borderRadius: 4,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              >
                Action required
              </span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#374151", marginBottom: "0.75rem" }}>
              {setupProblem.message}
            </p>
            {setupProblem.type === "no_inventory" ? (
              <>
                <button
                  type="button"
                  onClick={handleRunNow}
                  disabled={runNowLoading}
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    background: "var(--pa-dark)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: runNowLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {runNowLoading ? "Starting…" : setupProblem.action}
                </button>
                {(runNowError || runNowHint) && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <ErrorBanner message={runNowError ?? ""} hint={runNowHint ?? undefined} />
                  </div>
                )}
              </>
            ) : (
              <Link
                href={setupProblem.href}
                style={{
                  display: "inline-block",
                  padding: "0.375rem 0.75rem",
                  background: "var(--pa-dark)",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                {setupProblem.action}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* System status */}
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
          <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>System status</h2>
        </div>
        <div
          style={{
            padding: "1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--pa-radius)",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Globe style={{ width: 20, height: 20, color: "#2563eb" }} />
            </div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Website</div>
              {websiteConnected ? (
                <>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.2rem 0.5rem",
                      background: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    Connected
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    {websiteSource?.websiteUrl}
                  </div>
                </>
              ) : (
                <>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      background: "#f3f4f6",
                      color: "var(--pa-gray)",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      marginBottom: "0.25rem",
                      display: "inline-block",
                    }}
                  >
                    Not connected
                  </span>
                  <Link
                    href="/connect-website"
                    style={{ fontSize: "0.875rem", color: "var(--pa-blue)", fontWeight: 500 }}
                  >
                    Connect now
                  </Link>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--pa-radius)",
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "#2563eb" }}><MetaIcon size={20} /></span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Meta Ads</div>
              {metaError && (
                <div style={{ fontSize: "0.75rem", color: "#dc2626", marginBottom: "0.5rem" }}>
                  {metaError}
                </div>
              )}
              {metaConnected ? (
                <>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.2rem 0.5rem",
                      background: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    Connected
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                    {metaConnection?.adAccountId ? `Account: ${metaConnection.adAccountId}` : "Connected"}
                  </div>
                  <button
                    type="button"
                    onClick={handleMetaDisconnect}
                    disabled={metaLoading}
                    style={{
                      padding: "0.25rem 0.5rem",
                      fontSize: "0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 4,
                      background: "white",
                      cursor: metaLoading ? "not-allowed" : "pointer",
                      color: "var(--pa-gray)",
                    }}
                  >
                    {metaLoading ? "Disconnecting..." : "Disconnect"}
                  </button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      background: "#f3f4f6",
                      color: "var(--pa-gray)",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      marginBottom: "0.5rem",
                      display: "inline-block",
                    }}
                  >
                    Not connected
                  </span>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {allowDevMeta && (
                      <button
                        type="button"
                        onClick={handleMetaConnect}
                        disabled={metaLoading}
                        style={{
                          padding: "0.25rem 0.5rem",
                          fontSize: "0.75rem",
                          border: "1px solid var(--pa-border)",
                          borderRadius: 4,
                          background: "white",
                          cursor: metaLoading ? "not-allowed" : "pointer",
                          color: "var(--pa-dark)",
                        }}
                      >
                        {metaLoading ? "Connecting..." : "Dev: Fake connect"}
                      </button>
                    )}
                    {!allowDevMeta && (
                      <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                        Coming soon
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--pa-radius)",
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <RefreshCw style={{ width: 20, height: 20, color: "#059669" }} />
            </div>
            <div>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Automation</div>
              {isSetupComplete ? (
                <>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      background: "#059669",
                      color: "white",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      marginBottom: "0.25rem",
                      display: "inline-block",
                    }}
                  >
                    Active
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    Nightly sync enabled
                  </div>
                </>
              ) : (
                <>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      background: "#f3f4f6",
                      color: "var(--pa-gray)",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                      marginBottom: "0.25rem",
                      display: "inline-block",
                    }}
                  >
                    Inactive
                  </span>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    Complete setup to activate
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Get started – steps reflect actual progress */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--pa-border)",
          borderRadius: "var(--pa-radius-lg)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
          <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>Get started</h2>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {/* Step 1: Connect website – done when connected */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              padding: "1rem",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius)",
              marginBottom: "1rem",
              opacity: websiteConnected ? 0.7 : 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: websiteConnected ? "#d1fae5" : "#dbeafe",
                color: websiteConnected ? "#059669" : "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.875rem",
                flexShrink: 0,
              }}
            >
              {websiteConnected ? <CheckCircle2 size={18} /> : "1"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Connect your website</div>
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: websiteConnected ? 0 : "0.75rem" }}>
                Add your inventory website URL so we can detect your listings
              </p>
              {!websiteConnected && (
                <Link
                  href="/connect-website"
                  prefetch={false}
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    background: "var(--pa-dark)",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Connect Website
                </Link>
              )}
              {websiteConnected && (
                <span style={{ fontSize: "0.875rem", color: "#059669" }}>Done</span>
              )}
            </div>
          </div>

          {/* Step 2: Run inventory sync – active when website connected, done when has inventory */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              padding: "1rem",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius)",
              marginBottom: "1rem",
              opacity: !websiteConnected ? 0.5 : 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: hasInventory ? "#d1fae5" : websiteConnected ? "#dbeafe" : "#f3f4f6",
                color: hasInventory ? "#059669" : websiteConnected ? "#2563eb" : "var(--pa-gray)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.875rem",
                flexShrink: 0,
              }}
            >
              {hasInventory ? <CheckCircle2 size={18} /> : "2"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Run inventory sync</div>
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: hasInventory ? 0 : "0.75rem" }}>
                Run a crawl to scan your site and detect listings (stub crawl adds mock data for testing)
              </p>
              {websiteConnected && !hasInventory && (
                <button
                  type="button"
                  onClick={handleRunNow}
                  disabled={runNowLoading}
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    background: runNowLoading ? "#d1d5db" : "var(--pa-dark)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: runNowLoading ? "not-allowed" : "pointer",
                  }}
                >
                  {runNowLoading ? "Starting…" : "Run crawl"}
                </button>
              )}
              {hasInventory && (
                <span style={{ fontSize: "0.875rem", color: "#059669" }}>Done ({itemsCount} items)</span>
              )}
            </div>
          </div>

          {/* Step 3: Launch automation – active when has inventory */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
              padding: "1rem",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius)",
              opacity: !hasInventory ? 0.5 : 1,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: templateConfig?.status === "approved" ? "#d1fae5" : hasInventory ? "#dbeafe" : "#f3f4f6",
                color: templateConfig?.status === "approved" ? "#059669" : hasInventory ? "#2563eb" : "var(--pa-gray)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: "0.875rem",
                flexShrink: 0,
              }}
            >
              {templateConfig?.status === "approved" ? <CheckCircle2 size={18} /> : "3"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>Launch automation</div>
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.75rem" }}>
                Choose templates, generate previews, and approve to enable campaigns
              </p>
              {hasInventory && (
                <Link
                  href="/templates"
                  prefetch={false}
                  style={{
                    display: "inline-block",
                    padding: "0.375rem 0.75rem",
                    background: "var(--pa-dark)",
                    color: "white",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {templateConfig?.status === "approved" ? "Manage templates" : "Configure templates"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Run now (when website connected) */}
      {websiteConnected && (
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              padding: "1.5rem",
              background: "white",
              border: "2px solid #bfdbfe",
              borderRadius: "var(--pa-radius-lg)",
              display: "flex",
              gap: "1rem",
              alignItems: "flex-start",
            }}
          >
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
              <h3 style={{ fontWeight: 600, marginBottom: "0.25rem" }}>Run automation now</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1rem" }}>
                Manually trigger a sync to update inventory and refresh campaigns immediately
              </p>
              <button
                type="button"
                onClick={handleRunNow}
                disabled={runNowLoading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: runNowLoading ? "#d1d5db" : "var(--pa-dark)",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: runNowLoading ? "not-allowed" : "pointer",
                }}
              >
                <RefreshCw style={{ width: 16, height: 16 }} />
                {runNowLoading ? "Starting…" : "Run Now"}
              </button>
              {(runNowError || runNowHint) && (
                <div style={{ marginTop: "0.75rem" }}>
                  <ErrorBanner message={runNowError ?? ""} hint={runNowHint ?? undefined} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates CTA */}
      {websiteConnected && (
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              padding: "1.5rem",
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
            }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Templates</h3>
            <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1rem" }}>
              {templateConfig
                ? `Status: ${templateConfig.status.replace("_", " ")}`
                : "Configure a template to generate ad previews."}
            </p>
            <Link
              href="/templates"
              style={{
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: "var(--pa-dark)",
                color: "white",
                borderRadius: "6px",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {templateConfig ? "Manage templates" : "Choose template"}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
