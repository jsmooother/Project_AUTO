"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SIDEBAR_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/inventory-sources", label: "Inventory Sources" },
  { href: "/admin/runs", label: "Runs & Automations" },
  { href: "/admin/billing", label: "Billing & Payments" },
  { href: "/admin/system-config", label: "System Config" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Top bar */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          background: "#2d2d2d",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>Project Auto</span>
          <span
            style={{
              background: "#e53935",
              color: "#fff",
              padding: "0.2rem 0.5rem",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            ADMIN
          </span>
          <span style={{ color: "#9e9e9e", fontSize: "0.95rem" }}>
            Internal Dashboard
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.9rem", color: "#e0e0e0" }}>
            admin@projectauto.com
          </span>
          <Link
            href="/dashboard"
            style={{
              fontSize: "0.9rem",
              color: "#90caf9",
              textDecoration: "none",
            }}
          >
            Exit Admin
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        style={{
          position: "fixed",
          top: 56,
          left: 0,
          width: 220,
          height: "calc(100vh - 56px)",
          background: "#37474f",
          padding: "1rem 0",
          zIndex: 99,
        }}
      >
        <nav style={{ display: "flex", flexDirection: "column" }}>
          {SIDEBAR_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.75rem 1.25rem",
                  color: isActive ? "#fff" : "#b0bec5",
                  background: isActive ? "#455a64" : "transparent",
                  textDecoration: "none",
                  fontSize: "0.95rem",
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
          marginLeft: 220,
          marginTop: 56,
          padding: "2rem",
          background: "#fff",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {children}
      </main>
    </div>
  );
}
