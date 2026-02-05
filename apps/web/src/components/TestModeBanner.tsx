"use client";

import { useI18n } from "@/lib/i18n/context";
import { Info } from "lucide-react";

export function TestModeBanner() {
  const { t } = useI18n();

  return (
    <div
      style={{
        padding: "1rem",
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: "var(--pa-radius)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        marginBottom: "1.5rem",
      }}
    >
      <Info style={{ width: 20, height: 20, color: "#2563eb", flexShrink: 0, marginTop: "0.125rem" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, marginBottom: "0.25rem", color: "#1e40af" }}>
          {t.ads.testModeBanner}
        </div>
        <div style={{ fontSize: "0.875rem", color: "#1e40af" }}>
          {t.ads.testModeBannerDescription}
        </div>
      </div>
    </div>
  );
}
