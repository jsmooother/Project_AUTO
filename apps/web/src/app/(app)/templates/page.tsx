"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LayoutGrid, RectangleVertical, Check } from "lucide-react";

interface AdTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  aspectRatio: string;
}

interface TemplateConfig {
  id: string;
  templateKey: string;
  brandName: string | null;
  primaryColor: string | null;
  logoUrl: string | null;
  headlineStyle: string | null;
  status: string;
}

interface AdPreview {
  id: string;
  previewType: string;
  htmlContent: string | null;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  externalId: string;
  title: string | null;
  price: number | null;
}

const AD_FORMATS = [
  { id: "feed" as const, label: "Feed (Square)", sub: "Facebook & Instagram Feed", icon: LayoutGrid },
  { id: "stories" as const, label: "Stories (Vertical)", sub: "Instagram & Facebook Stories", icon: RectangleVertical },
];

const TEMPLATE_STYLES = [
  { id: "classic" as const, label: "Classic", desc: "Balanced layout with clear pricing" },
  { id: "bold" as const, label: "Bold", desc: "Large price with high contrast" },
  { id: "minimal" as const, label: "Minimal", desc: "Clean design, subtle text" },
  { id: "modern" as const, label: "Modern", desc: "Contemporary with gradient" },
];

// Map format + style to backend templateKey
function formatToTemplateKey(format: "feed" | "stories"): string {
  return format === "feed" ? "single_hero" : "carousel_3";
}

const EXAMPLE_BADGES = ["Limited Time Offer", "Save $5,000", "0% APR for 60 months"];

function AdCard({
  item,
  badge,
  primaryColor,
  compact = false,
  noBorder = false,
}: {
  item: { title: string | null; price: number | null };
  badge?: string;
  primaryColor: string;
  compact?: boolean;
  noBorder?: boolean;
}) {
  // Parse "2024 Porsche 911 Carrera" style or use as-is
  const parts = (item.title ?? "Sample Item").split(" ");
  const make = parts.slice(1, 2).join(" ") || parts[0] || "Item";
  const model = parts.slice(2).join(" ") || parts[1] || "";
  const year = /^\d{4}$/.test(parts[0] ?? "") ? parts[0] : "";
  const displayTitle = year ? `${year} ${make}` : item.title ?? "Item";
  const displaySub = model || (year ? make : "");

  const price = item.price != null ? item.price : 0;
  const strikethrough = price > 100 ? Math.round(price * 1.2) : undefined;

  return (
    <div
      style={{
        background: "white",
        border: noBorder ? "none" : "1px solid var(--pa-border)",
        borderRadius: noBorder ? 0 : "var(--pa-radius-lg)",
        overflow: "hidden",
        maxWidth: compact ? 280 : 320,
      }}
    >
      <div style={{ position: "relative", aspectRatio: "1", background: "linear-gradient(135deg, #e5e7eb, #d1d5db)" }}>
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            color: "white",
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: "1rem" }}>{displayTitle}</div>
          {displaySub && <div style={{ fontSize: "0.9rem", opacity: 0.95 }}>{displaySub}</div>}
          <div style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 4 }}>${price.toLocaleString()}</div>
          {strikethrough != null && (
            <div style={{ fontSize: "0.85rem", textDecoration: "line-through", opacity: 0.9 }}>
              ${strikethrough.toLocaleString()}
            </div>
          )}
        </div>
        {badge && (
          <div
            style={{
              position: "absolute",
              bottom: 12,
              right: 12,
              padding: "0.25rem 0.5rem",
              borderRadius: 4,
              fontSize: "0.7rem",
              fontWeight: 600,
              background: badge.includes("Limited") ? "#eab308" : badge.includes("Save") ? "#22c55e" : "#1e40af",
              color: "white",
            }}
          >
            {badge}
          </div>
        )}
      </div>
      {!compact && (
        <>
          <div style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", color: "var(--pa-gray)" }}>
            Experience luxury and performance. Visit our showroom today.
          </div>
          <div style={{ padding: "0 1rem 1rem" }}>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                background: primaryColor,
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Learn More
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function SelectCard<T extends string>({
  selected,
  onSelect,
  value,
  label,
  sub,
  icon: Icon,
}: {
  selected: boolean;
  onSelect: () => void;
  value: T;
  label: string;
  sub?: string;
  icon?: React.ComponentType<{ size?: number }>;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        position: "relative",
        padding: "1rem 1.25rem",
        border: `2px solid ${selected ? "var(--pa-blue)" : "var(--pa-border)"}`,
        borderRadius: "var(--pa-radius-lg)",
        background: selected ? "#eff6ff" : "white",
        cursor: "pointer",
        textAlign: "left",
        minWidth: 160,
      }}
    >
      {selected && (
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <Check size={18} color="var(--pa-blue)" />
        </div>
      )}
      {Icon && (
        <div style={{ marginBottom: "0.5rem", color: selected ? "var(--pa-blue)" : "var(--pa-gray)" }}>
          <Icon size={24} />
        </div>
      )}
      <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{label}</div>
      {sub && <div style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginTop: 2 }}>{sub}</div>}
    </button>
  );
}

export default function TemplatesPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [previews, setPreviews] = useState<AdPreview[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [format, setFormat] = useState<"feed" | "stories">("feed");
  const [style, setStyle] = useState<"classic" | "bold" | "minimal" | "modern">("classic");
  const [brand, setBrand] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1e40af");
  const [applyLoading, setApplyLoading] = useState(false);
  const [previewMoreLoading, setPreviewMoreLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [previewHtmlCache, setPreviewHtmlCache] = useState<Record<string, string>>({});

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = () => {
    if (!customerId) return;
    Promise.all([
      apiGet<{ data: AdTemplate[] }>("/templates", { customerId }),
      apiGet<TemplateConfig | null>("/templates/config", { customerId }),
      apiGet<{ data: AdPreview[] }>("/templates/previews", { customerId }),
      apiGet<{ data: InventoryItem[] }>("/inventory/items", { customerId }),
    ])
      .then(([tRes, cRes, pRes, iRes]) => {
        if (tRes.ok) setTemplates(tRes.data.data ?? []);
        if (cRes.ok) {
          const c = cRes.data;
          setConfig(c ?? null);
          if (c?.brandName) setBrand(c.brandName);
          if (c?.primaryColor) setPrimaryColor(c.primaryColor);
          if (c?.headlineStyle && ["classic", "bold", "minimal", "modern"].includes(c.headlineStyle))
            setStyle(c.headlineStyle as typeof style);
          if (c?.templateKey) setFormat(c.templateKey === "carousel_3" ? "stories" : "feed");
          if (!c?.brandName) setBrand("Acme Motors");
        }
        if (pRes.ok) setPreviews((pRes.data.data ?? []).filter((p: AdPreview) => p.htmlContent));
        if (iRes.ok) setInventory(iRes.data.data ?? []);
      })
      .catch(() => setError("Failed to load templates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  useEffect(() => {
    if (!customerId || previews.length === 0) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    previews.forEach((p) => {
      fetch(`${base}/templates/previews/${p.id}/html`, {
        headers: { "x-customer-id": customerId },
        credentials: "include",
      })
        .then((r) => (r.ok ? r.text() : ""))
        .then((html) =>
          setPreviewHtmlCache((prev) => (prev[p.id] ? prev : { ...prev, [p.id]: html }))
        );
    });
  }, [customerId, previews.map((p) => p.id).join(",")]);

  const handleApplyTemplate = async () => {
    if (!customerId) return;
    setApplyLoading(true);
    setError(null);
    setErrorHint(null);
    const templateKey = formatToTemplateKey(format);
    const res = await apiPost(
      "/templates/config",
      {
        templateKey,
        brandName: brand || "Your Brand",
        primaryColor: primaryColor || undefined,
        headlineStyle: style,
      },
      { customerId }
    );
    setApplyLoading(false);
    if (res.ok) load();
    else {
      setError(res.error);
      setErrorHint(res.errorDetail?.hint ?? null);
    }
  };

  const handlePreviewMore = async () => {
    if (!customerId) return;
    setPreviewMoreLoading(true);
    setError(null);
    setErrorHint(null);
    const templateKey = formatToTemplateKey(format);
    const saveRes = await apiPost(
      "/templates/config",
      {
        templateKey,
        brandName: brand || "Your Brand",
        primaryColor: primaryColor || undefined,
        headlineStyle: style,
      },
      { customerId }
    );
    if (!saveRes.ok) {
      setError(saveRes.error);
      setErrorHint(saveRes.errorDetail?.hint ?? null);
      setPreviewMoreLoading(false);
      return;
    }
    const runRes = await apiPost("/templates/previews/run", undefined, { customerId });
    setPreviewMoreLoading(false);
    if (runRes.ok) router.push("/runs?type=preview");
    else {
      setError(runRes.error);
      setErrorHint(runRes.errorDetail?.hint ?? null);
    }
  };

  const handleApprove = async () => {
    if (!customerId) return;
    setApproveLoading(true);
    setError(null);
    setErrorHint(null);
    const res = await apiPost("/templates/approve", {}, { customerId });
    setApproveLoading(false);
    if (res.ok) load();
    else {
      setError(res.error);
      setErrorHint(res.errorDetail?.hint ?? null);
    }
  };

  if (auth.status !== "authenticated" || loading) return <LoadingSpinner />;

  const exampleItems = inventory.length >= 3
    ? inventory.slice(0, 3)
    : [
        { id: "1", externalId: "1", title: "2024 Porsche 911 Carrera", price: 124990 },
        { id: "2", externalId: "2", title: "2024 BMW X5 xDrive40i", price: 68900 },
        { id: "3", externalId: "3", title: "2024 Tesla Model 3 Long Range", price: 52990 },
      ];
  const previewItem = exampleItems[0] ?? { title: "2024 Porsche 911 Carrera", price: 124990 };

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
          Ad Templates
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
          Choose how your ads will appear on Meta platforms. Templates automatically use your inventory data.
        </p>
      </div>

      {error && <ErrorBanner message={error} hint={errorHint ?? undefined} onRetry={load} />}

      {/* Ad Format */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Ad Format</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {AD_FORMATS.map((f) => (
            <SelectCard
              key={f.id}
              selected={format === f.id}
              onSelect={() => setFormat(f.id)}
              value={f.id}
              label={f.label}
              sub={f.sub}
              icon={f.icon}
            />
          ))}
        </div>
      </section>

      {/* Template Style */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.75rem" }}>Template Style</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {TEMPLATE_STYLES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStyle(s.id)}
              style={{
                position: "relative",
                padding: "1rem 1.25rem",
                border: `2px solid ${style === s.id ? "var(--pa-blue)" : "var(--pa-border)"}`,
                borderRadius: "var(--pa-radius-lg)",
                background: style === s.id ? "#eff6ff" : s.id === "modern" ? "#f9fafb" : "white",
                cursor: "pointer",
                textAlign: "left",
                minWidth: 140,
              }}
            >
              {style === s.id && (
                <div style={{ position: "absolute", top: 8, right: 8 }}>
                  <Check size={18} color="var(--pa-blue)" />
                </div>
              )}
              <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{s.label}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Brand (compact) */}
      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label htmlFor="tpl-brand" style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginRight: 8 }}>Brand name</label>
          <input
            id="tpl-brand"
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Your Brand"
            style={{ padding: "0.4rem 0.75rem", border: "1px solid var(--pa-border)", borderRadius: 6, width: 160 }}
          />
        </div>
        <div>
          <label htmlFor="tpl-color" style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginRight: 8 }}>Primary color</label>
          <input
            id="tpl-color"
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            placeholder="#1e40af"
            style={{ padding: "0.4rem 0.75rem", border: "1px solid var(--pa-border)", borderRadius: 6, width: 100 }}
          />
        </div>
      </div>

      {/* Preview + Example Inventory Ads */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Preview */}
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Preview</h2>
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--pa-border)" }}>
              <div style={{ fontWeight: 600 }}>{brand || "Acme Motors"}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--pa-gray)" }}>Sponsored</div>
            </div>
            <AdCard
              item={previewItem}
              badge={EXAMPLE_BADGES[0]}
              primaryColor={primaryColor}
              compact={false}
              noBorder
            />
          </div>
        </section>

        {/* Example Inventory Ads */}
        <section>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>Example Inventory Ads</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {exampleItems.map((item, i) => (
              <AdCard
                key={item.id}
                item={item}
                badge={EXAMPLE_BADGES[i]}
                primaryColor={primaryColor}
                compact
              />
            ))}
          </div>
        </section>
      </div>

      {/* Status indicator */}
      {config && (
        <div
          style={{
            marginBottom: "1.5rem",
            padding: "1rem 1.5rem",
            background: config.status === "approved" ? "#d1fae5" : config.status === "preview_ready" ? "#dbeafe" : "#f3f4f6",
            border: `1px solid ${config.status === "approved" ? "#10b981" : config.status === "preview_ready" ? "#3b82f6" : "var(--pa-border)"}`,
            borderRadius: "var(--pa-radius-lg)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                Template Status: <span style={{ textTransform: "capitalize" }}>{config.status.replace("_", " ")}</span>
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                {config.status === "draft"
                  ? "Save your template configuration to proceed"
                  : config.status === "preview_ready"
                    ? "Review the generated previews below, then approve to use this template"
                    : config.status === "approved"
                      ? "This template is approved and ready to use for ads"
                      : ""}
              </div>
            </div>
            {config.status === "approved" && (
              <div
                style={{
                  padding: "0.25rem 0.75rem",
                  background: "var(--pa-green)",
                  color: "white",
                  borderRadius: 4,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                ✓ Approved
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          padding: "1rem 1.5rem",
          background: "#f9fafb",
          border: "1px solid var(--pa-border)",
          borderRadius: "var(--pa-radius-lg)",
        }}
      >
        <div style={{ fontSize: "0.9rem", color: "var(--pa-gray)" }}>
          Template: {style}
          <span style={{ marginLeft: "1rem" }}>Format: {format === "feed" ? "Feed (Square)" : "Stories (Vertical)"}</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleApplyTemplate}
            disabled={applyLoading}
            style={{
              padding: "0.5rem 1rem",
              background: applyLoading ? "#d1d5db" : primaryColor,
              color: "white",
              border: "none",
              borderRadius: 6,
              fontWeight: 500,
              fontSize: "0.875rem",
              cursor: applyLoading ? "not-allowed" : "pointer",
            }}
          >
            {applyLoading ? "Saving…" : config ? "Update Config" : "Save Template"}
          </button>
          {config && config.status !== "approved" && (
            <button
              type="button"
              onClick={handlePreviewMore}
              disabled={previewMoreLoading}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid var(--pa-border)",
                borderRadius: 6,
                background: "white",
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: previewMoreLoading ? "not-allowed" : "pointer",
              }}
            >
              {previewMoreLoading ? "Starting…" : "Generate Previews"}
            </button>
          )}
          {config?.status === "preview_ready" && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={approveLoading}
              style={{
                padding: "0.5rem 1rem",
                background: approveLoading ? "#d1d5db" : "var(--pa-green)",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: "0.875rem",
                cursor: approveLoading ? "not-allowed" : "pointer",
              }}
            >
              {approveLoading ? "Approving…" : "✓ Approve Template"}
            </button>
          )}
        </div>
      </div>

      {/* Generated previews (if any) */}
      {config && previews.length > 0 && (
        <section style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "1rem", fontWeight: 600 }}>Generated Previews</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {previews.map((p) => (
              <div
                key={p.id}
                style={{
                  border: "1px solid var(--pa-border)",
                  borderRadius: "var(--pa-radius-lg)",
                  overflow: "hidden",
                  background: "white",
                }}
              >
                <iframe
                  srcDoc={previewHtmlCache[p.id] ?? ""}
                  title={`Preview ${p.id}`}
                  sandbox="allow-same-origin"
                  style={{ width: "100%", height: 240, border: "none" }}
                />
                <div style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", color: "var(--pa-gray)" }}>
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
