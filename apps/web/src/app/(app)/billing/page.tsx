"use client";

export default function BillingPage() {
  return (
    <div style={{ maxWidth: 1280 }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.875rem",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            marginBottom: "0.5rem",
            color: "var(--pa-dark)",
          }}
        >
          Billing & Payments
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
          Manage your subscription and payment methods
        </p>
      </div>

      <div
        style={{
          background: "white",
          border: "1px solid var(--pa-border)",
          borderRadius: "var(--pa-radius-lg)",
          padding: "2rem",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Placeholder</p>
        <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem" }}>
          Billing integration (Stripe) is not yet implemented. This page will be wired when the
          backend is ready.
        </p>
      </div>
    </div>
  );
}
