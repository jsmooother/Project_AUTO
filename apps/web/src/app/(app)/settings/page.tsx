"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { TestModeBanner } from "@/components/TestModeBanner";
import { PageHeader, Banner } from "@/components/ui";
import { useI18n } from "@/lib/i18n/context";
import { User, Globe, AlertTriangle, CheckCircle2, Bell, Loader2 } from "lucide-react";
import { CopyToClipboard } from "@/components/CopyToClipboard";

function MetaIcon({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z" />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: checked ? "var(--pa-blue)" : "#d1d5db",
        border: "none",
        cursor: "pointer",
        position: "relative",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

function CardSection({
  icon,
  iconBg,
  iconColor,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--pa-border)",
        borderRadius: "var(--pa-radius-lg)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--pa-radius)",
              background: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ color: iconColor }}>{icon}</span>
          </div>
          <div>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 2 }}>{title}</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>{description}</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  );
}

interface MetaConnectionStatus {
  status: "disconnected" | "connected" | "error";
  metaUserId: string | null;
  adAccountId: string | null;
  scopes: string[] | null;
  tokenExpiresAt?: string | null;
  selectedAdAccountId?: string | null;
  partnerAccessStatus?: "pending" | "verified" | "failed";
  partnerAccessCheckedAt?: string | null;
  partnerAccessError?: string | null;
  systemUserConfigured?: boolean;
  metaPartnerName?: string | null;
  metaBusinessManagerId?: string | null;
  metaBusinessManagerIdFull?: string | null;
}

interface MetaAdAccount {
  id: string;
  name?: string;
  account_status?: number;
  currency?: string;
}

function SettingsPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<{ websiteUrl: string; createdAt?: string | null; lastCrawledAt?: string | null } | null>(null);
  const [itemsCount, setItemsCount] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteState, setWebsiteState] = useState<"idle" | "loading" | "success">("idle");
  const [accountName, setAccountName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateUrlLoading, setUpdateUrlLoading] = useState(false);
  const [metaConnection, setMetaConnection] = useState<MetaConnectionStatus | null>(null);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [smokeTestLoading, setSmokeTestLoading] = useState(false);
  const [smokeTestResult, setSmokeTestResult] = useState<{
    ok: boolean;
    me?: { id: string; name: string | null };
    adAccounts?: Array<{ id: string; name?: string; account_status?: number; currency?: string }>;
    hint?: string;
  } | null>(null);
  const [smokeTestError, setSmokeTestError] = useState<{ message: string; hint?: string } | null>(null);
  const [adAccounts, setAdAccounts] = useState<MetaAdAccount[]>([]);
  const [adAccountsLoading, setAdAccountsLoading] = useState(false);
  const [selectedAdAccountId, setSelectedAdAccountId] = useState<string>("");
  const [selectAdAccountLoading, setSelectAdAccountLoading] = useState(false);
  const [adAccountError, setAdAccountError] = useState<string | null>(null);
  const [adsStatus, setAdsStatus] = useState<{ derived?: { metaAccountMode?: "internal_test" | "customer_selected" } } | null>(null);
  const [permissionsCheckLoading, setPermissionsCheckLoading] = useState(false);
  const [permissionsCheckResult, setPermissionsCheckResult] = useState<{
    ok: boolean;
    status: string;
    hint?: string;
    checkedAt?: string;
  } | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const allowDevMeta = process.env.NEXT_PUBLIC_ALLOW_DEV_META === "true";
  const metaEnabled = process.env.NEXT_PUBLIC_META_ENABLED === "true";

  useEffect(() => {
    if (!customerId) return;
    Promise.all([
      apiGet<{ data: unknown[]; source?: { websiteUrl: string; createdAt?: string | null; lastCrawledAt?: string | null } }>(
        "/inventory/items",
        { customerId }
      ),
      apiGet<MetaConnectionStatus>("/meta/status", { customerId }),
      apiGet<{ derived?: { metaAccountMode?: "internal_test" | "customer_selected" } }>("/ads/status", { customerId }),
    ]).then(([inv, meta, ads]) => {
      if (inv.ok) {
        setSource(inv.data.source ?? null);
        setItemsCount(Array.isArray(inv.data.data) ? inv.data.data.length : 0);
        setWebsiteUrl(inv.data.source?.websiteUrl ?? "");
      }
      if (meta.ok) {
        setMetaConnection(meta.data);
        setSelectedAdAccountId(meta.data.selectedAdAccountId ?? "");
      }
      if (ads.ok) {
        setAdsStatus(ads.data);
      }
      setLoading(false);
    });
  }, [customerId]);

  const handleFetchAdAccounts = useCallback(async () => {
    if (!customerId) return;
    setAdAccountsLoading(true);
    setAdAccountError(null);
    const res = await apiGet<{ data: MetaAdAccount[] }>("/meta/ad-accounts", { customerId });
    setAdAccountsLoading(false);
    if (res.ok) {
      setAdAccounts(res.data.data ?? []);
    } else {
      setAdAccountError(res.errorDetail?.error ?? res.error ?? "Failed to fetch ad accounts");
    }
  }, [customerId]);

  // Fetch ad accounts when Meta is connected
  useEffect(() => {
    if (metaConnection?.status === "connected" && customerId) {
      handleFetchAdAccounts();
    }
  }, [metaConnection?.status, customerId, handleFetchAdAccounts]);

  const handleSelectAdAccount = async () => {
    if (!customerId || !selectedAdAccountId) return;
    setSelectAdAccountLoading(true);
    setAdAccountError(null);
    setPermissionsCheckResult(null);
    const res = await apiPost<MetaConnectionStatus>("/meta/ad-accounts/select", { adAccountId: selectedAdAccountId }, { customerId });
    setSelectAdAccountLoading(false);
    if (res.ok) {
      setMetaConnection(res.data);
      setSelectedAdAccountId(res.data.selectedAdAccountId ?? "");
    } else {
      setAdAccountError(res.errorDetail?.error ?? res.error ?? "Failed to select ad account");
    }
  };

  const handlePermissionsCheck = async () => {
    if (!customerId) return;
    setPermissionsCheckLoading(true);
    setPermissionsCheckResult(null);
    const res = await apiGet<{ ok: boolean; status: string; hint?: string; checkedAt?: string }>("/meta/permissions/check", { customerId });
    setPermissionsCheckLoading(false);
    if (res.ok && res.data) {
      setPermissionsCheckResult(res.data);
      if (res.data.ok) {
        apiGet<MetaConnectionStatus>("/meta/status", { customerId }).then((r) => {
          if (r.ok) setMetaConnection(r.data);
        });
      }
    } else {
      const hint = !res.ok ? res.error : "Request failed";
      setPermissionsCheckResult({ ok: false, status: "error", hint });
    }
  };

  // Handle OAuth callback query params
  useEffect(() => {
    const metaParam = searchParams.get("meta");
    if (metaParam === "connected") {
      if (customerId) {
        apiGet<MetaConnectionStatus>("/meta/status", { customerId }).then((res) => {
          if (res.ok) setMetaConnection(res.data);
        });
      }
      router.replace("/settings");
    } else if (metaParam === "error") {
      const errorMsg = searchParams.get("error") || "Meta connection failed";
      setMetaError(errorMsg);
      router.replace("/settings");
    }
  }, [searchParams, customerId, router]);

  const handleTestConnection = () => {
    setWebsiteState("loading");
    setTimeout(() => {
      setWebsiteState("success");
      setTimeout(() => setWebsiteState("idle"), 3000);
    }, 1500);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setTimeout(() => setSaveLoading(false), 500);
  };

  const handleUpdateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return;
    setUpdateUrlLoading(true);
    const res = await apiPost("/inventory/source", { websiteUrl: websiteUrl.trim() }, { customerId });
    setUpdateUrlLoading(false);
    if (res.ok) setSource({ websiteUrl: websiteUrl.trim() });
  };

  const handleMetaConnect = async () => {
    if (!customerId) return;
    setMetaLoading(true);
    setMetaError(null);

    if (metaEnabled) {
      try {
        const res = await apiGet<{ url: string }>("/meta/oauth/connect-url", { customerId });
        if (res.ok && res.data.url) {
          window.location.href = res.data.url;
          return;
        } else if (!res.ok) {
          setMetaError(res.error ?? "Failed to get OAuth URL");
        }
      } catch {
        setMetaError("Failed to start OAuth flow");
      }
    } else {
      const res = await apiPost<MetaConnectionStatus>("/meta/dev-connect", undefined, { customerId });
      if (res.ok) {
        setMetaConnection(res.data);
      } else {
        setMetaError(res.error);
      }
    }
    setMetaLoading(false);
  };

  const handleMetaDisconnect = async () => {
    if (!customerId) return;
    setMetaLoading(true);
    setMetaError(null);
    const res = await apiPost<{ success: boolean }>("/meta/disconnect", undefined, { customerId });
    setMetaLoading(false);
    if (res.ok) {
      setMetaConnection({ status: "disconnected", metaUserId: null, adAccountId: null, scopes: null });
      setSmokeTestResult(null);
      setSmokeTestError(null);
    } else {
      setMetaError(res.error);
    }
  };

  const handleSmokeTest = async () => {
    if (!customerId) return;
    setSmokeTestLoading(true);
    setSmokeTestError(null);
    setSmokeTestResult(null);

    const res = await apiGet<{
      ok: boolean;
      me?: { id: string; name: string | null };
      adAccounts?: Array<{ id: string; name?: string; account_status?: number; currency?: string }>;
      hint?: string;
    }>("/meta/debug/smoke", { customerId });

    setSmokeTestLoading(false);

    if (res.ok) {
      setSmokeTestResult(res.data);
      setSmokeTestError(null);
    } else {
      setSmokeTestError({
        message: res.errorDetail?.error ?? res.error ?? "Smoke test failed",
        hint: res.errorDetail?.hint,
      });
      setSmokeTestResult(null);
    }
  };

  // Notification toggles (UI only, no backend)
  const [runComplete, setRunComplete] = useState(true);
  const [errorAlerts, setErrorAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [inventorySummary, setInventorySummary] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);

  if (auth.status !== "authenticated" || loading) return <LoadingSpinner />;

  const websiteConnected = !!source;
  const user = auth.user;

  // Format last sync time
  const formatLastSync = (lastCrawledAt?: string | null) => {
    if (!lastCrawledAt) return "Never";
    const date = new Date(lastCrawledAt);
    const hoursAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));
    if (hoursAgo < 1) return "Just now";
    if (hoursAgo < 24) return `${hoursAgo} hour${hoursAgo > 1 ? "s" : ""} ago`;
    return `${Math.floor(hoursAgo / 24)} day${Math.floor(hoursAgo / 24) > 1 ? "s" : ""} ago`;
  };

  return (
    <div style={{ maxWidth: 896, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <PageHeader title="Settings" description="Manage your account and connected services" />

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Account Information */}
        <CardSection icon={<User size={20} />} iconBg="#f3f4f6" iconColor="var(--pa-gray)" title="Account information" description="Your personal and company details">
          <form onSubmit={handleSaveAccount} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label htmlFor="name" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                  Full name
                </label>
                <input
                  id="name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="John Doe"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div>
                <label htmlFor="email" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={user?.email ?? ""}
                  readOnly
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    fontSize: "1rem",
                    background: "#f9fafb",
                  }}
                />
              </div>
            </div>
            <div>
              <label htmlFor="company" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                Company name
              </label>
              <input
                id="company"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Acme Inc."
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: 6,
                  fontSize: "1rem",
                }}
              />
            </div>
            <div style={{ paddingTop: "1rem" }}>
              <button
                type="submit"
                disabled={saveLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--pa-dark)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  fontWeight: 500,
                  cursor: saveLoading ? "not-allowed" : "pointer",
                }}
              >
                {saveLoading ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </CardSection>

        {/* Connected Website */}
        <CardSection icon={<Globe size={20} />} iconBg="#dbeafe" iconColor="#2563eb" title="Connected website" description="Your inventory source">
          {websiteConnected ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  padding: "1rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: "var(--pa-radius)",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <h4 style={{ fontWeight: 500, fontSize: "0.875rem" }}>{source?.websiteUrl}</h4>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "0.2rem 0.5rem",
                        background: "#d1fae5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                        borderRadius: 4,
                        fontSize: "0.75rem",
                      }}
                    >
                      <CheckCircle2 size={12} />
                      Connected
                    </span>
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {source?.createdAt && <div>Connected on: {new Date(source.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
                    <div>Last sync: {formatLastSync(source?.lastCrawledAt)}</div>
                    {itemsCount > 0 && <div>Items detected: {itemsCount}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={websiteState === "loading"}
                    style={{
                      padding: "0.375rem 0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: "white",
                      cursor: websiteState === "loading" ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {websiteState === "loading" ? (
                      <>
                        <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                        Testing...
                      </>
                    ) : websiteState === "success" ? (
                      <>
                        <CheckCircle2 size={14} color="#059669" />
                        Connected
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label htmlFor="update-url" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                  Update website URL
                </label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    id="update-url"
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      fontSize: "1rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleUpdateUrl}
                    disabled={updateUrlLoading}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: "white",
                      cursor: updateUrlLoading ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    }}
                  >
                    {updateUrlLoading ? "Updating…" : "Update"}
                  </button>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginTop: 4 }}>Changing your URL will trigger a new inventory scan</p>
              </div>
            </>
          ) : (
            <div
              style={{
                padding: "1.5rem",
                border: "2px dashed var(--pa-border)",
                borderRadius: "var(--pa-radius)",
                textAlign: "center",
              }}
            >
              <Globe size={48} style={{ color: "#9ca3af", marginBottom: "0.75rem" }} />
              <h4 style={{ fontWeight: 500, marginBottom: "0.5rem" }}>No website connected</h4>
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1rem" }}>Connect your inventory website to start automating ads</p>
              <Link
                href="/connect-website"
                prefetch={false}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  background: "var(--pa-dark)",
                  color: "white",
                  borderRadius: 6,
                  fontWeight: 500,
                }}
              >
                Connect Website
              </Link>
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Banner variant="warning">
              <strong>MVP limitation:</strong> Only one website source supported. Multiple sources coming in v2.
            </Banner>
          </div>
        </CardSection>

        {/* Connected Meta Account — 3-step flow: Connect (optional), Select ad account, Grant Partner Access */}
        <CardSection icon={<span style={{ color: "#2563eb" }}><MetaIcon size={20} /></span>} iconBg="#dbeafe" iconColor="#2563eb" title="Connected Meta account" description="Your Meta (Facebook/Instagram) advertising platform">
          {adsStatus?.derived?.metaAccountMode === "internal_test" && (
            <div style={{ marginBottom: "1rem" }}>
              <TestModeBanner />
            </div>
          )}
          {metaConnection?.systemUserConfigured === false && (
            <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "var(--pa-radius)", fontSize: "0.875rem" }}>
              {t.settings.meta.metaNotConfiguredBanner}
            </div>
          )}
          {metaError && (
            <div style={{ marginBottom: "1rem" }}>
              <ErrorBanner message={metaError} />
            </div>
          )}
          {metaConnection?.status === "connected" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius)",
                marginBottom: "1rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--pa-gray)", fontWeight: 500 }}>{t.settings.meta.step1Optional}</span>
                  <h4 style={{ fontWeight: 500, fontSize: "0.875rem" }}>{t.settings.meta.connectMeta}</h4>
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
                    }}
                  >
                    <CheckCircle2 style={{ width: 12, height: 12 }} />
                    Active
                  </span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {metaConnection.adAccountId && <div>Account ID: {metaConnection.adAccountId}</div>}
                  {metaConnection.metaUserId && <div>Connected on: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>}
                  <div>Permissions: Campaign management</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleMetaConnect}
                  disabled={metaLoading}
                  style={{
                    padding: "0.375rem 0.75rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    cursor: metaLoading ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Reconnect
                </button>
                <button
                  type="button"
                  onClick={handleMetaDisconnect}
                  disabled={metaLoading}
                  style={{
                    padding: "0.375rem 0.75rem",
                    fontSize: "0.875rem",
                    border: "none",
                    borderRadius: 6,
                    background: "transparent",
                    cursor: metaLoading ? "not-allowed" : "pointer",
                    color: "#dc2626",
                    fontWeight: 500,
                  }}
                >
                  {metaLoading ? "Disconnecting..." : "Disconnect"}
                </button>
              </div>
            </div>
          )}
          {/* Step 2: Ad Account Selection */}
          {metaConnection?.status === "connected" && (
            <div
              style={{
                padding: "1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius)",
                marginBottom: "1rem",
                background: "#f9fafb",
              }}
            >
              <div style={{ marginBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--pa-gray)", fontWeight: 500 }}>{t.settings.meta.step2SelectAdAccount}</span>
                <h4 style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: 2 }}>{t.settings.meta.selectAdAccount}</h4>
                <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>Select which Meta ad account to use for your campaigns</p>
              </div>
              {adAccountError && (
                <div style={{ marginBottom: "0.75rem" }}>
                  <ErrorBanner message={adAccountError} />
                </div>
              )}
              {metaConnection.selectedAdAccountId && (
                <div
                  style={{
                    padding: "0.75rem",
                    background: "#d1fae5",
                    border: "1px solid #a7f3d0",
                    borderRadius: "var(--pa-radius)",
                    marginBottom: "0.75rem",
                    fontSize: "0.875rem",
                    color: "#065f46",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CheckCircle2 size={16} />
                    <span>
                      <strong>Selected account:</strong> {adAccounts.find((acc) => acc.id === metaConnection.selectedAdAccountId)?.name ?? metaConnection.selectedAdAccountId}
                    </span>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="ad-account-select" style={{ display: "block", fontSize: "0.875rem", marginBottom: 4 }}>
                    Ad Account
                  </label>
                  <select
                    id="ad-account-select"
                    value={selectedAdAccountId}
                    onChange={(e) => setSelectedAdAccountId(e.target.value)}
                    disabled={adAccountsLoading || selectAdAccountLoading}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                      background: "white",
                      cursor: adAccountsLoading || selectAdAccountLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    <option value="">{adAccountsLoading ? "Loading accounts..." : "Select an ad account"}</option>
                    {adAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name ?? acc.id} {acc.account_status === 1 ? "(Active)" : acc.account_status ? `(Status: ${acc.account_status})` : ""} {acc.currency ? `- ${acc.currency}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button
                    type="button"
                    onClick={handleSelectAdAccount}
                    disabled={!selectedAdAccountId || selectAdAccountLoading || adAccountsLoading}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: !selectedAdAccountId || selectAdAccountLoading ? "#d1d5db" : "var(--pa-dark)",
                      color: "white",
                      cursor: !selectedAdAccountId || selectAdAccountLoading ? "not-allowed" : "pointer",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectAdAccountLoading ? "Saving..." : "Save Selection"}
                  </button>
                </div>
              </div>
              {adAccounts.length === 0 && !adAccountsLoading && (
                <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginTop: "0.5rem" }}>No ad accounts found. Make sure your Meta account has ad accounts set up.</p>
              )}
            </div>
          )}

          {/* Step 3: Grant Partner Access + Verify */}
          {metaConnection?.status === "connected" && metaConnection?.selectedAdAccountId && (
            <div
              style={{
                padding: "1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius)",
                marginBottom: "1rem",
                background: "#f9fafb",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--pa-gray)", fontWeight: 500 }}>{t.settings.meta.step3GrantPartnerAccess}</span>
              <h4 style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: 8 }}>{t.settings.meta.grantPartnerAccessTitle}</h4>

              {!metaConnection?.metaBusinessManagerId && (
                <div style={{ padding: "0.75rem", background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: "var(--pa-radius)", fontSize: "0.875rem", color: "#92400e", marginBottom: "1rem" }}>
                  {t.settings.meta.metaNotConfiguredForProductionBanner}
                </div>
              )}

              <p style={{ fontSize: "0.875rem", fontWeight: 500, marginBottom: 6 }}>{t.settings.meta.step3WhatToDo}</p>
              <ol style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1rem", paddingLeft: "1.25rem" }}>
                <li style={{ marginBottom: 4 }}>{t.settings.meta.step3AddPartner}</li>
                <li style={{ marginBottom: 4 }}>{t.settings.meta.step3GrantAccess}</li>
                <li>{t.settings.meta.step3PermissionWording}</li>
              </ol>

              <div style={{ marginBottom: "0.5rem" }}>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>{t.settings.meta.partnerNameLabel}</label>
                <code style={{ display: "block", padding: "0.5rem 0.75rem", background: "#f3f4f6", border: "1px solid var(--pa-border)", borderRadius: 6, fontSize: "0.875rem", fontFamily: "ui-monospace, monospace" }}>
                  {metaConnection?.metaPartnerName ?? "Project Auto"}
                </code>
              </div>

              {metaConnection?.metaBusinessManagerId && (
                <CopyToClipboard
                  value={metaConnection?.metaBusinessManagerIdFull ?? metaConnection?.metaBusinessManagerId ?? ""}
                  label={t.settings.meta.partnerBusinessIdLabel}
                  maskedValue={metaConnection?.metaBusinessManagerId}
                  showFullDefault={!!metaConnection?.metaBusinessManagerIdFull}
                  copyLabel={t.common.copy}
                  copiedLabel={t.common.copied}
                  showFullLabel={t.settings.meta.showFull}
                />
              )}

              <div style={{ marginBottom: "0.75rem" }}>
                <a
                  href="https://business.facebook.com/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.875rem", color: "var(--pa-blue)", textDecoration: "underline" }}
                >
                  {t.settings.meta.openMetaBusinessSettings}
                </a>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handlePermissionsCheck}
                  disabled={
                    permissionsCheckLoading ||
                    metaConnection?.systemUserConfigured === false ||
                    !metaConnection?.metaBusinessManagerId
                  }
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background:
                      permissionsCheckLoading ||
                      metaConnection?.systemUserConfigured === false ||
                      !metaConnection?.metaBusinessManagerId
                        ? "#d1d5db"
                        : "var(--pa-dark)",
                    color: "white",
                    cursor:
                      permissionsCheckLoading ||
                      metaConnection?.systemUserConfigured === false ||
                      !metaConnection?.metaBusinessManagerId
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {permissionsCheckLoading ? t.settings.meta.checking : t.settings.meta.verifyAccess}
                </button>
                <span
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: 4,
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    background:
                      (metaConnection?.partnerAccessStatus ?? "pending") === "verified"
                        ? "#d1fae5"
                        : (metaConnection?.partnerAccessStatus ?? "pending") === "failed"
                          ? "#fef2f2"
                          : "#f3f4f6",
                    color:
                      (metaConnection?.partnerAccessStatus ?? "pending") === "verified"
                        ? "#065f46"
                        : (metaConnection?.partnerAccessStatus ?? "pending") === "failed"
                          ? "#991b1b"
                          : "var(--pa-gray)",
                  }}
                >
                  {(metaConnection?.partnerAccessStatus ?? "pending") === "verified"
                    ? t.settings.meta.statusVerified
                    : (metaConnection?.partnerAccessStatus ?? "pending") === "failed"
                      ? t.settings.meta.statusFailed
                      : t.settings.meta.statusPending}
                </span>
              </div>
              {metaConnection?.partnerAccessStatus === "verified" && (
                <div style={{ padding: "0.75rem", background: "#d1fae5", border: "1px solid #a7f3d0", borderRadius: "var(--pa-radius)", fontSize: "0.875rem", color: "#065f46", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <CheckCircle2 size={18} />
                  <span>{t.settings.meta.partnerAccessVerified}</span>
                </div>
              )}
              {(permissionsCheckResult?.ok === false || metaConnection?.partnerAccessStatus === "failed") && (
                <div style={{ padding: "0.75rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--pa-radius)", fontSize: "0.875rem", color: "#991b1b" }}>
                  <strong>{t.settings.meta.accessNotGrantedYet}</strong> {permissionsCheckResult?.hint ?? metaConnection?.partnerAccessError ?? ""}
                </div>
              )}
            </div>
          )}

          {metaConnection?.status !== "connected" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius)",
                marginBottom: "1rem",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                  <span style={{ fontWeight: 500 }}>Not connected</span>
                  <span
                    style={{
                      padding: "0.2rem 0.5rem",
                      background: "#f3f4f6",
                      color: "var(--pa-gray)",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 4,
                      fontSize: "0.75rem",
                    }}
                  >
                    {metaEnabled ? "Connect your Meta account" : allowDevMeta ? "Dev mode available" : "Coming soon"}
                  </span>
                </div>
                <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                  {metaEnabled ? "Connect your Meta account to enable ad creation" : allowDevMeta ? "Use dev connect to test the integration flow" : "Meta Ads integration will be available in a future release"}
                </div>
              </div>
              {allowDevMeta && (
                <button
                  type="button"
                  onClick={handleMetaConnect}
                  disabled={metaLoading}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: metaLoading ? "#d1d5db" : "#fef3c7",
                    cursor: metaLoading ? "not-allowed" : "pointer",
                    color: "#92400e",
                    fontWeight: 500,
                    marginRight: metaEnabled ? "0.5rem" : 0,
                  }}
                >
                  {metaLoading ? "Connecting..." : "🔧 Dev: Fake Connect"}
                </button>
              )}
              {metaEnabled && (
                <button
                  type="button"
                  onClick={handleMetaConnect}
                  disabled={metaLoading}
                  style={{
                    padding: "0.5rem 1rem",
                    fontSize: "0.875rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: metaLoading ? "#d1d5db" : "var(--pa-blue)",
                    cursor: metaLoading ? "not-allowed" : "pointer",
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  {metaLoading ? "Connecting..." : "Connect Meta"}
                </button>
              )}
            </div>
          )}
          {/* Meta Smoke Test */}
          {metaConnection?.status === "connected" && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius)",
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div>
                  <h4 style={{ fontWeight: 500, fontSize: "0.875rem", marginBottom: 2 }}>Meta API Connection Test</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>Verify your Meta access token works with the Graph API</p>
                </div>
                <button
                  type="button"
                  onClick={handleSmokeTest}
                  disabled={smokeTestLoading}
                  style={{
                    padding: "0.375rem 0.75rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    cursor: smokeTestLoading ? "not-allowed" : "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {smokeTestLoading ? (
                    <>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                      Testing...
                    </>
                  ) : (
                    "Run Meta smoke test"
                  )}
                </button>
              </div>
              {smokeTestError && (
                <div style={{ marginTop: "0.75rem" }}>
                  <ErrorBanner message={smokeTestError.message} hint={smokeTestError.hint} />
                </div>
              )}
              {smokeTestResult && smokeTestResult.ok && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.75rem",
                    background: "white",
                    border: "1px solid #d1fae5",
                    borderRadius: "var(--pa-radius)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <CheckCircle2 size={16} color="#059669" />
                    <span style={{ fontWeight: 500, fontSize: "0.875rem", color: "#065f46" }}>Connection successful</span>
                  </div>
                  {smokeTestResult.me && (
                    <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                      <div>
                        <strong>Me:</strong> {smokeTestResult.me.name ?? "N/A"} ({smokeTestResult.me.id})
                      </div>
                    </div>
                  )}
                  {smokeTestResult.adAccounts && smokeTestResult.adAccounts.length > 0 && (
                    <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                      <div style={{ marginBottom: "0.25rem" }}>
                        <strong>Ad Accounts:</strong> {smokeTestResult.adAccounts.length} found
                      </div>
                      <div style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
                        {smokeTestResult.adAccounts.slice(0, 5).map((acc) => (
                          <div key={acc.id} style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: "0.125rem" }}>
                            • {acc.name ?? "Unnamed"} ({acc.id})
                            {acc.account_status !== undefined && (
                              <span style={{ marginLeft: "0.5rem", color: acc.account_status === 1 ? "#059669" : "#dc2626" }}>
                                {acc.account_status === 1 ? "Active" : `Status: ${acc.account_status}`}
                              </span>
                            )}
                            {acc.currency && <span style={{ marginLeft: "0.5rem" }}>{acc.currency}</span>}
                          </div>
                        ))}
                        {smokeTestResult.adAccounts.length > 5 && (
                          <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", fontStyle: "italic", marginTop: "0.25rem" }}>
                            ... and {smokeTestResult.adAccounts.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {smokeTestResult.hint && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#854d0e", fontStyle: "italic" }}>{smokeTestResult.hint}</div>
                  )}
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: "1rem" }}>
            <Banner variant="warning">
              <strong>MVP limitation:</strong> Only Meta Ads supported. Google Ads, TikTok, and other platforms coming in v2.
            </Banner>
          </div>
        </CardSection>

        {/* Notification Preferences */}
        <CardSection icon={<Bell size={20} />} iconBg="#ede9fe" iconColor="#7c3aed" title="Notification preferences" description="Choose what updates you want to receive">
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              {
                id: "notif-run-complete",
                label: "Run completion notifications",
                desc: "Get notified when automation runs complete (success or failure)",
                checked: runComplete,
                set: setRunComplete,
              },
              {
                id: "notif-errors",
                label: "Error alerts",
                desc: "Immediate alerts when runs fail or connections drop",
                checked: errorAlerts,
                set: setErrorAlerts,
              },
              {
                id: "notif-budget",
                label: "Budget alerts",
                desc: "Alerts when you reach 75%, 90%, and 100% of your monthly budget",
                checked: budgetAlerts,
                set: setBudgetAlerts,
              },
              {
                id: "notif-inventory",
                label: "Inventory change summary",
                desc: "Daily digest of new and removed items",
                checked: inventorySummary,
                set: setInventorySummary,
              },
              {
                id: "notif-weekly",
                label: "Weekly summary report",
                desc: "Weekly overview of inventory, runs, and ad performance",
                checked: weeklyReport,
                set: setWeeklyReport,
              },
              {
                id: "notif-product",
                label: "Product updates & tips",
                desc: "Occasional emails about new features and best practices",
                checked: productUpdates,
                set: setProductUpdates,
              },
            ].map(({ id, label, desc, checked, set: setChecked }) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: "var(--pa-radius)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <label htmlFor={id} style={{ fontWeight: 500, cursor: "pointer", display: "block", marginBottom: 4 }}>
                    {label}
                  </label>
                  <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginTop: 4 }}>{desc}</p>
                </div>
                <Toggle checked={checked} onChange={setChecked} />
              </div>
            ))}
          </div>
        </CardSection>

        {/* Danger Zone */}
        <div
          style={{
            background: "white",
            border: "1px solid #fecaca",
            borderRadius: "var(--pa-radius-lg)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #fecaca" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--pa-radius)",
                  background: "#fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AlertTriangle size={20} color="#dc2626" />
              </div>
              <div>
                <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#991b1b", marginBottom: 2 }}>Danger zone</h2>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>Irreversible actions for your account</p>
              </div>
            </div>
          </div>
          <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                padding: "1rem",
                border: "1px solid #fecaca",
                borderRadius: "var(--pa-radius)",
                background: "#fef2f2",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 500, color: "#991b1b", marginBottom: 4 }}>Disconnect website</h4>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>Remove your website connection. Automation will stop but ad campaigns will remain active.</p>
              </div>
              <button
                type="button"
                style={{
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  background: "white",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Disconnect
              </button>
            </div>

            <div style={{ height: 1, background: "#fecaca" }} />

            <div
              style={{
                padding: "1rem",
                border: "1px solid #fecaca",
                borderRadius: "var(--pa-radius)",
                background: "#fef2f2",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 500, color: "#991b1b", marginBottom: 4 }}>Pause automation</h4>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>Temporarily stop all automation runs. Your connections and data will remain.</p>
              </div>
              <button
                type="button"
                style={{
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  background: "white",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Pause
              </button>
            </div>

            <div style={{ height: 1, background: "#fecaca" }} />

            <div
              style={{
                padding: "1rem",
                border: "1px solid #fecaca",
                borderRadius: "var(--pa-radius)",
                background: "#fef2f2",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 500, color: "#991b1b", marginBottom: 4 }}>Delete account</h4>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>Permanently delete your account, all data, disconnect integrations, and stop billing.</p>
              </div>
              <button
                type="button"
                style={{
                  padding: "0.375rem 0.75rem",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  background: "white",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SettingsPage />
    </Suspense>
  );
}
