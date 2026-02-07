"use client";

import { useI18n } from "@/lib/i18n/context";
import type { OnboardingStatusResult } from "@/lib/onboarding/useOnboardingStatus";
import { CheckCircle2, AlertCircle } from "lucide-react";

export interface OnboardingShellProps {
  children: React.ReactNode;
  stepIndex: number;
  totalSteps: number;
  primaryLabel: string;
  onPrimary: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  primaryDisabled?: boolean;
  status?: OnboardingStatusResult | null;
  showStatusBox?: boolean;
}

export function OnboardingShell({
  children,
  stepIndex,
  totalSteps,
  primaryLabel,
  onPrimary,
  onBack,
  onSkip,
  primaryDisabled = false,
  status,
  showStatusBox = false,
}: OnboardingShellProps) {
  const { t } = useI18n();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--pa-gray-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div
          style={{
            background: "white",
            borderRadius: "var(--pa-radius-lg)",
            border: "1px solid var(--pa-border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--pa-gray)", fontWeight: 500 }}>
              {t.onboarding.step} {stepIndex + 1} / {totalSteps}
            </span>
          </div>

          <div style={{ padding: "1.5rem" }}>{children}</div>

          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--pa-border)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid var(--pa-border)",
                    borderRadius: 6,
                    background: "white",
                    color: "var(--pa-dark)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                  }}
                >
                  {t.onboarding.back}
                </button>
              )}
              {onSkip && (
                <button
                  type="button"
                  onClick={onSkip}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    borderRadius: 6,
                    background: "transparent",
                    color: "var(--pa-gray)",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textDecoration: "underline",
                  }}
                >
                  {t.onboarding.skipNow}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onPrimary}
              disabled={primaryDisabled}
              style={{
                padding: "0.5rem 1.25rem",
                border: "none",
                borderRadius: 6,
                background: primaryDisabled ? "#d1d5db" : "var(--pa-dark)",
                color: "white",
                cursor: primaryDisabled ? "not-allowed" : "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {primaryLabel}
            </button>
          </div>
        </div>

        {showStatusBox && status && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f9fafb",
              border: "1px solid var(--pa-border)",
              borderRadius: "var(--pa-radius)",
              fontSize: "0.875rem",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{t.onboarding.statusBoxTitle}</div>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--pa-gray)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                {status.inventory.status === "ok" ? (
                  <CheckCircle2 size={16} color="#059669" />
                ) : (
                  <AlertCircle size={16} color="#d97706" />
                )}
                {status.inventory.status === "ok" ? `${status.inventoryCount} ${t.onboarding.itemsDetected}` : status.inventory.hint ?? "Inventory"}
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                {status.templates.status === "ok" ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#d97706" />}
                {status.templates.status === "ok" ? t.onboarding.approveTemplate : status.templates.hint ?? "Templates"}
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                {status.meta.status === "ok" ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#d97706" />}
                {status.meta.status === "ok" ? t.onboarding.verifyAccess : status.meta.hint ?? "Meta"}
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                {status.ads.status === "ok" ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#d97706" />}
                {status.ads.status === "ok" ? "Ads settings" : status.ads.hint ?? "Ads"}
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {status.billing.status === "ok" ? <CheckCircle2 size={16} color="#059669" /> : <AlertCircle size={16} color="#d97706" />}
                {status.billing.status === "ok" ? t.onboarding.budgetTitle : status.billing.hint ?? "Billing"}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
