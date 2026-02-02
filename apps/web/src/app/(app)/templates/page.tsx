"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";

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
  status: string;
}

interface AdPreview {
  id: string;
  previewType: string;
  htmlContent: string | null;
  createdAt: string;
}

export default function TemplatesPage() {
  const { auth } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [previews, setPreviews] = useState<AdPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formBrand, setFormBrand] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formLogo, setFormLogo] = useState("");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [previewHtmlCache, setPreviewHtmlCache] = useState<Record<string, string>>({});

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = () => {
    if (!customerId) return;
    Promise.all([
      apiGet<{ data: AdTemplate[] }>("/templates", { customerId }),
      apiGet<TemplateConfig | null>("/templates/config", { customerId }),
      apiGet<{ data: AdPreview[] }>("/templates/previews", { customerId }),
    ])
      .then(([tRes, cRes, pRes]) => {
        if (tRes.ok) setTemplates(tRes.data.data ?? []);
        if (cRes.ok) {
          const c = cRes.data;
          setConfig(c ?? null);
          if (c?.brandName) setFormBrand(c.brandName);
          if (c?.primaryColor) setFormColor(c.primaryColor);
          if (c?.logoUrl) setFormLogo(c.logoUrl);
          if (c?.templateKey) setSelectedTemplateKey(c.templateKey);
        }
        if (pRes.ok)
          setPreviews((pRes.data.data ?? []).filter((p: AdPreview) => p.htmlContent));
      })
      .catch(() => setError("Failed to load templates"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId]);

  useEffect(() => {
    if (!customerId || previews.length === 0) return;
    previews.forEach((p) => {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/templates/previews/${p.id}/html`,
        { headers: { "x-customer-id": customerId }, credentials: "include" }
      )
        .then((r) => (r.ok ? r.text() : ""))
        .then((html) =>
          setPreviewHtmlCache((prev) =>
            prev[p.id] ? prev : { ...prev, [p.id]: html }
          )
        );
    });
  }, [customerId, previews.map((p) => p.id).join(",")]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !selectedTemplateKey) return;
    setSaveLoading(true);
    setError(null);
    const res = await apiPost(
      "/templates/config",
      {
        templateKey: selectedTemplateKey,
        brandName: formBrand || undefined,
        primaryColor: formColor || undefined,
        logoUrl: formLogo || undefined,
      },
      { customerId }
    );
    setSaveLoading(false);
    if (res.ok) load();
    else setError(res.error);
  };

  const handleGeneratePreviews = async () => {
    if (!customerId) return;
    setGenerateLoading(true);
    setError(null);
    const res = await apiPost("/templates/previews/run", undefined, { customerId });
    setGenerateLoading(false);
    if (res.ok) router.push("/runs?type=preview");
    else setError(res.error);
  };

  const handleApprove = async () => {
    if (!customerId) return;
    setApproveLoading(true);
    setError(null);
    const res = await apiPost("/templates/approve", {}, { customerId });
    setApproveLoading(false);
    if (res.ok) load();
    else setError(res.error);
  };

  if (auth.status !== "authenticated" || loading) return <LoadingSpinner />;

  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Templates</h1>
      {error && <ErrorBanner message={error} onRetry={load} />}

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Template library</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {templates.map((t) => (
            <div
              key={t.key}
              onClick={() => setSelectedTemplateKey(t.key)}
              style={{
                padding: "1rem",
                border: `2px solid ${selectedTemplateKey === t.key ? "#0070f3" : "#e2e8f0"}`,
                borderRadius: "8px",
                cursor: "pointer",
                minWidth: "180px",
              }}
            >
              <div style={{ fontWeight: 600 }}>{t.name}</div>
              <div style={{ fontSize: "0.9rem", color: "#666" }}>{t.description ?? ""}</div>
              <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{t.aspectRatio}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Current config</h2>
        <div
          style={{
            padding: "1rem",
            background: config ? "#f9fafb" : "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          {config ? (
            <>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: "4px",
                    background:
                      config.status === "approved"
                        ? "#d4edda"
                        : config.status === "preview_ready"
                          ? "#fff3cd"
                          : "#f0f0f0",
                  }}
                >
                  {config.status.replace("_", " ")}
                </span>
              </p>
              <p>Template: {config.templateKey}</p>
            </>
          ) : (
            <p>No template selected. Choose one above and save.</p>
          )}
        </div>
        <form
          onSubmit={handleSaveConfig}
          style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "400px" }}
        >
          <div>
            <label htmlFor="brand" style={{ display: "block", marginBottom: "0.25rem" }}>Brand name</label>
            <input
              id="brand"
              type="text"
              value={formBrand}
              onChange={(e) => setFormBrand(e.target.value)}
              placeholder="Your Brand"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <label htmlFor="color" style={{ display: "block", marginBottom: "0.25rem" }}>Primary color (hex)</label>
            <input
              id="color"
              type="text"
              value={formColor}
              onChange={(e) => setFormColor(e.target.value)}
              placeholder="#0070f3"
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <div>
            <label htmlFor="logo" style={{ display: "block", marginBottom: "0.25rem" }}>Logo URL (optional)</label>
            <input
              id="logo"
              type="url"
              value={formLogo}
              onChange={(e) => setFormLogo(e.target.value)}
              placeholder="https://..."
              style={{ width: "100%", padding: "0.5rem" }}
            />
          </div>
          <button
            type="submit"
            disabled={saveLoading || !selectedTemplateKey}
            style={{
              padding: "0.5rem 1rem",
              background: saveLoading || !selectedTemplateKey ? "#cbd5e0" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: saveLoading || !selectedTemplateKey ? "not-allowed" : "pointer",
            }}
          >
            {saveLoading ? "Saving…" : "Save config"}
          </button>
        </form>
      </section>

      {config && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Previews</h2>
          <div style={{ marginBottom: "1rem" }}>
            <button
              type="button"
              onClick={handleGeneratePreviews}
              disabled={generateLoading}
              style={{
                padding: "0.5rem 1rem",
                background: generateLoading ? "#cbd5e0" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: generateLoading ? "not-allowed" : "pointer",
              }}
            >
              {generateLoading ? "Starting…" : "Generate previews"}
            </button>
            <span style={{ marginLeft: "1rem", fontSize: "0.9rem", color: "#666" }}>
              Runs as background job. Check <Link href="/runs?type=preview" style={{ color: "#0070f3" }}>Runs</Link> for status.
            </span>
          </div>
          {previews.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
              {previews.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#fff",
                  }}
                >
                  <iframe
                    srcDoc={previewHtmlCache[p.id] ?? ""}
                    title={`Preview ${p.id}`}
                    sandbox="allow-same-origin"
                    style={{ width: "100%", height: "240px", border: "none" }}
                  />
                  <div style={{ padding: "0.5rem", fontSize: "0.85rem", color: "#666" }}>
                    {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
          {config.status === "preview_ready" && (
            <div style={{ marginTop: "1rem" }}>
              <button
                type="button"
                onClick={handleApprove}
                disabled={approveLoading}
                style={{
                  padding: "0.5rem 1rem",
                  background: approveLoading ? "#cbd5e0" : "#38a169",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: approveLoading ? "not-allowed" : "pointer",
                }}
              >
                {approveLoading ? "Approving…" : "Approve template"}
              </button>
            </div>
          )}
        </section>
      )}
    </>
  );
}
