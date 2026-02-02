"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3001/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Signup failed");
      }

      const data = await response.json();
      // Store customerId and userId in localStorage for subsequent requests
      localStorage.setItem("customerId", data.customerId);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("email", data.email);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1>Sign Up</h1>
      <p>Create your account to get started</p>

      {error && (
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>

        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem" }}>
            Organization Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            fontSize: "1rem",
            background: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
}
