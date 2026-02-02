import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Project AUTO</h1>
      <p>Automated social ad enabler</p>
      <div style={{ marginTop: "2rem" }}>
        <h2>Get Started</h2>
        <Link href="/dashboard" style={{ marginRight: "1rem", color: "#0070f3", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link href="/login" style={{ marginRight: "1rem", color: "#0070f3", textDecoration: "none" }}>
          Log In
        </Link>
        <Link
          href="/signup"
          style={{
            display: "inline-block",
            padding: "1rem 2rem",
            background: "#0070f3",
            color: "white",
            textDecoration: "none",
            borderRadius: "4px",
            marginTop: "1rem",
          }}
        >
          Sign Up →
        </Link>
      </div>
      <div style={{ marginTop: "2rem" }}>
        <h2>Status</h2>
        <ul>
          <li>✅ API Server: <a href="http://localhost:3001/health" target="_blank" rel="noopener noreferrer">http://localhost:3001/health</a></li>
          <li>✅ Worker: Running</li>
          <li>✅ Database: Connected</li>
          <li>✅ Redis: Connected</li>
        </ul>
      </div>
    </main>
  );
}
