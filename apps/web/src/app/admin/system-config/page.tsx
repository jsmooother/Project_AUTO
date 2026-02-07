"use client";

export default function AdminSystemConfigPage() {
  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>System</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>System health</p>
      </div>
      <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
        Feature flags, rate limits, and integration health
      </p>
      <p style={{ color: "#9ca3af" }}>System configuration UI not implemented yet.</p>
    </div>
  );
}
