type ErrorBannerProps = {
  message: string;
  hint?: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, hint, onRetry }: ErrorBannerProps) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "#fee",
        color: "#c00",
        borderRadius: "4px",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <span>{message}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              padding: "0.25rem 0.5rem",
              background: "#fff",
              border: "1px solid #c00",
              color: "#c00",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        )}
      </div>
      {hint && (
        <span style={{ fontSize: "0.9rem", color: "#744" }}>{hint}</span>
      )}
    </div>
  );
}
