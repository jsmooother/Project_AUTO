"use client";

import { useI18n } from "@/lib/i18n/context";
import { Language } from "@/lib/i18n/translations";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "sv", label: "Svenska", flag: "🇸🇪" },
    { code: "en", label: "English", flag: "🇬🇧" },
  ];

  const fallbackLang = languages[0];
  const currentLang = languages.find((l) => l.code === language) ?? fallbackLang ?? { code: "sv" as Language, label: "Svenska", flag: "🇸🇪" };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 0.75rem",
          borderRadius: "6px",
          border: "1px solid var(--pa-border)",
          background: "white",
          cursor: "pointer",
          fontSize: "0.875rem",
        }}
      >
        <Globe style={{ width: 16, height: 16 }} />
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "0.5rem",
            background: "white",
            border: "1px solid var(--pa-border)",
            borderRadius: "6px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            zIndex: 1000,
            minWidth: 150,
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "0.75rem 1rem",
                border: "none",
                background: language === lang.code ? "var(--pa-gray-bg)" : "white",
                cursor: "pointer",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
