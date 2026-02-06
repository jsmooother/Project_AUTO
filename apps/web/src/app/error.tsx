"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#f3f4f6",
      }}
    >
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.5rem" }}>
        Something went wrong
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
        If this persists, try{" "}
        <Link
          href="/"
          style={{ color: "#3b82f6" }}
        >
          going home
        </Link>
        {" "}or restarting the dev server (see README troubleshooting).
      </p>
    </div>
  );
}
