"use client";

/**
 * Catches errors in the root layout (e.g. AuthProvider).
 * Must define its own html/body since it replaces the entire root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f3f4f6" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Application error
          </h1>
          <p style={{ color: "#6b7280", marginBottom: "1.5rem", textAlign: "center" }}>
            {error.message || "An unexpected error occurred"}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "0.5rem 1rem",
              background: "#1a1a1a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
            Run <code>./scripts/restart-dev.sh</code> then restart dev servers.
          </p>
        </div>
      </body>
    </html>
  );
}
