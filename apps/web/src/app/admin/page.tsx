"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getAdminHeaders } from "../../lib/adminHeaders";
import { Megaphone, TrendingUp, DollarSign, Users } from "lucide-react";

interface OverviewData {
  customers: {
    total: number;
    active: number;
  };
  ads: {
    activeCampaigns: number;
    totalSpend: number;
    totalBudget: number;
    customersUsingAds: number;
  };
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const load = useCallback(() => {
    Promise.all([
      fetch(`${apiUrl}/admin/customers`, { headers: getAdminHeaders() }).then((res) => res.json()),
      fetch(`${apiUrl}/admin/ads`, { headers: getAdminHeaders() }).then((res) => res.json()),
    ])
      .then(([customersRes, adsRes]) => {
        const customers = customersRes.data ?? [];
        const ads = adsRes.summary ?? { activeCampaigns: 0, totalSpend: 0, totalBudget: 0, totalCampaigns: 0 };

        setData({
          customers: {
            total: customers.length,
            active: customers.filter((c: { status: string }) => c.status === "active").length,
          },
          ads: {
            activeCampaigns: ads.activeCampaigns ?? 0,
            totalSpend: ads.totalSpend ?? 0,
            totalBudget: ads.totalBudget ?? 0,
            customersUsingAds: ads.totalCampaigns ?? 0,
          },
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <h1 style={{ marginBottom: "1rem" }}>Admin Overview</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <h1 style={{ marginBottom: "1rem" }}>Admin Overview</h1>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error ?? "Failed to load overview data"}
        </div>
      </div>
    );
  }

  const adsPercentage = data.customers.total > 0 ? Math.round((data.ads.customersUsingAds / data.customers.total) * 100) : 0;
  const spendGrowth = data.ads.totalBudget > 0 ? Math.round((data.ads.totalSpend / data.ads.totalBudget) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>Admin Overview</h1>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={16} />
            Total Customers
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{data.customers.total}</div>
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
            {data.customers.active} active
          </div>
        </div>

        <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Megaphone size={16} />
            Active Ad Campaigns
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{data.ads.activeCampaigns}</div>
          <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
            {adsPercentage}% of customers
          </div>
        </div>

        <div style={{ padding: "1rem", border: "1px solid #e5e7eb", borderRadius: 8 }}>
          <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <TrendingUp size={16} />
            Total Ad Spend (MTD)
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{data.ads.totalSpend.toLocaleString()} SEK</div>
          <div style={{ fontSize: "0.75rem", color: spendGrowth > 0 ? "#10b981" : "#666", marginTop: "0.25rem" }}>
            {spendGrowth > 0 ? `+${spendGrowth}%` : "0%"} growth
          </div>
        </div>
      </div>

      {/* Ad Spend Section */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1.5rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>Ad Spend (MTD)</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Total Meta Spend</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{data.ads.totalSpend.toLocaleString()} SEK</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Project Auto Fees</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>—</div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Not implemented</div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Average Spend per Customer</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              {data.ads.customersUsingAds > 0
                ? Math.round(data.ads.totalSpend / data.ads.customersUsingAds).toLocaleString()
                : 0}{" "}
              SEK
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Projected Month-End Total</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              {Math.round(data.ads.totalSpend * 1.2).toLocaleString()} SEK
            </div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Estimated</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>Quick Links</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <Link
            href="/admin/customers"
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "white",
              textDecoration: "none",
              color: "#374151",
              fontWeight: 500,
            }}
          >
            View All Customers
          </Link>
          <Link
            href="/admin/ads"
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "white",
              textDecoration: "none",
              color: "#374151",
              fontWeight: 500,
            }}
          >
            View Ads & Campaigns
          </Link>
          <Link
            href="/admin/runs"
            style={{
              padding: "0.75rem 1.5rem",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "white",
              textDecoration: "none",
              color: "#374151",
              fontWeight: 500,
            }}
          >
            View Runs & Automations
          </Link>
        </div>
      </div>
    </div>
  );
}
