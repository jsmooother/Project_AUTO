"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { useI18n } from "@/lib/i18n/context";
import { ErrorBanner } from "@/components/ErrorBanner";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface AdsSettings {
  geoMode: "radius" | "regions";
  geoCenterText: string | null;
  geoRadiusKm: number | null;
  geoRegionsJson: string[] | null;
  formatsJson: string[];
  ctaType: string;
  budgetOverride: number | null;
}

interface AdsStatusResponse {
  settings?: {
    id?: string;
    geoMode: string;
    geoCenterText: string | null;
    geoRadiusKm: number | null;
    geoRegionsJson: string[] | null;
    formatsJson: string[];
    ctaType: string;
    budgetOverride: number | null;
  } | null;
  prerequisites?: { inventory?: { count?: number } };
}

const RADIUS_PRESETS = [10, 25, 50];
const FORMAT_OPTIONS = [
  { value: "feed", labelKey: "Feed" },
  { value: "stories", labelKey: "Stories" },
  { value: "reels", labelKey: "Reels" },
];
const CTA_OPTIONS = [
  { value: "learn_more" },
  { value: "shop_now" },
  { value: "sign_up" },
  { value: "contact_us" },
  { value: "apply_now" },
  { value: "download" },
];

export default function OnboardingAdsPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;
  const { result, loading, refresh } = useOnboardingStatus(customerId);

  const [settings, setSettings] = useState<AdsSettings>({
    geoMode: "radius",
    geoCenterText: null,
    geoRadiusKm: 25,
    geoRegionsJson: null,
    formatsJson: ["feed"],
    ctaType: "learn_more",
    budgetOverride: null,
  });
  const [inventoryCount, setInventoryCount] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [savedButNotConfirmed, setSavedButNotConfirmed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    Promise.all([
      apiGet<AdsStatusResponse>("/ads/status", { customerId }),
      apiGet<{ data: unknown[] }>("/inventory/items", { customerId }),
    ]).then(([adsRes, invRes]) => {
      if (adsRes.ok && adsRes.data.settings) {
        const s = adsRes.data.settings;
        setSettings({
          geoMode: (s.geoMode as "radius" | "regions") || "radius",
          geoCenterText: s.geoCenterText,
          geoRadiusKm: s.geoRadiusKm,
          geoRegionsJson: s.geoRegionsJson,
          formatsJson: Array.isArray(s.formatsJson) && s.formatsJson.length > 0 ? s.formatsJson : ["feed"],
          ctaType: s.ctaType || "learn_more",
          budgetOverride: s.budgetOverride,
        });
      }
      const prereqCount = adsRes.ok ? adsRes.data.prerequisites?.inventory?.count : undefined;
      if (prereqCount != null) {
        setInventoryCount(prereqCount);
      } else if (!adsRes.ok || prereqCount === undefined) {
        if (invRes.ok && Array.isArray(invRes.data.data)) {
          setInventoryCount(invRes.data.data.length);
        }
      }
      setLoaded(true);
    });
  }, [customerId]);

  const canSave =
    settings.formatsJson.length >= 1 &&
    (settings.geoMode === "regions"
      ? (settings.geoRegionsJson?.length ?? 0) > 0
      : !!(settings.geoCenterText?.trim() && settings.geoRadiusKm));

  const handleSaveAndContinue = async () => {
    if (!customerId || !canSave) return;
    setSaving(true);
    setError(null);
    setErrorHint(null);
    const payload: {
      geoMode: "radius" | "regions";
      geoCenterText?: string;
      geoRadiusKm?: number;
      geoRegionsJson?: string[];
      formatsJson: string[];
      ctaType: string;
      budgetOverride?: number;
    } = {
      geoMode: settings.geoMode,
      formatsJson: settings.formatsJson,
      ctaType: settings.ctaType,
    };
    if (settings.geoMode === "radius") {
      if (settings.geoCenterText) payload.geoCenterText = settings.geoCenterText;
      if (settings.geoRadiusKm) payload.geoRadiusKm = settings.geoRadiusKm;
    } else {
      if (settings.geoRegionsJson?.length) payload.geoRegionsJson = settings.geoRegionsJson;
    }
    if (settings.budgetOverride != null && settings.budgetOverride > 0) {
      payload.budgetOverride = settings.budgetOverride;
    }
    const res = await apiPost("/ads/settings", payload, { customerId });
    setSaving(false);
    if (res.ok) {
      setError(null);
      setErrorHint(null);
      setSavedButNotConfirmed(false);
      const statusRes = await apiGet<AdsStatusResponse>("/ads/status", { customerId });
      if (statusRes.ok && statusRes.data.settings?.id) {
        await refresh();
        router.push("/onboarding/budget");
      } else {
        setSavedButNotConfirmed(true);
      }
    } else {
      setError(!res.ok ? res.error : t.onboarding.saveFailed);
      setErrorHint(res.errorDetail?.hint ?? null);
    }
  };

  const handleBack = () => router.push("/onboarding/meta");

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && !loaded) return <LoadingSpinner />;

  return (
    <OnboardingShell
      stepIndex={4}
      totalSteps={6}
      primaryLabel={t.onboarding.saveAndContinue}
      onPrimary={handleSaveAndContinue}
      onBack={handleBack}
      primaryDisabled={!canSave || saving}
      status={result}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
        {t.onboarding.adsTitle}
      </h1>
      <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "0.5rem" }}>
        {t.onboarding.adsDescription}
      </p>
      {inventoryCount != null && inventoryCount > 0 && (
        <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1rem" }}>
          {t.onboarding.adsInventoryNote.replace("{count}", String(inventoryCount))}
        </p>
      )}

      {error && (
        <div style={{ marginBottom: "1rem" }}>
          <ErrorBanner message={error} hint={errorHint ?? undefined} />
        </div>
      )}

      {savedButNotConfirmed && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem 1rem",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "var(--pa-radius)",
            fontSize: "0.875rem",
            color: "#92400e",
          }}
        >
          {t.onboarding.adsSavedButNotConfirmed}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
            {t.onboarding.adsGeoLabel}
          </label>
          <input
            type="text"
            value={settings.geoCenterText ?? ""}
            onChange={(e) => setSettings({ ...settings, geoCenterText: e.target.value || null })}
            placeholder={t.onboarding.adsGeoPlaceholder}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--pa-border)",
              borderRadius: 6,
              fontSize: "0.875rem",
            }}
          />
          <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", marginTop: 4, marginBottom: 0 }}>
            {t.onboarding.adsGeoHelper}
          </p>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
            {t.onboarding.adsRadiusLabel}
          </label>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {RADIUS_PRESETS.map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setSettings({ ...settings, geoRadiusKm: km })}
                style={{
                  padding: "0.5rem 0.75rem",
                  border: `1px solid ${settings.geoRadiusKm === km ? "var(--pa-dark)" : "var(--pa-border)"}`,
                  borderRadius: 6,
                  background: settings.geoRadiusKm === km ? "var(--pa-dark)" : "white",
                  color: settings.geoRadiusKm === km ? "white" : "var(--pa-dark)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                {km} km
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
            {t.onboarding.adsFormatsLabel}
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {FORMAT_OPTIONS.map(({ value }) => (
              <label key={value} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.formatsJson.includes(value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({ ...settings, formatsJson: [...settings.formatsJson, value] });
                    } else {
                      setSettings({ ...settings, formatsJson: settings.formatsJson.filter((f) => f !== value) });
                    }
                  }}
                />
                <span style={{ fontSize: "0.875rem" }}>{value === "feed" ? "Feed" : value === "stories" ? "Stories" : "Reels"}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
            {t.onboarding.adsCtaLabel}
          </label>
          <select
            value={settings.ctaType}
            onChange={(e) => setSettings({ ...settings, ctaType: e.target.value })}
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--pa-border)",
              borderRadius: 6,
              fontSize: "0.875rem",
            }}
          >
            {CTA_OPTIONS.map(({ value }) => (
              <option key={value} value={value}>
                {value.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
            {t.onboarding.adsBudgetLabel}
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={settings.budgetOverride ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                budgetOverride: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            placeholder="SEK"
            style={{
              width: "100%",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--pa-border)",
              borderRadius: 6,
              fontSize: "0.875rem",
            }}
          />
        </div>
      </div>
    </OnboardingShell>
  );
}
