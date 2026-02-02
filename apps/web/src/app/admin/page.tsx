"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminOverviewPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/customers");
  }, [router]);
  return (
    <div style={{ padding: "2rem" }}>
      <p>Redirecting...</p>
    </div>
  );
}
