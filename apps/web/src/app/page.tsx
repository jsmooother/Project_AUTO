import Link from "next/link";
import { ArrowRight, Globe, Zap, BarChart3, RefreshCw, Play } from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "white" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--pa-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1rem 1.5rem",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Link href="/" style={{ fontWeight: 600, fontSize: "1.25rem", letterSpacing: "-0.025em", color: "var(--pa-dark)" }}>
          Project Auto
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link href="/login" style={{ color: "var(--pa-gray)", fontSize: "0.875rem" }}>
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-style"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.5rem 1rem",
              background: "var(--pa-dark)",
              color: "var(--pa-white)",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            Get started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: "6rem 1.5rem 6rem",
          maxWidth: 768,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3rem)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: 1.2,
            marginBottom: "1.5rem",
            color: "var(--pa-dark)",
          }}
        >
          Smarter ads. Zero busywork.
        </h1>
        <p
          style={{
            fontSize: "1.25rem",
            color: "var(--pa-gray)",
            lineHeight: 1.6,
            marginBottom: "2rem",
          }}
        >
          Connect your website inventory, choose templates, set budget — we keep ads updated with
          new and removed listings automatically.
        </p>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            className="btn-style"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.625rem 1.5rem",
              background: "var(--pa-dark)",
              color: "var(--pa-white)",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "1rem",
            }}
          >
            Get started
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            href="/login"
            className="btn-style"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "0.625rem 1.5rem",
              border: "1px solid var(--pa-border)",
              color: "var(--pa-dark)",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "1rem",
              background: "white",
            }}
          >
            Book demo
          </Link>
        </div>

        {/* Trusted by */}
        <div style={{ marginTop: "4rem", paddingTop: "4rem", borderTop: "1px solid var(--pa-border)" }}>
          <p style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "1.5rem" }}>
            Trusted by industry leaders
          </p>
          <div style={{ display: "flex", gap: "3rem", opacity: 0.4 }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{ width: 96, height: 32, background: "#d1d5db", borderRadius: 4 }}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "6rem 1.5rem", background: "var(--pa-gray-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginBottom: "1rem",
                color: "var(--pa-dark)",
              }}
            >
              How it works
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--pa-gray)" }}>
              Three simple steps to automated ads
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              { Icon: Globe, step: "Step 1", title: "Connect your website URL", desc: "We automatically discover and track your inventory — vehicles, jobs, or any listing." },
              { Icon: Zap, step: "Step 2", title: "Connect ad accounts", desc: "Link Meta, X, and LinkedIn accounts. Choose templates and set brand settings." },
              { Icon: Play, step: "Step 3", title: "Set rules + budget", desc: "Ads run continuously and update automatically when inventory changes." },
            ].map(({ Icon, step, title, desc }) => (
              <div
                key={title}
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "var(--pa-radius-lg)",
                  border: "2px solid var(--pa-border)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#dbeafe",
                    borderRadius: "var(--pa-radius)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Icon style={{ width: 24, height: 24, color: "#2563eb" }} />
                </div>
                <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)", marginBottom: "0.5rem" }}>{step}</div>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "1.125rem" }}>{title}</h3>
                <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem", lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features: Automation + transparency + control */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginBottom: "1rem",
                color: "var(--pa-dark)",
              }}
            >
              Automation + transparency + control
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--pa-gray)" }}>
              Not a black box. You see everything and stay in control.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              { Icon: Zap, bg: "#d1fae5", color: "#059669", title: "Create", desc: "Choose from templates, customize brand settings, and preview ads before launch.", bullets: ["Template library", "Brand customization", "Live previews"] },
              { Icon: RefreshCw, bg: "#dbeafe", color: "#2563eb", title: "Automate", desc: "Always-on campaigns sync nightly. On-demand campaigns run when you need them.", bullets: ["Always-on mode", "On-demand runs", "Inventory tracking"] },
              { Icon: BarChart3, bg: "#ede9fe", color: "#7c3aed", title: "Analyze", desc: "Complete visibility into runs, logs, and performance. Full run history and reproducibility.", bullets: ["Performance reporting", "Run logs & history", "Confidence scores"] },
            ].map(({ Icon, bg, color, title, desc, bullets }) => (
              <div
                key={title}
                style={{
                  background: "white",
                  padding: "1.5rem",
                  borderRadius: "var(--pa-radius-lg)",
                  border: "1px solid var(--pa-border)",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: bg,
                    borderRadius: "var(--pa-radius)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <Icon style={{ width: 24, height: 24, color }} />
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "1.125rem" }}>{title}</h3>
                <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1rem" }}>{desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {bullets.map((b) => (
                    <li key={b} style={{ fontSize: "0.875rem", color: "var(--pa-gray)", marginBottom: "0.25rem" }}>
                      • {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Always On vs On Demand */}
      <section style={{ padding: "6rem 1.5rem", background: "var(--pa-gray-bg)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                marginBottom: "1rem",
                color: "var(--pa-dark)",
              }}
            >
              Always On vs On Demand
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--pa-gray)" }}>
              Two modes. One platform. Total control.
            </p>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "2rem",
              maxWidth: 896,
            }}
          >
            <div
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "var(--pa-radius-lg)",
                border: "2px solid var(--pa-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <RefreshCw style={{ width: 20, height: 20, color: "#2563eb" }} />
                <h3 style={{ fontWeight: 600, fontSize: "1.25rem" }}>Always On</h3>
              </div>
              <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                Set it and forget it. Ads sync nightly and update automatically as your inventory
                changes.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                {["Scheduled syncs (nightly default)", "Automatic new listing detection", "Automatic removed listing cleanup", "Budget managed automatically"].map((item) => (
                  <li key={item} style={{ marginBottom: "0.5rem" }}>✓ {item}</li>
                ))}
              </ul>
            </div>
            <div
              style={{
                background: "white",
                padding: "1.5rem",
                borderRadius: "var(--pa-radius-lg)",
                border: "2px solid var(--pa-border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                <Play style={{ width: 20, height: 20, color: "#059669" }} />
                <h3 style={{ fontWeight: 600, fontSize: "1.25rem" }}>On Demand</h3>
              </div>
              <p style={{ color: "var(--pa-gray)", fontSize: "0.95rem", lineHeight: 1.5, marginBottom: "1rem" }}>
                Run campaigns when you need them. Perfect for special promotions or testing.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                {["Manual trigger anytime", "Preview before launch", "Budget per campaign", "Full run history"].map((item) => (
                  <li key={item} style={{ marginBottom: "0.5rem" }}>✓ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - contained rounded box */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              background: "#111827",
              borderRadius: 16,
              padding: "4rem 4rem",
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 600,
                letterSpacing: "-0.025em",
                color: "white",
                marginBottom: "1rem",
              }}
            >
              Ready to automate your ads?
            </h2>
            <p style={{ fontSize: "1.125rem", color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>
              Start free. No credit card required.
            </p>
            <Link
              href="/signup"
              className="btn-style"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.625rem 1.5rem",
                background: "white",
                color: "var(--pa-dark)",
                borderRadius: "6px",
                fontWeight: 500,
                fontSize: "1rem",
              }}
            >
              Get started
              <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--pa-border)", padding: "3rem 1.5rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "2rem",
              marginBottom: "3rem",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Product</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Features", "Pricing", "Documentation", "API"].map((l) => (
                  <li key={l}>
                    <Link href="#" style={{ color: "var(--pa-gray)", fontSize: "0.875rem" }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Company</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["About", "Blog", "Careers", "Contact"].map((l) => (
                  <li key={l}>
                    <Link href="#" style={{ color: "var(--pa-gray)", fontSize: "0.875rem" }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Resources</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Help Center", "Community", "Partners", "Status"].map((l) => (
                  <li key={l}>
                    <Link href="#" style={{ color: "var(--pa-gray)", fontSize: "0.875rem" }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.95rem" }}>Legal</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Privacy", "Terms", "Security"].map((l) => (
                  <li key={l}>
                    <Link href="#" style={{ color: "var(--pa-gray)", fontSize: "0.875rem" }}>{l}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ paddingTop: "2rem", borderTop: "1px solid var(--pa-border)", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
            © 2026 Project Auto. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
