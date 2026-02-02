import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        background: "#f9f9f9",
        borderRadius: "8px",
        border: "1px dashed #ccc",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{title}</p>
      {description && <p style={{ color: "#666", marginBottom: "1rem" }}>{description}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          style={{
            display: "inline-block",
            padding: "0.5rem 1rem",
            background: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
