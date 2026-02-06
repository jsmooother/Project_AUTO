"use client";

import { useEffect, useState, Suspense, useCallback, useMemo } from "react";
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
    generatedImageUrl?: string;
  }>;
  hint?: string;
  needsCreatives?: boolean;
}

interface CreativeStatus {
  items: Array<{
    itemId: string;
    variants: Array<{
      variant: string;
      status: string;
      generatedImageUrl: string | null;
      errorMessage: string | null;
    }>;
  }>;
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
  const [creativeStatus, setCreativeStatus] = useState<CreativeStatus | null>(null);
  const [generatingCreatives, setGeneratingCreatives] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const loadPreview = useCallback(async () => {
    if (!customerId) return;
    const [previewRes, statusRes] = await Promise.all([
      apiGet<PreviewResponse>("/ads/publish-preview", { customerId }),
      apiGet<AdsStatus>("/ads/status", { customerId }),
    ]);
    if (previewRes.ok) {
      setPreview(previewRes.data);
      // Load creative status if we have items
      if (previewRes.data.projectedItems.length > 0) {
        const itemIds = previewRes.data.projectedItems.map((item) => item.vehicleId);
        const statusRes = await apiGet<CreativeStatus>(`/creatives/status?itemIds=${itemIds.join(",")}`, { customerId });
        if (statusRes.ok) {
          setCreativeStatus(statusRes.data);
        }
      }
    } else {
      setError(previewRes.error);
    }
    if (statusRes.ok) {
      setStatus(statusRes.data);
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    if (customerId) {
      loadPreview();
    }
  }, [customerId, loadPreview]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleGenerateCreatives = async () => {
    if (!customerId || !preview || preview.projectedItems.length === 0) return;
    setGeneratingCreatives(true);
    setError(null);
    
    const itemIds = preview.projectedItems.map((item) => item.vehicleId);
    const res = await apiPost<{ jobId: string; status: string }>(
      "/creatives/generate",
      { inventoryItemIds: itemIds, variants: ["feed", "story"] },
      { customerId }
    );
    
    if (res.ok) {
      // Start polling for status updates
      let pollCount = 0;
      const maxPolls = 30; // 60 seconds max (2s * 30)
      const poll = setInterval(async () => {
        pollCount++;
        const itemIds = preview.projectedItems.map((item) => item.vehicleId);
        const statusRes = await apiGet<CreativeStatus>(`/creatives/status?itemIds=${itemIds.join(",")}`, { customerId });
        if (statusRes.ok) {
          setCreativeStatus(statusRes.data);
          // Check if all items are generated or failed
          const allDone = statusRes.data.items.every((item) =>
            item.variants.some((v) => v.status === "generated" || v.status === "failed")
          );
          if (allDone || pollCount >= maxPolls) {
            clearInterval(poll);
            setPollingInterval(null);
            setGeneratingCreatives(false);
            loadPreview(); // Reload preview to get updated image URLs
          }
        }
      }, 2000);
      setPollingInterval(poll);
    } else {
      setError(res.error);
      setGeneratingCreatives(false);
    }
  };

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

  // Check if creatives are ready for all items
  const creativesReady = useMemo(() => {
    if (!preview || !creativeStatus || preview.projectedItems.length === 0) return false;
    return preview.projectedItems.every((item) => {
      const statusItem = creativeStatus.items.find((s) => s.itemId === item.vehicleId);
      return statusItem?.variants.some((v) => v.variant === "feed" && v.status === "generated");
    });
  }, [preview, creativeStatus]);

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

          {/* Generate Creatives Section */}
          {preview.projectedItems.length > 0 && (
            <div
              style={{
                background: "white",
                border: "1px solid var(--pa-border)",
                borderRadius: "var(--pa-radius-lg)",
                padding: "1.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}>Creative Generation</h2>
                  <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    Generate ad creatives with overlays for your items
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateCreatives}
                  disabled={generatingCreatives || pollingInterval !== null}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    background: generatingCreatives || pollingInterval !== null ? "#d1d5db" : "var(--pa-blue)",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    cursor: generatingCreatives || pollingInterval !== null ? "not-allowed" : "pointer",
                  }}
                >
                  {generatingCreatives || pollingInterval !== null ? (
                    <>
                      <LoadingSpinner />
                      {t.ads.preview.generating}
                    </>
                  ) : (
                    t.ads.preview.generateCreatives
                  )}
                </button>
              </div>
              {creativeStatus && (
                <div style={{ fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                  {creativeStatus.items.map((statusItem) => {
                    const feedVariant = statusItem.variants.find((v) => v.variant === "feed");
                    return (
                      <div key={statusItem.itemId} style={{ marginBottom: "0.5rem" }}>
                        {feedVariant?.status === "generated" && (
                          <span style={{ color: "#059669" }}>✓ {t.ads.preview.creativesReady}</span>
                        )}
                        {feedVariant?.status === "failed" && (
                          <span style={{ color: "#dc2626" }}>
                            ✗ {t.ads.preview.creativesFailed}: {feedVariant.errorMessage || "Unknown error"}
                          </span>
                        )}
                        {feedVariant?.status === "pending" && (
                          <span style={{ color: "var(--pa-gray)" }}>⏳ {t.ads.preview.generating}</span>
                        )}
                        {!feedVariant && <span style={{ color: "var(--pa-gray)" }}>— {t.ads.preview.notGeneratedYet}</span>}
                      </div>
                    );
                  })}
                </div>
              )}
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
                {preview.projectedItems.map((item) => {
                  const statusItem = creativeStatus?.items.find((s) => s.itemId === item.vehicleId);
                  const feedCreative = statusItem?.variants.find((v) => v.variant === "feed" && v.status === "generated");
                  const displayImageUrl = feedCreative?.generatedImageUrl || item.generatedImageUrl || item.imageUrl;
                  const isGenerated = !!feedCreative?.generatedImageUrl || !!item.generatedImageUrl;
                  
                  return (
                    <div
                      key={item.vehicleId}
                      style={{
                        border: "1px solid var(--pa-border)",
                        borderRadius: "var(--pa-radius)",
                        overflow: "hidden",
                      }}
                    >
                      {displayImageUrl && (
                        <div style={{ position: "relative" }}>
                          <img
                            src={displayImageUrl}
                            alt={item.title}
                            style={{ width: "100%", height: 200, objectFit: "cover" }}
                          />
                          {!isGenerated && (
                            <div
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                padding: "0.25rem 0.5rem",
                                background: "rgba(0,0,0,0.7)",
                                color: "white",
                                borderRadius: 4,
                                fontSize: "0.75rem",
                              }}
                            >
                              {t.ads.preview.notGeneratedYet}
                            </div>
                          )}
                        </div>
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
                  );
                })}
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
              disabled={publishLoading || !preview.ok || preview.projectedItems.length === 0 || !creativesReady}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: publishLoading || !preview.ok || preview.projectedItems.length === 0 || !creativesReady ? "#d1d5db" : "var(--pa-blue)",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontWeight: 500,
                fontSize: "1rem",
                cursor: publishLoading || !preview.ok || preview.projectedItems.length === 0 || !creativesReady ? "not-allowed" : "pointer",
              }}
              title={!creativesReady && preview.projectedItems.length > 0 ? t.ads.preview.proceedToPublishDisabledHint : undefined}
            >
              {publishLoading ? <LoadingSpinner /> : <CheckCircle2 size={16} />}
              {t.ads.proceedToPublish}
            </button>
            {!creativesReady && preview.projectedItems.length > 0 && (
              <div style={{ fontSize: "0.875rem", color: "#dc2626", marginTop: "0.5rem" }}>
                {t.ads.preview.proceedToPublishDisabledHint}
              </div>
            )}
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
