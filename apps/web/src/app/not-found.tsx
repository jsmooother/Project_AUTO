import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
      <h1>404</h1>
      <p>Page not found.</p>
      <Link href="/" style={{ color: "#0070f3", textDecoration: "none" }}>
        Go home
      </Link>
    </main>
  );
}
