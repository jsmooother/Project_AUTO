export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "white",
        border: "1px solid var(--pa-border)",
        borderRadius: "var(--pa-radius-lg)",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "1.25rem 1.5rem",
        borderBottom: "1px solid var(--pa-border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>{title}</h2>
        {subtitle && (
          <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div style={{ padding: "1.5rem" }}>{children}</div>;
}
