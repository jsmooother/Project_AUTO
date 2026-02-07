import React from "react";
import { Shield, Info, AlertTriangle } from "lucide-react";

interface TrustBannerProps {
  children: React.ReactNode;
  variant?: "trust" | "info" | "warning";
}

export function TrustBanner({ children, variant = "trust" }: TrustBannerProps) {
  const styles = {
    trust: {
      bg: "#ecfdf5",
      border: "#a7f3d0",
      text: "#065f46",
      icon: Shield,
      iconColor: "#059669",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      text: "#1e40af",
      icon: Info,
      iconColor: "#3b82f6",
    },
    warning: {
      bg: "#fef3c7",
      border: "#fcd34d",
      text: "#92400e",
      icon: AlertTriangle,
      iconColor: "#eab308",
    },
  };

  const style = styles[variant];
  const Icon = style.icon;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.75rem 1rem",
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "6px",
        marginBottom: "1.5rem",
      }}
    >
      <Icon size={20} color={style.iconColor} style={{ flexShrink: 0 }} />
      <p style={{ fontSize: "0.875rem", color: style.text, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}
