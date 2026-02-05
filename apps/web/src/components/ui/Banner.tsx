import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

export function Banner({
  children,
  variant = "info",
}: {
  children: React.ReactNode;
  variant?: "info" | "warning" | "success" | "error";
}) {
  const variantConfig = {
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      color: "#1e40af",
      icon: Info,
    },
    warning: {
      bg: "#fef3c7",
      border: "#fde68a",
      color: "#92400e",
      icon: AlertTriangle,
    },
    success: {
      bg: "#d1fae5",
      border: "#a7f3d0",
      color: "#065f46",
      icon: CheckCircle2,
    },
    error: {
      bg: "#fee2e2",
      border: "#fecaca",
      color: "#991b1b",
      icon: XCircle,
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      style={{
        padding: "0.75rem 1rem",
        background: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "var(--pa-radius)",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        fontSize: "0.875rem",
        color: config.color,
      }}
    >
      <Icon size={16} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
