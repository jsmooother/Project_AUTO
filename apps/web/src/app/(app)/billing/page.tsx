"use client";

export default function BillingPage() {
  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Billing &amp; Payments</h1>
      <div
        style={{
          padding: "2rem",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px dashed #cbd5e0",
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Placeholder</p>
        <p style={{ color: "#718096", fontSize: "0.95rem" }}>
          Billing integration (Stripe) is not yet implemented. This page matches the Figma structure
          and will be wired when the backend is ready.
        </p>
      </div>
    </>
  );
}
