import React from "react";

interface SectionProps {
  icon?: string;
  title: string;
  children: React.ReactNode;
}

export function Section({ icon, title, children }: SectionProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <h2
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          marginBottom: "1rem",
          color: "#1a1a1a",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {icon && <span style={{ fontSize: "1.25rem" }}>{icon}</span>}
        {title}
      </h2>
      {children}
    </div>
  );
}
