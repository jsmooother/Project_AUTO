"use client";

import { useState, useCallback } from "react";
import { Copy } from "lucide-react";

export interface CopyToClipboardProps {
  value: string;
  label: string;
  maskedValue?: string;
  showFullDefault?: boolean;
  copyLabel?: string;
  copiedLabel?: string;
  showFullLabel?: string;
}

export function CopyToClipboard({
  value,
  label,
  maskedValue,
  showFullDefault = false,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  showFullLabel = "Show full",
}: CopyToClipboardProps) {
  const [showFull, setShowFull] = useState(showFullDefault);
  const [copied, setCopied] = useState(false);

  const displayValue = maskedValue != null && !showFull ? maskedValue : value;
  const canCopy = value.length > 0;

  const handleCopy = useCallback(async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(t);
    } catch {
      setCopied(false);
    }
  }, [value, canCopy]);

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, marginBottom: 4 }}>
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <code
          style={{
            flex: 1,
            minWidth: 120,
            padding: "0.5rem 0.75rem",
            background: "#f3f4f6",
            border: "1px solid var(--pa-border)",
            borderRadius: 6,
            fontSize: "0.875rem",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          {displayValue || "—"}
        </code>
        {maskedValue != null && displayValue === maskedValue && value !== maskedValue && (
          <button
            type="button"
            onClick={() => setShowFull(true)}
            style={{
              padding: "0.375rem 0.75rem",
              fontSize: "0.75rem",
              border: "1px solid var(--pa-border)",
              borderRadius: 6,
              background: "white",
              cursor: "pointer",
            }}
          >
            {showFullLabel}
          </button>
        )}
        {canCopy && (
          <button
            type="button"
            onClick={handleCopy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--pa-border)",
              borderRadius: 6,
              background: copied ? "#d1fae5" : "white",
              color: copied ? "#065f46" : "var(--pa-dark)",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <Copy size={14} />
            {copied ? copiedLabel : copyLabel}
          </button>
        )}
      </div>
    </div>
  );
}
