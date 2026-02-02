"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, Globe, AlertTriangle, CheckCircle2, Bell, Loader2 } from "lucide-react";

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

export default function SettingsPage() {
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<{ websiteUrl: string; createdAt?: string } | null>(null);
  const [itemsCount, setItemsCount] = useState(0);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteState, setWebsiteState] = useState<"idle" | "loading" | "success">("idle");
  const [accountName, setAccountName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [updateUrlLoading, setUpdateUrlLoading] = useState(false);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  useEffect(() => {
    if (!customerId) return;
    apiGet<{ data: unknown[]; source?: { websiteUrl: string; createdAt?: string } }>(
      "/inventory/items",
      { customerId }
    ).then((res) => {
      if (res.ok) {
        setSource(res.data.source ?? null);
        setItemsCount(Array.isArray(res.data.data) ? res.data.data.length : 0);
        setWebsiteUrl(res.data.source?.websiteUrl ?? "");
      }
      setLoading(false);
    });
  }, [customerId]);

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
    // Placeholder - no account update API yet
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

  return (
    <div style={{ maxWidth: 896 }}>
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
          Settings
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
          Manage your account and connected services
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* Account information */}
        <CardSection
          icon={<User size={20} />}
          iconBg="#f3f4f6"
          iconColor="var(--pa-gray)"
          title="Account information"
          description="Your personal and company details"
        >
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
          </form>
        </CardSection>

        {/* Connected website */}
        <CardSection
          icon={<Globe size={20} />}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          title="Connected website"
          description="Your inventory source"
        >
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
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                    <span style={{ fontWeight: 500 }}>{source?.websiteUrl}</span>
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
                  <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    {source?.createdAt && `Connected on: ${new Date(source.createdAt).toLocaleDateString()}`}
                    {itemsCount > 0 && ` · Items detected: ${itemsCount}`}
                  </div>
                </div>
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
                  }}
                >
                  {websiteState === "loading" ? (
                    <>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                      Testing…
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
              <form onSubmit={handleUpdateUrl} style={{ marginBottom: "1rem" }}>
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
                    type="submit"
                    disabled={updateUrlLoading}
                    style={{
                      padding: "0.5rem 1rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: "white",
                      cursor: updateUrlLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {updateUrlLoading ? "Updating…" : "Update"}
                  </button>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginTop: 4 }}>
                  Changing your URL will trigger a new inventory scan
                </p>
              </form>
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
              <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1rem" }}>
                Connect your inventory website to start automating ads
              </p>
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
          <div
            style={{
              padding: "1rem",
              background: "#fef9c3",
              border: "1px solid #fde047",
              borderRadius: "var(--pa-radius)",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#854d0e" }}>
              <strong>MVP limitation:</strong> Only one website source supported. Multiple sources coming in v2.
            </p>
          </div>
        </CardSection>

        {/* Connected Meta account */}
        <CardSection
          icon={<span style={{ color: "#2563eb" }}><MetaIcon size={20} /></span>}
          iconBg="#dbeafe"
          iconColor="#2563eb"
          title="Connected Meta account"
          description="Your Meta (Facebook/Instagram) advertising platform"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "1rem",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius)",
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
                  Coming soon
                </span>
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                Meta Ads integration will be available in a future release
              </div>
            </div>
          </div>
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#fef9c3",
              border: "1px solid #fde047",
              borderRadius: "var(--pa-radius)",
            }}
          >
            <p style={{ fontSize: "0.875rem", color: "#854d0e" }}>
              <strong>MVP limitation:</strong> Only Meta Ads supported. Google Ads, TikTok, and other platforms coming in v2.
            </p>
          </div>
        </CardSection>

        {/* Notification preferences */}
        <CardSection
          icon={<Bell size={20} />}
          iconBg="#ede9fe"
          iconColor="#7c3aed"
          title="Notification preferences"
          description="Choose what updates you want to receive"
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              {
                id: "run-complete",
                label: "Run completion notifications",
                desc: "Get notified when automation runs complete (success or failure)",
                checked: runComplete,
                set: setRunComplete,
              },
              {
                id: "errors",
                label: "Error alerts",
                desc: "Immediate alerts when runs fail or connections drop",
                checked: errorAlerts,
                set: setErrorAlerts,
              },
              {
                id: "budget",
                label: "Budget alerts",
                desc: "Alerts when you reach 75%, 90%, and 100% of your monthly budget",
                checked: budgetAlerts,
                set: setBudgetAlerts,
              },
              {
                id: "inventory",
                label: "Inventory change summary",
                desc: "Daily digest of new and removed items",
                checked: inventorySummary,
                set: setInventorySummary,
              },
              {
                id: "weekly",
                label: "Weekly summary report",
                desc: "Weekly overview of inventory, runs, and ad performance",
                checked: weeklyReport,
                set: setWeeklyReport,
              },
              {
                id: "product",
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
                <div>
                  <label htmlFor={id} style={{ fontWeight: 500, cursor: "pointer" }}>
                    {label}
                  </label>
                  <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginTop: 4 }}>{desc}</p>
                </div>
                <Toggle checked={checked} onChange={setChecked} />
              </div>
            ))}
          </div>
        </CardSection>

        {/* Danger zone */}
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
                <h2 style={{ fontWeight: 600, fontSize: "1rem", color: "#991b1b" }}>Danger zone</h2>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>
                  Irreversible actions for your account
                </p>
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
              <div>
                <h4 style={{ fontWeight: 500, color: "#991b1b", marginBottom: 4 }}>Disconnect website</h4>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>
                  Remove your website connection. Automation will stop but ad campaigns will remain active.
                </p>
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
                }}
              >
                Disconnect
              </button>
            </div>
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
              <div>
                <h4 style={{ fontWeight: 500, color: "#991b1b", marginBottom: 4 }}>Pause automation</h4>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>
                  Temporarily stop all automation runs. Your connections and data will remain.
                </p>
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
                }}
              >
                Pause
              </button>
            </div>
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
              <div>
                <h4 style={{ fontWeight: 500, color: "#991b1b", marginBottom: 4 }}>Delete account</h4>
                <p style={{ fontSize: "0.875rem", color: "#b91c1c" }}>
                  Permanently delete your account, all data, disconnect integrations, and stop billing.
                </p>
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
