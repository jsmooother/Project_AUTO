"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { CheckCircle2 } from "lucide-react";

export default function OnboardingDonePage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleGoToDashboard = () => router.push("/dashboard");

  if (auth.status !== "authenticated") return null;

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
      <div
        style={{
          width: "100%",
          maxWidth: 448,
          background: "white",
          borderRadius: "var(--pa-radius-lg)",
          border: "1px solid var(--pa-border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#d1fae5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <CheckCircle2 size={32} color="#059669" />
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem", color: "var(--pa-dark)" }}>
          {t.onboarding.doneTitle}
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
          {t.onboarding.doneDescription}
        </p>
        <button
          type="button"
          onClick={handleGoToDashboard}
          style={{
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: 6,
            background: "var(--pa-dark)",
            color: "white",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          {t.onboarding.goToDashboard}
        </button>
      </div>
    </div>
  );
}
