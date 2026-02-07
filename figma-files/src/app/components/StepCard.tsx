import React from "react";

interface StepCardProps {
  number: number;
  title: string;
  children?: React.ReactNode;
  completed?: boolean;
}

export function StepCard({ number, title, children, completed = false }: StepCardProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "1.25rem",
        background: completed ? "#f0fdf4" : "#f9fafb",
        border: `1px solid ${completed ? "#a7f3d0" : "#e5e7eb"}`,
        borderRadius: "8px",
        marginBottom: "1rem",
      }}
    >
      {/* Number badge */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: completed ? "#059669" : "#1a1a1a",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.875rem",
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {completed ? "✓" : number}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            marginBottom: children ? "0.5rem" : 0,
            color: "#1a1a1a",
          }}
        >
          {title}
        </p>
        {children && (
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>{children}</div>
        )}
      </div>
    </div>
  );
}
