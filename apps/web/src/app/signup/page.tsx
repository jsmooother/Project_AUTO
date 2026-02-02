"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Signup failed");
      }

      const data = await response.json();
      localStorage.setItem("customerId", data.customerId);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--pa-gray-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: 448 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              marginBottom: "0.25rem",
              color: "var(--pa-dark)",
            }}
          >
            Project Auto
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--pa-gray)" }}>
            Smarter ads. Zero busywork.
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "var(--pa-radius-lg)",
            border: "1px solid var(--pa-border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.5rem 1.5rem 0" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
                color: "var(--pa-dark)",
              }}
            >
              Create your account
            </h2>
            <p style={{ fontSize: "0.95rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
              Start automating your inventory ads in minutes
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#fef2f2",
                  color: "#b91c1c",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="email" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  fontSize: "1rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: "6px",
                  background: "#f3f4f6",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="password" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Password (min 8 characters)
              </label>
              <input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  fontSize: "1rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: "6px",
                  background: "#f3f4f6",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label htmlFor="name" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                Organization name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Acme Inc."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "0.5rem 0.75rem",
                  fontSize: "1rem",
                  border: "1px solid var(--pa-border)",
                  borderRadius: "6px",
                  background: "#f3f4f6",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.5rem 1rem",
                height: 40,
                background: loading ? "#d1d5db" : "var(--pa-dark)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Creating account…" : "Continue"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "var(--pa-blue)" }}>
                Log in
              </Link>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--pa-gray)", textAlign: "center" }}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
