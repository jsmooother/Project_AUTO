import { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = "default",
  subtitle,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "info";
  subtitle?: string;
}) {
  const variantStyles = {
    default: {
      bg: "white",
      border: "var(--pa-border)",
      iconColor: "var(--pa-gray)",
    },
    success: {
      bg: "#f0fdf4",
      border: "#bbf7d0",
      iconColor: "#16a34a",
      valueColor: "#166534",
      labelColor: "#15803d",
    },
    warning: {
      bg: "#fef3c7",
      border: "#fde68a",
      iconColor: "#d97706",
      valueColor: "#92400e",
      labelColor: "#b45309",
    },
    info: {
      bg: "#eff6ff",
      border: "#bfdbfe",
      iconColor: "#2563eb",
      valueColor: "#1e40af",
      labelColor: "#3b82f6",
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: "var(--pa-radius-lg)",
        padding: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        {Icon && <Icon size={20} style={{ color: styles.iconColor }} />}
        <span
          style={{
            fontSize: "0.875rem",
            color: styles.labelColor ?? "var(--pa-gray)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 600,
          color: styles.valueColor ?? "var(--pa-dark)",
          marginBottom: subtitle ? "0.25rem" : 0,
        }}
      >
        {value}
      </div>
      {subtitle && (
        <p
          style={{
            fontSize: "0.875rem",
            color: styles.labelColor ?? "var(--pa-gray)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
