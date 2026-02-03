"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Save } from "lucide-react";

interface AdsSettings {
  geoMode: string;
  geoCenterText: string | null;
  geoRadiusKm: number | null;
  geoRegionsJson: string[] | null;
  formatsJson: string[];
  ctaType: string;
  budgetOverride: number | null;
}

function AdsSetupContent() {
  const { auth } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AdsSettings>({
    geoMode: "radius",
    geoCenterText: null,
    geoRadiusKm: null,
    geoRegionsJson: null,
    formatsJson: [],
    ctaType: "learn_more",
    budgetOverride: null,
  });

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  useEffect(() => {
    if (!customerId) return;
    apiGet<AdsStatus>("/ads/status", { customerId })
      .then((res) => {
        if (res.ok && res.data.settings) {
          setSettings({
            geoMode: res.data.settings.geoMode,
            geoCenterText: res.data.settings.geoCenterText,
            geoRadiusKm: res.data.settings.geoRadiusKm,
            geoRegionsJson: res.data.settings.geoRegionsJson,
            formatsJson: res.data.settings.formatsJson,
            ctaType: res.data.settings.ctaType,
            budgetOverride: res.data.settings.budgetOverride,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings");
        setLoading(false);
      });
  }, [customerId]);

  const handleSave = async () => {
    if (!customerId) return;
    setSaving(true);
    setError(null);

    const payload: {
      geoMode: "radius" | "regions";
      geoCenterText?: string;
      geoRadiusKm?: number;
      geoRegionsJson?: string[];
      formatsJson: string[];
      ctaType: string;
      budgetOverride?: number;
    } = {
      geoMode: settings.geoMode as "radius" | "regions",
      formatsJson: settings.formatsJson,
      ctaType: settings.ctaType,
    };

    if (settings.geoMode === "radius") {
      if (settings.geoCenterText) payload.geoCenterText = settings.geoCenterText;
      if (settings.geoRadiusKm) payload.geoRadiusKm = settings.geoRadiusKm;
    } else {
      if (settings.geoRegionsJson) payload.geoRegionsJson = settings.geoRegionsJson;
    }

    if (settings.budgetOverride) payload.budgetOverride = settings.budgetOverride;

    const res = await apiPost("/ads/settings", payload, { customerId });
    if (res.ok) {
      router.push("/ads");
    } else {
      setError(res.error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ads Configuration</h1>
        <p className="text-gray-600">Configure your ad targeting, formats, and budget</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Geo Targeting */}
        <div>
          <label className="block text-sm font-medium mb-2">Geo Targeting Mode</label>
          <select
            value={settings.geoMode}
            onChange={(e) => setSettings({ ...settings, geoMode: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="radius">Radius (center + distance)</option>
            <option value="regions">Regions (specific areas)</option>
          </select>
        </div>

        {settings.geoMode === "radius" ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Center Location</label>
              <input
                type="text"
                value={settings.geoCenterText ?? ""}
                onChange={(e) => setSettings({ ...settings, geoCenterText: e.target.value || null })}
                placeholder="e.g., New York, NY"
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Radius (km)</label>
              <input
                type="number"
                value={settings.geoRadiusKm ?? ""}
                onChange={(e) =>
                  setSettings({ ...settings, geoRadiusKm: e.target.value ? parseInt(e.target.value, 10) : null })
                }
                placeholder="e.g., 50"
                className="w-full p-2 border rounded"
              />
            </div>
          </>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Regions (comma-separated)</label>
            <input
              type="text"
              value={settings.geoRegionsJson?.join(", ") ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  geoRegionsJson: e.target.value ? e.target.value.split(",").map((s) => s.trim()) : null,
                })
              }
              placeholder="e.g., US-CA, US-NY, US-TX"
              className="w-full p-2 border rounded"
            />
          </div>
        )}

        {/* Formats */}
        <div>
          <label className="block text-sm font-medium mb-2">Ad Formats</label>
          <div className="space-y-2">
            {["feed", "stories", "reels", "video"].map((format) => (
              <label key={format} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.formatsJson.includes(format)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSettings({ ...settings, formatsJson: [...settings.formatsJson, format] });
                    } else {
                      setSettings({ ...settings, formatsJson: settings.formatsJson.filter((f) => f !== format) });
                    }
                  }}
                />
                <span className="capitalize">{format}</span>
              </label>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div>
          <label className="block text-sm font-medium mb-2">Call-to-Action</label>
          <select
            value={settings.ctaType}
            onChange={(e) => setSettings({ ...settings, ctaType: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="learn_more">Learn More</option>
            <option value="shop_now">Shop Now</option>
            <option value="sign_up">Sign Up</option>
            <option value="download">Download</option>
          </select>
        </div>

        {/* Budget Override */}
        <div>
          <label className="block text-sm font-medium mb-2">Budget Override (optional)</label>
          <input
            type="number"
            value={settings.budgetOverride ?? ""}
            onChange={(e) =>
              setSettings({ ...settings, budgetOverride: e.target.value ? parseFloat(e.target.value) : null })
            }
            placeholder="Leave empty to use default"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <LoadingSpinner /> : <Save size={16} />}
            Save Configuration
          </button>
          <button
            onClick={() => router.push("/ads")}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface AdsStatus {
  settings: {
    geoMode: string;
    geoCenterText: string | null;
    geoRadiusKm: number | null;
    geoRegionsJson: string[] | null;
    formatsJson: string[];
    ctaType: string;
    budgetOverride: number | null;
  } | null;
}

export default function AdsSetupPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AdsSetupContent />
    </Suspense>
  );
}
