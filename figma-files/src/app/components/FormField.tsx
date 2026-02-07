import React from "react";

interface FormFieldProps {
  label: string;
  helper?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ label, helper, children, required = false }: FormFieldProps) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label
        style={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 500,
          marginBottom: "0.5rem",
          color: "#1a1a1a",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: "0.25rem" }}>*</span>}
      </label>

      {children}

      {helper && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "0.5rem",
            marginBottom: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: "0.25rem",
          }}
        >
          <span style={{ flexShrink: 0 }}>💡</span>
          <span>{helper}</span>
        </p>
      )}
    </div>
  );
}
