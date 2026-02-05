"use client";

import { useLanguage } from "@/lib/language";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem",
        borderRadius: "6px",
        border: "1px solid var(--pa-border)",
        background: "white",
      }}
    >
      <Globe size={16} style={{ color: "var(--pa-gray)" }} />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as "sv" | "en")}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "0.875rem",
          cursor: "pointer",
          outline: "none",
          color: "var(--pa-dark)",
          fontWeight: 500,
        }}
      >
        <option value="sv">Svenska</option>
        <option value="en">English</option>
      </select>
    </div>
  );
}
