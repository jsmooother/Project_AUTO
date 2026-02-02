export function LoadingSpinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <span style={{ color: "#666" }}>Loading…</span>
    </div>
  );
}
