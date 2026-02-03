"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Palette,
  Package,
  Rocket,
  Target,
  DollarSign,
  Square,
  Smartphone,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  Copy,
} from "lucide-react";

// Meta icon component
function MetaIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor" style={{ width: "1.25rem", height: "1.25rem", ...style }}>
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z" />
    </svg>
  );
}

interface AdsStatus {
  prerequisites: {
    website: { ok: boolean; hint: string | null; link: string };
    inventory: { ok: boolean; count: number; hint: string | null };
    templates: { ok: boolean; hint: string | null; link: string };
    meta: { ok: boolean; hint: string | null; link: string };
  };
  settings: {
    id: string;
    geoMode: string;
    geoCenterText: string | null;
    geoRadiusKm: number | null;
    geoRegionsJson: string[] | null;
    formatsJson: string[];
    ctaType: string;
    budgetOverride: number | null;
    status: string;
    lastSyncedAt: string | null;
    lastPublishedAt: string | null;
    lastError: string | null;
  } | null;
  objects: {
    id: string;
    catalogId: string | null;
    campaignId: string | null;
    adsetId: string | null;
    adId: string | null;
    status: string;
    lastSyncedAt: string | null;
  } | null;
  lastRuns: Array<{
    id: string;
    trigger: string;
    status: string;
    startedAt: string | null;
    finishedAt: string | null;
    errorMessage: string | null;
    createdAt: string;
  }>;
  derivedBudget: {
    defaultMonthly: number | null;
    currency: string;
    effective: number | null;
  };
}

const AVAILABLE_REGIONS = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg"];

function AdsContent() {
  const { auth } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<AdsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // UI state
  const [prerequisitesExpanded, setPrerequisitesExpanded] = useState(true);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  // Form state
  const [geoMode, setGeoMode] = useState<"radius" | "regions">("radius");
  const [radiusKm, setRadiusKm] = useState("30");
  const [centerCity, setCenterCity] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [formatFeed, setFormatFeed] = useState(true);
  const [formatReels, setFormatReels] = useState(false);
  const [ctaType, setCtaType] = useState("learn_more");
  const [budgetOverride, setBudgetOverride] = useState("");

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const loadStatus = () => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    apiGet<AdsStatus>("/ads/status", { customerId })
      .then((res) => {
        if (res.ok) {
          setStatus(res.data);
          // Initialize form state from settings
          if (res.data.settings) {
            setGeoMode(res.data.settings.geoMode as "radius" | "regions");
            setRadiusKm(String(res.data.settings.geoRadiusKm || 30));
            setCenterCity(res.data.settings.geoCenterText || "");
            setSelectedRegions(res.data.settings.geoRegionsJson || []);
            setFormatFeed(res.data.settings.formatsJson.includes("feed"));
            setFormatReels(res.data.settings.formatsJson.includes("reels"));
            setCtaType(res.data.settings.ctaType);
            setBudgetOverride(res.data.settings.budgetOverride ? String(res.data.settings.budgetOverride) : "");
          }
          // Auto-expand prerequisites if not ready
          const allReady =
            res.data.prerequisites.website.ok &&
            res.data.prerequisites.inventory.ok &&
            res.data.prerequisites.templates.ok &&
            res.data.prerequisites.meta.ok;
          setPrerequisitesExpanded(!allReady);
        } else {
          setError(res.error);
        }
      })
      .catch(() => setError("Failed to load ads status"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) loadStatus();
  }, [customerId]);

  const handleSync = async () => {
    if (!customerId) return;
    setSyncLoading(true);
    const res = await apiPost<{ runId: string; jobId: string | null }>("/ads/sync", {}, { customerId });
    if (res.ok) {
      setTimeout(() => loadStatus(), 1000);
    } else {
      setError(res.error);
    }
    setSyncLoading(false);
  };

  const handlePublish = async () => {
    if (!customerId) return;
    setPublishLoading(true);
    const res = await apiPost<{ runId: string; jobId: string | null }>("/ads/publish", {}, { customerId });
    if (res.ok) {
      setTimeout(() => loadStatus(), 1000);
    } else {
      setError(res.error);
    }
    setPublishLoading(false);
  };

  const handleSaveConfig = async () => {
    if (!customerId || !status) return;
    setSavingConfig(true);
    setError(null);

    const formatsJson: string[] = [];
    if (formatFeed) formatsJson.push("feed");
    if (formatReels) formatsJson.push("reels");

    const payload: {
      geoMode: "radius" | "regions";
      geoCenterText?: string;
      geoRadiusKm?: number;
      geoRegionsJson?: string[];
      formatsJson: string[];
      ctaType: string;
      budgetOverride?: number;
    } = {
      geoMode,
      formatsJson,
      ctaType,
    };

    if (geoMode === "radius") {
      if (centerCity) payload.geoCenterText = centerCity;
      if (radiusKm) payload.geoRadiusKm = parseInt(radiusKm, 10);
    } else {
      if (selectedRegions.length > 0) payload.geoRegionsJson = selectedRegions;
    }

    if (budgetOverride) {
      const budgetNum = parseFloat(budgetOverride);
      if (!isNaN(budgetNum)) payload.budgetOverride = budgetNum;
    }

    const res = await apiPost("/ads/settings", payload, { customerId });
    if (res.ok) {
      setConfigExpanded(false);
      loadStatus();
    } else {
      setError(res.error);
    }
    setSavingConfig(false);
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]));
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !status) {
    return (
      <div style={{ padding: "1.5rem" }}>
        <ErrorBanner message={error ?? "Failed to load ads status"} />
      </div>
    );
  }

  const { prerequisites, settings, objects, lastRuns, derivedBudget } = status;
  const isReady = prerequisites.website.ok && prerequisites.inventory.ok && prerequisites.templates.ok && prerequisites.meta.ok;
  const adsLaunched = objects?.status === "active" || settings?.status === "active";
  const configDone = settings && (settings.geoMode === "radius" ? settings.geoCenterText : settings.geoRegionsJson?.length) && settings.formatsJson.length > 0;

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
              Ads
            </h1>
            <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>Automated Meta advertising for your vehicle inventory</p>
          </div>
          {adsLaunched && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--pa-green)",
                  color: "white",
                  borderRadius: 6,
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={16} />
                Campaign Active
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {[
            { label: "Prerequisites", done: isReady },
            { label: "Configuration", done: configDone },
            { label: "Live", done: adsLaunched },
          ].map((step, idx) => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: step.done ? "var(--pa-green)" : "#e5e7eb",
                    color: step.done ? "white" : "var(--pa-gray)",
                  }}
                >
                  {step.done ? <CheckCircle2 size={16} /> : idx + 1}
                </div>
                <span style={{ fontSize: "0.875rem", fontWeight: 500, color: step.done ? "var(--pa-green)" : "var(--pa-gray)" }}>
                  {step.label}
                </span>
              </div>
              {idx < 2 && (
                <div
                  style={{
                    height: 2,
                    width: 48,
                    background: step.done ? "var(--pa-green)" : "#e5e7eb",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: "1.5rem" }}>
          <ErrorBanner message={error} />
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* 1. Prerequisites Section */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--pa-radius-lg)",
            border: isReady ? "1px solid var(--pa-border)" : "1px solid #fbbf24",
            padding: "1.5rem",
          }}
        >
          <button
            onClick={() => setPrerequisitesExpanded(!prerequisitesExpanded)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--pa-radius)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isReady ? "#d1fae5" : "#fef3c7",
                }}
              >
                {isReady ? <CheckCircle2 size={20} style={{ color: "var(--pa-green)" }} /> : <AlertTriangle size={20} style={{ color: "#d97706" }} />}
              </div>
              <div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--pa-dark)" }}>1. Prerequisites</div>
                <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>{isReady ? "All systems ready" : "Complete setup to continue"}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {isReady ? (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.25rem 0.75rem",
                    background: "var(--pa-green)",
                    color: "white",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Complete
                </div>
              ) : (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.25rem 0.75rem",
                    background: "#d97706",
                    color: "white",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  Action Required
                </div>
              )}
              {prerequisitesExpanded ? <ChevronUp size={20} style={{ color: "var(--pa-gray)" }} /> : <ChevronDown size={20} style={{ color: "var(--pa-gray)" }} />}
            </div>
          </button>

          {prerequisitesExpanded && (
            <div style={{ marginTop: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                {/* Website */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--pa-radius)",
                    border: prerequisites.website.ok ? "2px solid #d1fae5" : "2px solid var(--pa-border)",
                    background: prerequisites.website.ok ? "#f0fdf4" : "white",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Globe size={16} style={{ color: prerequisites.website.ok ? "var(--pa-green)" : "var(--pa-gray)" }} />
                    <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>Website</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                    {prerequisites.website.ok ? `${prerequisites.inventory.count} items` : "Not connected"}
                  </p>
                  {!prerequisites.website.ok && (
                    <Link href={prerequisites.website.link}>
                      <button
                        style={{
                          width: "100%",
                          height: 28,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          border: "1px solid var(--pa-border)",
                          borderRadius: 4,
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Connect
                      </button>
                    </Link>
                  )}
                </div>

                {/* Meta */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--pa-radius)",
                    border: prerequisites.meta.ok ? "2px solid #d1fae5" : "2px solid var(--pa-border)",
                    background: prerequisites.meta.ok ? "#f0fdf4" : "white",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <MetaIcon style={{ color: prerequisites.meta.ok ? "var(--pa-blue)" : "var(--pa-gray)" }} />
                    <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>Meta</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                    {prerequisites.meta.ok ? "Connected" : "Not connected"}
                  </p>
                  {!prerequisites.meta.ok && (
                    <Link href={prerequisites.meta.link}>
                      <button
                        style={{
                          width: "100%",
                          height: 28,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          border: "1px solid var(--pa-border)",
                          borderRadius: 4,
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Connect
                      </button>
                    </Link>
                  )}
                </div>

                {/* Templates */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--pa-radius)",
                    border: prerequisites.templates.ok ? "2px solid #d1fae5" : "2px solid var(--pa-border)",
                    background: prerequisites.templates.ok ? "#f0fdf4" : "white",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Palette size={16} style={{ color: prerequisites.templates.ok ? "var(--pa-purple)" : "var(--pa-gray)" }} />
                    <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>Templates</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                    {prerequisites.templates.ok ? "Approved" : "Needs approval"}
                  </p>
                  {!prerequisites.templates.ok && (
                    <Link href={prerequisites.templates.link}>
                      <button
                        style={{
                          width: "100%",
                          height: 28,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          border: "1px solid var(--pa-border)",
                          borderRadius: 4,
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                    </Link>
                  )}
                </div>

                {/* Inventory */}
                <div
                  style={{
                    padding: "1rem",
                    borderRadius: "var(--pa-radius)",
                    border: prerequisites.inventory.ok ? "2px solid #d1fae5" : "2px solid var(--pa-border)",
                    background: prerequisites.inventory.ok ? "#f0fdf4" : "white",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <Package size={16} style={{ color: prerequisites.inventory.ok ? "#f97316" : "var(--pa-gray)" }} />
                    <span style={{ fontWeight: 500, fontSize: "0.875rem" }}>Inventory</span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                    {prerequisites.inventory.ok ? `${prerequisites.inventory.count} items` : "No items"}
                  </p>
                  {!prerequisites.inventory.ok && (
                    <Link href="/automation">
                      <button
                        style={{
                          width: "100%",
                          height: 28,
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                          border: "1px solid var(--pa-border)",
                          borderRadius: 4,
                          background: "white",
                          cursor: "pointer",
                        }}
                      >
                        Run Crawl
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Template Selection */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--pa-radius-lg)",
            border: "1px solid var(--pa-border)",
            padding: "1.5rem",
            opacity: isReady ? 1 : 0.5,
            pointerEvents: isReady ? "auto" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--pa-radius)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f3e8ff",
              }}
            >
              <Palette size={20} style={{ color: "var(--pa-purple)" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--pa-dark)" }}>2. Ad Template</div>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>Choose how your ads will look</div>
            </div>
            <Link href="/templates">
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: 6,
                  background: "white",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <ExternalLink size={16} />
                Edit in Templates
              </button>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {(["classic", "bold", "minimal", "modern"] as const).map((template) => (
              <div
                key={template}
                style={{
                  padding: "0.75rem",
                  borderRadius: "var(--pa-radius)",
                  border: "2px solid var(--pa-border)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                    borderRadius: "var(--pa-radius)",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--pa-gray)",
                    fontSize: "0.75rem",
                  }}
                >
                  Preview
                </div>
                <div style={{ fontWeight: 500, fontSize: "0.875rem", textTransform: "capitalize" }}>{template}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>
                  {template === "classic" && "Balanced & clear"}
                  {template === "bold" && "High contrast"}
                  {template === "minimal" && "Clean design"}
                  {template === "modern" && "Gradient style"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Configuration */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--pa-radius-lg)",
            border: "1px solid var(--pa-border)",
            padding: "1.5rem",
            opacity: isReady ? 1 : 0.5,
            pointerEvents: isReady ? "auto" : "none",
          }}
        >
          <button
            onClick={() => setConfigExpanded(!configExpanded)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--pa-radius)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#dbeafe",
                }}
              >
                <Target size={20} style={{ color: "var(--pa-blue)" }} />
              </div>
              <div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--pa-dark)" }}>3. Ad Configuration</div>
                <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                  {configExpanded
                    ? "Set targeting, formats, and budget"
                    : settings
                      ? `${settings.geoMode === "radius" ? `${settings.geoCenterText || "Not set"}, ${settings.geoRadiusKm || 0} km` : `${settings.geoRegionsJson?.length || 0} regions`} • ${settings.formatsJson.join(", ")} • ${settings.budgetOverride || derivedBudget.effective || derivedBudget.defaultMonthly || 0} ${derivedBudget.currency}/mo`
                      : "Not configured"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {configDone && <div style={{ display: "inline-flex", alignItems: "center", padding: "0.25rem 0.75rem", background: "var(--pa-green)", color: "white", borderRadius: 6, fontSize: "0.875rem", fontWeight: 500 }}>Configured</div>}
              {configExpanded ? <ChevronUp size={20} style={{ color: "var(--pa-gray)" }} /> : <ChevronDown size={20} style={{ color: "var(--pa-gray)" }} />}
            </div>
          </button>

          {configExpanded && (
            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Geo Targeting */}
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", display: "block" }}>Geographic Targeting</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div
                    onClick={() => setGeoMode("radius")}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "1rem",
                      border: geoMode === "radius" ? "2px solid var(--pa-blue)" : "2px solid var(--pa-border)",
                      borderRadius: "var(--pa-radius)",
                      cursor: "pointer",
                      background: geoMode === "radius" ? "#eff6ff" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      checked={geoMode === "radius"}
                      onChange={() => setGeoMode("radius")}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500, cursor: "pointer", display: "block", marginBottom: "0.5rem" }}>Radius around location</label>
                      {geoMode === "radius" && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                          <input
                            type="text"
                            value={centerCity}
                            onChange={(e) => setCenterCity(e.target.value)}
                            placeholder="Stockholm"
                            style={{
                              padding: "0.5rem 0.75rem",
                              border: "1px solid var(--pa-border)",
                              borderRadius: 6,
                              fontSize: "0.875rem",
                            }}
                          />
                          <select
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(e.target.value)}
                            style={{
                              padding: "0.5rem 0.75rem",
                              border: "1px solid var(--pa-border)",
                              borderRadius: 6,
                              fontSize: "0.875rem",
                            }}
                          >
                            <option value="10">10 km</option>
                            <option value="20">20 km</option>
                            <option value="30">30 km</option>
                            <option value="50">50 km</option>
                            <option value="75">75 km</option>
                            <option value="100">100 km</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setGeoMode("regions")}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.75rem",
                      padding: "1rem",
                      border: geoMode === "regions" ? "2px solid var(--pa-blue)" : "2px solid var(--pa-border)",
                      borderRadius: "var(--pa-radius)",
                      cursor: "pointer",
                      background: geoMode === "regions" ? "#eff6ff" : "white",
                    }}
                  >
                    <input
                      type="radio"
                      checked={geoMode === "regions"}
                      onChange={() => setGeoMode("regions")}
                      style={{ marginTop: "0.25rem" }}
                    />
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500, cursor: "pointer", display: "block", marginBottom: "0.5rem" }}>Select regions/cities</label>
                      {geoMode === "regions" && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                          {AVAILABLE_REGIONS.map((region) => (
                            <div
                              key={region}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRegion(region);
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.75rem",
                                borderRadius: 6,
                                fontSize: "0.875rem",
                                fontWeight: 500,
                                cursor: "pointer",
                                background: selectedRegions.includes(region) ? "var(--pa-blue)" : "white",
                                color: selectedRegions.includes(region) ? "white" : "var(--pa-dark)",
                                border: selectedRegions.includes(region) ? "none" : "1px solid var(--pa-border)",
                              }}
                            >
                              {region}
                              {selectedRegions.includes(region) && <X size={12} />}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Formats & CTA Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                {/* Formats */}
                <div>
                  <label style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", display: "block" }}>Ad Formats</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div
                      onClick={() => setFormatFeed(!formatFeed)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        border: formatFeed ? "2px solid var(--pa-blue)" : "2px solid var(--pa-border)",
                        borderRadius: "var(--pa-radius)",
                        cursor: "pointer",
                        background: formatFeed ? "#eff6ff" : "white",
                      }}
                    >
                      <input type="checkbox" checked={formatFeed} onChange={() => setFormatFeed(!formatFeed)} />
                      <Square size={16} style={{ color: "var(--pa-gray)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Feed (Square)</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>Facebook & Instagram</div>
                      </div>
                    </div>

                    <div
                      onClick={() => setFormatReels(!formatReels)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        border: formatReels ? "2px solid var(--pa-blue)" : "2px solid var(--pa-border)",
                        borderRadius: "var(--pa-radius)",
                        cursor: "pointer",
                        background: formatReels ? "#eff6ff" : "white",
                      }}
                    >
                      <input type="checkbox" checked={formatReels} onChange={() => setFormatReels(!formatReels)} />
                      <Smartphone size={16} style={{ color: "var(--pa-gray)" }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Reels (Vertical)</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>Stories & Reels</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <label htmlFor="cta" style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", display: "block" }}>
                    Call-to-Action
                  </label>
                  <select
                    id="cta"
                    value={ctaType}
                    onChange={(e) => setCtaType(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                    }}
                  >
                    <option value="learn_more">Learn More</option>
                    <option value="call_now">Call Now</option>
                    <option value="send_message">Send Message</option>
                    <option value="get_offer">Get Offer</option>
                    <option value="book_now">Book Now</option>
                  </select>
                  <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginTop: "0.5rem" }}>Button shown on all ads</p>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <DollarSign size={16} />
                  Monthly Budget
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <input
                    type="number"
                    placeholder={derivedBudget.defaultMonthly?.toString() || "15000"}
                    value={budgetOverride}
                    onChange={(e) => setBudgetOverride(e.target.value)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                    }}
                  />
                  <input
                    value={derivedBudget.currency}
                    disabled
                    style={{
                      padding: "0.5rem 0.75rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                      background: "#f3f4f6",
                    }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                    padding: "0.75rem",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 6,
                    fontSize: "0.75rem",
                    color: "#1e40af",
                  }}
                >
                  <Info size={16} style={{ flexShrink: 0, marginTop: "0.125rem" }} />
                  <span>
                    Default from onboarding: {derivedBudget.defaultMonthly?.toLocaleString() || 0} {derivedBudget.currency}. Override to use different budget for ads.
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingTop: "1rem", borderTop: "1px solid var(--pa-border)" }}>
                <button
                  onClick={() => setConfigExpanded(false)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={savingConfig}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: savingConfig ? "#d1d5db" : "var(--pa-blue)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: savingConfig ? "not-allowed" : "pointer",
                  }}
                >
                  {savingConfig ? <LoadingSpinner /> : <CheckCircle2 size={16} />}
                  Save Configuration
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. Campaign Controls */}
        <div
          style={{
            background: "white",
            borderRadius: "var(--pa-radius-lg)",
            border: isReady ? "2px solid var(--pa-blue)" : "1px solid var(--pa-border)",
            padding: "1.5rem",
            opacity: isReady ? 1 : 0.5,
            pointerEvents: isReady ? "auto" : "none",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--pa-radius)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#dbeafe",
                  flexShrink: 0,
                }}
              >
                <Rocket size={24} style={{ color: "var(--pa-blue)" }} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: "1.125rem", marginBottom: "0.25rem" }}>
                  {!adsLaunched && "Ready to launch your automated ads"}
                  {adsLaunched && "Your ads are live on Meta"}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                  {!adsLaunched && "Start running automated ads for all your inventory"}
                  {adsLaunched && "Inventory is automatically synced and advertised"}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              {!adsLaunched ? (
                <button
                  onClick={handlePublish}
                  disabled={publishLoading || !configDone}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    background: publishLoading || !configDone ? "#d1d5db" : "var(--pa-blue)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: publishLoading || !configDone ? "not-allowed" : "pointer",
                  }}
                >
                  {publishLoading ? <LoadingSpinner /> : <Rocket size={16} />}
                  Launch Campaign
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSync}
                    disabled={syncLoading}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: "white",
                      fontSize: "1rem",
                      fontWeight: 500,
                      cursor: syncLoading ? "not-allowed" : "pointer",
                    }}
                  >
                    {syncLoading ? <LoadingSpinner /> : <RefreshCw size={16} />}
                    Sync Now
                  </button>
                  <button
                    disabled
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: "#f3f4f6",
                      fontSize: "1rem",
                      fontWeight: 500,
                      cursor: "not-allowed",
                      opacity: 0.6,
                    }}
                    title="Pause/Resume not available in MVP"
                  >
                    <PauseCircle size={16} />
                    Pause
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 5. Campaign Status & Activity */}
        {adsLaunched && (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
            {/* Meta Objects */}
            <div
              style={{
                background: "white",
                borderRadius: "var(--pa-radius-lg)",
                border: "1px solid var(--pa-border)",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--pa-radius)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#dbeafe",
                    }}
                  >
                    <MetaIcon style={{ color: "var(--pa-blue)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--pa-dark)" }}>Campaign Status</div>
                    <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>Meta ad objects</div>
                  </div>
                </div>
                <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer">
                  <button
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 1rem",
                      border: "1px solid var(--pa-border)",
                      borderRadius: 6,
                      background: "white",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <ExternalLink size={16} />
                    Meta Ads Manager
                  </button>
                </a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", border: "1px solid var(--pa-border)", borderRadius: "var(--pa-radius)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--pa-green)" }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Product Catalog</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>
                        {prerequisites.inventory.count} items • {objects?.catalogId || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.75rem",
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #d1fae5",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    active
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", border: "1px solid var(--pa-border)", borderRadius: "var(--pa-radius)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--pa-green)" }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Campaign</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>{objects?.campaignId || "N/A"}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.75rem",
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #d1fae5",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    active
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", border: "1px solid var(--pa-border)", borderRadius: "var(--pa-radius)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--pa-green)" }} />
                    <div>
                      <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>Dynamic Product Ads</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>
                        {settings?.formatsJson.join(", ") || "N/A"} • {settings?.budgetOverride || derivedBudget.effective || derivedBudget.defaultMonthly || 0} {derivedBudget.currency}/mo
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0.25rem 0.75rem",
                      background: "#f0fdf4",
                      color: "#166534",
                      border: "1px solid #d1fae5",
                      borderRadius: 6,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    active
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div
                style={{
                  background: "white",
                  borderRadius: "var(--pa-radius-lg)",
                  border: "1px solid var(--pa-border)",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Last Sync</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                  <Clock size={16} style={{ color: "var(--pa-gray)" }} />
                  <span>{settings?.lastSyncedAt ? formatTimestamp(settings.lastSyncedAt) : "Never"}</span>
                </div>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "var(--pa-radius-lg)",
                  border: "1px solid var(--pa-border)",
                  padding: "1.5rem",
                }}
              >
                <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "1rem" }}>Budget Usage</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                  {settings?.budgetOverride || derivedBudget.effective || derivedBudget.defaultMonthly || 0} {derivedBudget.currency}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                  of {derivedBudget.defaultMonthly?.toLocaleString() || 0} {derivedBudget.currency}
                </div>
                <div style={{ width: "100%", background: "#e5e7eb", borderRadius: 999, height: 8 }}>
                  <div
                    style={{
                      background: "var(--pa-green)",
                      height: 8,
                      borderRadius: 999,
                      width: "21.6%",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {adsLaunched && lastRuns.length > 0 && (
          <div
            style={{
              background: "white",
              borderRadius: "var(--pa-radius-lg)",
              border: "1px solid var(--pa-border)",
              padding: "1.5rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--pa-dark)" }}>Recent Activity</div>
                <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>Last automation runs</div>
              </div>
              <Link href="/runs?type=ads">
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  View All Runs
                </button>
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {lastRuns.slice(0, 5).map((run) => (
                <div key={run.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem",
                      cursor: run.errorMessage ? "pointer" : "default",
                    }}
                    onClick={() => run.errorMessage && setExpandedRun(expandedRun === run.id ? null : run.id)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                      <div style={{ fontFamily: "monospace", fontSize: "0.875rem" }}>{run.id}</div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "0.25rem 0.5rem",
                          border: "1px solid var(--pa-border)",
                          borderRadius: 4,
                          fontSize: "0.75rem",
                        }}
                      >
                        {run.trigger}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        {run.status === "success" && <CheckCircle2 size={16} style={{ color: "var(--pa-green)" }} />}
                        {run.status === "running" && <RefreshCw size={16} style={{ color: "var(--pa-blue)", animation: "spin 1s linear infinite" }} />}
                        {run.status === "failed" && <XCircle size={16} style={{ color: "#dc2626" }} />}
                        {run.status === "queued" && <Clock size={16} style={{ color: "var(--pa-gray)" }} />}
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "0.25rem 0.5rem",
                            background: run.status === "success" ? "var(--pa-green)" : run.status === "failed" ? "#dc2626" : run.status === "running" ? "var(--pa-blue)" : "#6b7280",
                            color: "white",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                          }}
                        >
                          {run.status}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                      {run.finishedAt ? formatTimestamp(run.finishedAt) : run.startedAt ? formatTimestamp(run.startedAt) : "Pending"}
                    </div>
                    {run.errorMessage && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedRun(expandedRun === run.id ? null : run.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0.25rem",
                        }}
                      >
                        {expandedRun === run.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    )}
                  </div>
                  {expandedRun === run.id && run.errorMessage && (
                    <div style={{ padding: "0.75rem", background: "#fef2f2", borderTop: "1px solid #fecaca" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                        <XCircle size={20} style={{ color: "#dc2626", flexShrink: 0, marginTop: "0.125rem" }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: "#991b1b", marginBottom: "0.25rem" }}>Error</div>
                          <div style={{ fontSize: "0.875rem", color: "#7f1d1d", fontFamily: "monospace" }}>{run.errorMessage}</div>
                        </div>
                        <button
                          onClick={() => navigator.clipboard.writeText(run.errorMessage!)}
                          style={{
                            padding: "0.5rem 1rem",
                            border: "1px solid #fca5a5",
                            borderRadius: 6,
                            background: "white",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          <Copy size={12} style={{ marginRight: "0.25rem" }} />
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdsContent />
    </Suspense>
  );
}
