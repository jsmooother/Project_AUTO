"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { TestModeBanner } from "@/components/TestModeBanner";
import { useI18n } from "@/lib/i18n/context";
import { ExternalLink, AlertTriangle, CheckCircle2 } from "lucide-react";

interface PreviewResponse {
  ok: boolean;
  qaGate: {
    total: number;
    invalid: number;
    invalidRate: number;
    threshold: number;
    failures: Array<{ itemId: string; valid: boolean; reason?: string }>;
  };
  projectedItems: Array<{
    title: string;
    priceAmount: number;
    currency: string;
    imageUrl: string;
    destinationUrl: string;
    vehicleId: string;
  }>;
  hint?: string;
}

interface AdsStatus {
  derived?: {
    metaAccountMode?: "internal_test" | "customer_selected";
  };
}

function PreviewContent() {
  const { auth } = useAuth();
  const { t, formatCurrency } = useI18n();
  const router = useRouter();
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [status, setStatus] = useState<AdsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishLoading, setPublishLoading] = useState(false);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  useEffect(() => {
    if (!customerId) return;
    Promise.all([
      apiGet<PreviewResponse>("/ads/publish-preview", { customerId }),
      apiGet<AdsStatus>("/ads/status", { customerId }),
    ])
      .then(([previewRes, statusRes]) => {
        if (previewRes.ok) {
          setPreview(previewRes.data);
        } else {
          setError(previewRes.error);
        }
        if (statusRes.ok) {
          setStatus(statusRes.data);
        }
      })
      .catch(() => setError("Failed to load preview"))
      .finally(() => setLoading(false));
  }, [customerId]);

  const handlePublish = async () => {
    if (!customerId) return;
    setPublishLoading(true);
    const res = await apiPost<{ runId: string; jobId: string | null }>("/ads/publish", {}, { customerId });
    if (res.ok) {
      router.push("/ads");
    } else {
      setError(res.error);
    }
    setPublishLoading(false);
  };

  if (auth.status !== "authenticated") return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;

  const isTestMode = status?.derived?.metaAccountMode === "internal_test";
  const qaGatePassed = preview?.ok && (preview.qaGate.invalidRate <= preview.qaGate.threshold);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/ads" style={{ display: "inline-block", marginBottom: "1rem", color: "var(--pa-dark)", textDecoration: "none" }}>
          ← {t.common.back}
        </Link>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 600, letterSpacing: "-0.025em", marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
          {t.ads.previewTitle}
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>{t.ads.previewDescription}</p>
      </div>

      {error && <ErrorBanner message={error} />}
      {isTestMode && <TestModeBanner />}

      {preview && (
        <>
          {/* QA Gate Status */}
          {!qaGatePassed && (
            <div
              style={{
                padding: "1rem",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: "var(--pa-radius)",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.75rem",
              }}
            >
              <AlertTriangle style={{ width: 20, height: 20, color: "#991b1b", flexShrink: 0, marginTop: "0.125rem" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, marginBottom: "0.25rem", color: "#991b1b" }}>{t.ads.qaGateFailing}</div>
                <div style={{ fontSize: "0.875rem", color: "#991b1b" }}>
                  {t.ads.qaGateFailingHint}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#991b1b", marginTop: "0.5rem" }}>
                  Invalid rate: {Math.round(preview.qaGate.invalidRate * 100)}% ({preview.qaGate.invalid} of {preview.qaGate.total} items)
                </div>
              </div>
            </div>
          )}

          {/* Items to Publish */}
          <div
            style={{
              background: "white",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius-lg)",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>{t.ads.itemsToPublish}</h2>
            {preview.projectedItems.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "var(--pa-gray)" }}>
                {preview.hint || t.ads.noItemsToPublish}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                {preview.projectedItems.map((item) => (
                  <div
                    key={item.vehicleId}
                    style={{
                      border: "1px solid var(--pa-border)",
                      borderRadius: "var(--pa-radius)",
                      overflow: "hidden",
                    }}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        style={{ width: "100%", height: 200, objectFit: "cover" }}
                      />
                    )}
                    <div style={{ padding: "1rem" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>{item.title}</h3>
                      <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
                        {t.ads.price}: {formatCurrency(item.priceAmount)}
                      </div>
                      <a
                        href={item.destinationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          fontSize: "0.875rem",
                          color: "var(--pa-blue)",
                          textDecoration: "none",
                        }}
                      >
                        {t.ads.viewItem} <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <Link href="/ads">
              <button
                style={{
                  padding: "0.75rem 1.5rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: 6,
                  background: "white",
                  fontSize: "1rem",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {t.common.cancel}
              </button>
            </Link>
            <button
              onClick={handlePublish}
              disabled={publishLoading || !preview.ok || preview.projectedItems.length === 0}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: publishLoading || !preview.ok || preview.projectedItems.length === 0 ? "#d1d5db" : "var(--pa-blue)",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: "1rem",
                cursor: publishLoading || !preview.ok || preview.projectedItems.length === 0 ? "not-allowed" : "pointer",
              }}
            >
              {publishLoading ? <LoadingSpinner /> : <CheckCircle2 size={16} />}
              {t.ads.proceedToPublish}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PreviewContent />
    </Suspense>
  );
}
