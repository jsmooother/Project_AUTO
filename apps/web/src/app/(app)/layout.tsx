"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/inventory", label: "Inventory" },
  { href: "/runs", label: "Automation" },
  { href: "/templates", label: "Templates" },
  { href: "/billing", label: "Billing" },
  { href: "/settings", label: "Settings" },
];

type StatusPills = {
  website: "connected" | "not_connected";
  meta: "not_connected";
  templates: "approved" | "preview_ready" | "draft" | "not_configured";
  automation: "ready" | "not_ready";
};

function StatusPillsRow({ pills }: { pills: StatusPills }) {
  const pillStyle = (active: boolean) => ({
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.8rem",
    fontWeight: 500,
    background: active ? "#d4edda" : "#f0f0f0",
    color: active ? "#155724" : "#666",
    border: `1px solid ${active ? "#c3e6cb" : "#ddd"}`,
  });

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <span style={pillStyle(pills.website === "connected")}>
        Website {pills.website === "connected" ? "✓" : "—"}
      </span>
      <span style={pillStyle(false)}>
        Meta — (placeholder)
      </span>
      <span
        style={pillStyle(
          pills.templates === "approved" || pills.templates === "preview_ready"
        )}
      >
        Templates {pills.templates === "approved" ? "✓" : pills.templates === "preview_ready" ? "…" : "—"}
      </span>
      <span style={pillStyle(pills.automation === "ready")}>
        Automation {pills.automation === "ready" ? "✓" : "—"}
      </span>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pills, setPills] = useState<StatusPills | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (auth.status !== "authenticated" || !auth.user) return;
    const cid = auth.user.customerId;
    Promise.all([
      apiGet<{ source?: { websiteUrl: string } }>("/inventory/items", {
        customerId: cid,
      }),
      apiGet<{ status?: string } | null>("/templates/config", {
        customerId: cid,
      }),
    ]).then(([inv, cfg]) => {
      const website =
        inv.ok && inv.data.source ? "connected" : "not_connected";
      const templates = !cfg?.ok || !cfg.data
        ? "not_configured"
        : (cfg.data.status as StatusPills["templates"]) ?? "not_configured";
      const automation = website === "connected" ? "ready" : "not_ready";
      setPills({
        website,
        meta: "not_connected",
        templates:
          templates === "approved" ||
          templates === "preview_ready" ||
          templates === "draft"
            ? templates
            : "not_configured",
        automation,
      });
    });
  }, [auth.status, auth.status === "authenticated" ? auth.user?.customerId : null]);

  useEffect(() => {
    setShowAdmin(process.env.NEXT_PUBLIC_SHOW_ADMIN_LINK === "true");
  }, []);

  if (auth.status === "loading") {
    return <LoadingSpinner />;
  }
  if (auth.status === "unauthenticated") {
    if (typeof window !== "undefined") {
      router.replace("/login");
    }
    return <LoadingSpinner />;
  }

  const user = auth.user;

  const handleLogout = async () => {
    await apiPost("/auth/logout");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafafa" }}>
      {/* Top bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <Link
            href="/dashboard"
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "#111",
              textDecoration: "none",
            }}
          >
            Project Auto
          </Link>
          {pills && <StatusPillsRow pills={pills} />}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.9rem", color: "#666" }}>{user.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: "0.4rem 0.8rem",
              background: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Log out
          </button>
          {showAdmin && (
            <Link
              href="/admin/customers"
              style={{
                fontSize: "0.85rem",
                color: "#999",
                textDecoration: "none",
              }}
            >
              Admin →
            </Link>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 56,
          left: 0,
          width: 200,
          height: "calc(100vh - 56px)",
          background: "#fff",
          borderRight: "1px solid #e0e0e0",
          padding: "1rem 0",
          zIndex: 99,
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.65rem 1rem",
                  color: isActive ? "#0070f3" : "#444",
                  background: isActive ? "#e8f4fd" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? "3px solid #0070f3" : "3px solid transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          marginLeft: 200,
          marginTop: 56,
          padding: "2rem",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
