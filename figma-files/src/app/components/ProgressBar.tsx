import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps?: string[];
}

export function ProgressBar({ currentStep, totalSteps, steps }: ProgressBarProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Progress indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
        }}
      >
        <span style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 500 }}>
          Step {currentStep} of {totalSteps}
        </span>
        <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: "100%",
          height: 6,
          background: "#e5e7eb",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(currentStep / totalSteps) * 100}%`,
            height: "100%",
            background: "#3b82f6",
            borderRadius: 3,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Step labels (optional) */}
      {steps && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "0.75rem",
          }}
        >
          {steps.map((step, idx) => (
            <span
              key={idx}
              style={{
                fontSize: "0.75rem",
                color: idx < currentStep ? "#3b82f6" : "#9ca3af",
                fontWeight: idx === currentStep - 1 ? 600 : 400,
              }}
            >
              {step}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
