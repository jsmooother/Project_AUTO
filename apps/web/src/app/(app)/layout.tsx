"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n/context";
import { useOnboardingStatus } from "@/lib/onboarding/useOnboardingStatus";
import { LayoutDashboard, Package, Play, DollarSign, LayoutTemplate, Settings as SettingsIcon, ChevronDown, Megaphone, BarChart3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const ONBOARDING_COMPLETE_KEY = "onboardingComplete";

const NAV_LINKS = [
  { href: "/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/inventory", key: "inventory" as const, icon: Package },
  { href: "/automation", key: "automation" as const, icon: Play },
  { href: "/templates", key: "templates" as const, icon: LayoutTemplate },
  { href: "/ads", key: "ads" as const, icon: Megaphone },
  { href: "/performance", key: "performance" as const, icon: BarChart3 },
  { href: "/billing", key: "billing" as const, icon: DollarSign },
  { href: "/settings", key: "settings" as const, icon: SettingsIcon },
];

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const { auth, clearAuth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const customerId = auth.status === "authenticated" ? auth.user?.customerId ?? null : null;
  const { result: onboardingResult, loading: onboardingLoading } = useOnboardingStatus(customerId);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (auth.status === "loading") {
    return <LoadingSpinner />;
  }
  if (auth.status === "unauthenticated") {
    if (typeof window !== "undefined") router.replace("/login");
    return <LoadingSpinner />;
  }

  const isOnboardingPath = pathname?.startsWith("/onboarding") ?? false;
  const isSettingsPath = pathname === "/settings";
  const onboardingCompleteFromStorage =
    typeof window !== "undefined" && window.localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
  const onboardingComplete = onboardingResult?.overallComplete ?? onboardingCompleteFromStorage;

  if (isOnboardingPath) {
    return <div style={{ minHeight: "100vh", background: "var(--pa-gray-bg)" }}>{children}</div>;
  }

  if (onboardingLoading && !onboardingCompleteFromStorage) {
    return <LoadingSpinner />;
  }
  if (!onboardingComplete && !isSettingsPath) {
    if (typeof window !== "undefined") router.replace("/onboarding/start");
    return <LoadingSpinner />;
  }

  if (onboardingResult?.overallComplete && typeof window !== "undefined") {
    window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
  }

  const user = auth.user;
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "?";

  const handleLogout = async () => {
    await apiPost("/auth/logout");
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
  };

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div style={{ minHeight: "100vh", background: "var(--pa-gray-bg)" }}>
      {/* Top nav */}
      <header
        style={{
          background: "white",
          borderBottom: "1px solid var(--pa-border)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 1.5rem",
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <Link
              href="/dashboard"
              prefetch={false}
              style={{
                fontWeight: 600,
                fontSize: "1.25rem",
                letterSpacing: "-0.025em",
                color: "var(--pa-dark)",
                textDecoration: "none",
              }}
            >
              Project Auto
            </Link>

            <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
              {NAV_LINKS.map(({ href, key, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    prefetch={false}
                    className="btn-style"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.5rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: active ? "var(--pa-dark)" : "var(--pa-gray)",
                      background: active ? "var(--pa-gray-bg)" : "transparent",
                      textDecoration: "none",
                    }}
                  >
                    <Icon style={{ width: 16, height: 16 }} />
                    {t.nav[key]}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <LanguageSwitcher />
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.25rem 0.5rem",
                  border: "none",
                  background: "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  color: "var(--pa-dark)",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "#e5e7eb",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {initials}
                </div>
                <ChevronDown style={{ width: 16, height: 16, color: "var(--pa-gray)" }} />
              </button>

              {showUserMenu && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 4,
                    minWidth: 180,
                    background: "white",
                    border: "1px solid var(--pa-border)",
                    borderRadius: "6px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    padding: "0.25rem",
                    zIndex: 100,
                  }}
                >
                  <div style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                    {user?.email}
                  </div>
                  <div style={{ borderTop: "1px solid var(--pa-border)", margin: "0.25rem 0" }} />
                  <Link
                    href="/settings"
                    prefetch={false}
                    style={{
                      display: "block",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.875rem",
                      color: "var(--pa-dark)",
                      textDecoration: "none",
                    }}
                  >
                    {t.nav.settings}
                  </Link>
                  <Link
                    href="/billing"
                    prefetch={false}
                    style={{
                      display: "block",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.875rem",
                      color: "var(--pa-dark)",
                      textDecoration: "none",
                    }}
                  >
                    {t.nav.billing}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.875rem",
                      textAlign: "left",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      color: "var(--pa-dark)",
                    }}
                  >
                    {t.common.logout}
                  </button>
                </div>
              )}
            </div>

            {process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true" && (
              <Link
                href="/admin/customers"
                prefetch={false}
                style={{ fontSize: "0.8rem", color: "var(--pa-gray)", marginLeft: "0.5rem" }}
              >
                Admin →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>{children}</main>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
