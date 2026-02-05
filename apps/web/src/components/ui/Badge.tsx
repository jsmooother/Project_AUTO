export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
}) {
  const variantStyles = {
    default: {
      bg: "#f3f4f6",
      color: "var(--pa-gray)",
      border: "var(--pa-border)",
    },
    success: {
      bg: "#d1fae5",
      color: "#065f46",
      border: "#a7f3d0",
    },
    error: {
      bg: "#fee2e2",
      color: "#991b1b",
      border: "#fecaca",
    },
    warning: {
      bg: "#fef3c7",
      color: "#92400e",
      border: "#fde68a",
    },
    info: {
      bg: "#dbeafe",
      color: "#1e40af",
      border: "#93c5fd",
    },
  };

  const styles = variantStyles[variant];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.5rem",
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: "4px",
        fontSize: "0.75rem",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
