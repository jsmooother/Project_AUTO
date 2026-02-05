import { LucideIcon } from "lucide-react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  icon?: LucideIcon;
  loading?: boolean;
};

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  icon: Icon,
  loading,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        background: disabled || loading ? "#d1d5db" : "var(--pa-dark)",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: disabled || loading ? "not-allowed" : "pointer",
      }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  icon: Icon,
  loading,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        background: "white",
        color: "var(--pa-dark)",
        border: "1px solid var(--pa-border)",
        borderRadius: "6px",
        fontWeight: 500,
        fontSize: "0.875rem",
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
      }}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
