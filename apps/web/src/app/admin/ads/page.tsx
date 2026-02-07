"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getAdminHeaders } from "../../../lib/adminHeaders";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Megaphone,
  TrendingUp,
  DollarSign,
  Eye,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// Meta icon component
function MetaIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor" style={{ width: "1.25rem", height: "1.25rem", ...style }}>
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z" />
    </svg>
  );
}

interface Campaign {
  id: string;
  customer_id: string;
  customer_name: string;
  status: "active" | "paused" | "failed" | "pending";
  budget_monthly: number;
  spend_current: number;
  currency: string;
  catalog_items: number;
  last_sync: string;
  campaign_id: string;
  formats: string[];
  geo_targeting: string;
  template: string;
}

interface MetaConnection {
  customer_id: string;
  customer_name: string;
  business_id: string;
  ad_account_id: string;
  connection_status: "connected" | "error";
  token_expires: string;
  api_version: string;
}

interface AdsData {
  campaigns: Campaign[];
  metaConnections: MetaConnection[];
  summary: {
    activeCampaigns: number;
    failedCampaigns: number;
    totalBudget: number;
    totalSpend: number;
    totalCampaigns: number;
  };
}

type TabId = "overview" | "meta" | "spend";

export default function AdminAdsPage() {
  const [data, setData] = useState<AdsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const load = useCallback(() => {
    fetch(`${apiUrl}/admin/ads`, { headers: getAdminHeaders() })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load ads data");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Ads</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Ad platform management</p>
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Ads</h1>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Ad platform management</p>
        </div>
        <div style={{ padding: "1rem", background: "#fee", color: "#c00", borderRadius: "4px" }}>
          {error ?? "Failed to load ads data"}
        </div>
      </div>
    );
  }

  const { campaigns, metaConnections, summary } = data;

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              background: "#10b981",
              color: "white",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <CheckCircle2 size={12} />
            Active
          </span>
        );
      case "paused":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              background: "#f59e0b",
              color: "white",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <PauseCircle size={12} />
            Paused
          </span>
        );
      case "failed":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              background: "#dc2626",
              color: "white",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <XCircle size={12} />
            Failed
          </span>
        );
      case "pending":
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              border: "1px solid #ccc",
              borderRadius: 4,
              fontSize: "0.75rem",
              fontWeight: 500,
            }}
          >
            <AlertTriangle size={12} />
            Pending
          </span>
        );
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.campaign_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: 1600, margin: "0 auto", padding: "1.5rem" }}>
      {/* Page Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.25rem" }}>Ads</h1>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Ad platform management</p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#666", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Megaphone size={16} />
              Active Campaigns
            </div>
          </div>
          <div style={{ padding: "1rem" }}>
            <div style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>{summary.activeCampaigns}</div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>of {summary.totalCampaigns} total</div>
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#666", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <DollarSign size={16} />
              Total Monthly Budget
            </div>
          </div>
          <div style={{ padding: "1rem" }}>
            <div style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              {summary.totalBudget.toLocaleString()} SEK
            </div>
            <div style={{ fontSize: "0.75rem", color: "#666" }}>Across all customers</div>
          </div>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#666", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <TrendingUp size={16} />
              Current Spend
            </div>
          </div>
          <div style={{ padding: "1rem" }}>
            <div style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              {summary.totalSpend.toLocaleString()} SEK
            </div>
            <div style={{ fontSize: "0.75rem", color: summary.totalBudget > 0 ? "#10b981" : "#666" }}>
              {summary.totalBudget > 0 ? Math.round((summary.totalSpend / summary.totalBudget) * 100) : 0}% of budget
            </div>
          </div>
        </div>

        <div
          style={{
            border: summary.failedCampaigns > 0 ? "1px solid #fecaca" : "1px solid #e5e7eb",
            borderRadius: 8,
            overflow: "hidden",
            background: summary.failedCampaigns > 0 ? "#fef2f2" : "white",
          }}
        >
          <div style={{ padding: "0.75rem 1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#666", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <XCircle size={16} />
              Failed Campaigns
            </div>
          </div>
          <div style={{ padding: "1rem" }}>
            <div style={{ fontSize: "1.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>{summary.failedCampaigns}</div>
            <div style={{ fontSize: "0.75rem", color: summary.failedCampaigns > 0 ? "#dc2626" : "#666" }}>Needs attention</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: "1.5rem" }}>
        <div style={{ padding: "1.5rem 1rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <input
              type="search"
              placeholder="Search by customer or campaign ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2.25rem",
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                fontSize: "0.875rem",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.5rem 0.75rem",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              fontSize: "0.875rem",
              minWidth: 160,
              background: "white",
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <button
            onClick={load}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "white",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={16} />
            Refresh All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", borderBottom: "1px solid #e5e7eb" }}>
        {[
          { id: "overview" as TabId, label: "Campaign Overview" },
          { id: "meta" as TabId, label: "Meta Connections" },
          { id: "spend" as TabId, label: "Spend Analysis" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: "transparent",
              color: tab === t.id ? "#37474f" : "#666",
              cursor: "pointer",
              borderBottom: tab === t.id ? "2px solid #37474f" : "2px solid transparent",
              marginBottom: -1,
              fontSize: "0.875rem",
              fontWeight: tab === t.id ? 500 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Campaign Overview Tab */}
      {tab === "overview" && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>All Campaigns</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Budget / Spend</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Catalog</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Formats</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Template</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Last Sync</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                      No campaigns found
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>{campaign.customer_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#666", fontFamily: "monospace" }}>{campaign.customer_id}</div>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>{getStatusBadge(campaign.status)}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "0.875rem" }}>
                            {campaign.spend_current.toLocaleString()} / {campaign.budget_monthly.toLocaleString()} {campaign.currency}
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "#666" }}>
                            {campaign.budget_monthly > 0 ? Math.round((campaign.spend_current / campaign.budget_monthly) * 100) : 0}% used
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.875rem" }}>{campaign.catalog_items} items</div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                          {campaign.formats.map((format) => (
                            <span
                              key={format}
                              style={{
                                padding: "0.125rem 0.5rem",
                                border: "1px solid #e5e7eb",
                                borderRadius: 4,
                                fontSize: "0.75rem",
                              }}
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span
                          style={{
                            padding: "0.125rem 0.5rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                          }}
                        >
                          {campaign.template}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#666" }}>{campaign.last_sync}</td>
                      <td style={{ padding: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          <Link href={`/admin/customers/${campaign.customer_id}`}>
                            <button
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              title="View customer"
                            >
                              <Eye size={16} />
                            </button>
                          </Link>
                          {campaign.status === "active" && (
                            <button
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              title="Pause campaign"
                            >
                              <PauseCircle size={16} />
                            </button>
                          )}
                          {campaign.status === "paused" && (
                            <button
                              style={{
                                padding: "0.25rem",
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                              }}
                              title="Resume campaign"
                            >
                              <PlayCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meta Connections Tab */}
      {tab === "meta" && (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#dbeafe",
                  }}
                >
                  <MetaIcon style={{ color: "#3b82f6" }} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Meta Business Connections</h2>
                  <p style={{ fontSize: "0.875rem", color: "#666", marginTop: "0.25rem" }}>OAuth connections to customer Meta Business accounts</p>
                </div>
              </div>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e5e7eb", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Business ID</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Ad Account</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Connection Status</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>Token Expires</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}>API Version</th>
                  <th style={{ padding: "0.75rem", fontSize: "0.875rem", fontWeight: 600 }}></th>
                </tr>
              </thead>
              <tbody>
                {metaConnections.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
                      No Meta connections found
                    </td>
                  </tr>
                ) : (
                  metaConnections.map((conn) => (
                    <tr key={conn.customer_id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "0.75rem", fontWeight: 500 }}>{conn.customer_name}</td>
                      <td style={{ padding: "0.75rem", fontFamily: "monospace", fontSize: "0.75rem" }}>{conn.business_id}</td>
                      <td style={{ padding: "0.75rem", fontFamily: "monospace", fontSize: "0.75rem" }}>{conn.ad_account_id}</td>
                      <td style={{ padding: "0.75rem" }}>
                        {conn.connection_status === "error" ? (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.25rem 0.5rem",
                              background: "#dc2626",
                              color: "white",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            <XCircle size={12} />
                            Connection Error
                          </span>
                        ) : (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.25rem 0.5rem",
                              background: "#10b981",
                              color: "white",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                            }}
                          >
                            <CheckCircle2 size={12} />
                            Connected
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: conn.token_expires === "Expired" ? "#dc2626" : "#666" }}>
                        {conn.token_expires}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span
                          style={{
                            padding: "0.125rem 0.5rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                          }}
                        >
                          {conn.api_version}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer">
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.5rem",
                              border: "1px solid #e5e7eb",
                              borderRadius: 6,
                              background: "white",
                              fontSize: "0.875rem",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            <ExternalLink size={14} />
                            Meta
                          </button>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spend Analysis Tab */}
      {tab === "spend" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Spend by Customer</h2>
            </div>
            <div style={{ padding: "1rem 1.5rem" }}>
              {campaigns
                .filter((c) => c.spend_current > 0)
                .sort((a, b) => b.spend_current - a.spend_current)
                .length === 0 ? (
                <p style={{ color: "#666", textAlign: "center", padding: "2rem" }}>No spend data available</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {campaigns
                    .filter((c) => c.spend_current > 0)
                    .sort((a, b) => b.spend_current - a.spend_current)
                    .map((campaign) => (
                      <div key={campaign.id}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{campaign.customer_name}</span>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                            {campaign.spend_current.toLocaleString()} {campaign.currency}
                          </span>
                        </div>
                        <div style={{ width: "100%", background: "#e5e7eb", borderRadius: 999, height: 8 }}>
                          <div
                            style={{
                              background: "#3b82f6",
                              height: 8,
                              borderRadius: 999,
                              width: `${campaign.budget_monthly > 0 ? Math.min((campaign.spend_current / campaign.budget_monthly) * 100, 100) : 0}%`,
                            }}
                          />
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.25rem" }}>
                          {campaign.budget_monthly > 0 ? Math.round((campaign.spend_current / campaign.budget_monthly) * 100) : 0}% of{" "}
                          {campaign.budget_monthly.toLocaleString()} {campaign.currency} budget
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Budget Utilization</h2>
            </div>
            <div style={{ padding: "1rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Total Allocated Budget</div>
                <div style={{ fontSize: "1.875rem", fontWeight: 700 }}>{summary.totalBudget.toLocaleString()} SEK</div>
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Total Current Spend</div>
                <div style={{ fontSize: "1.875rem", fontWeight: 700, color: "#3b82f6" }}>{summary.totalSpend.toLocaleString()} SEK</div>
              </div>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Overall Utilization</div>
                <div style={{ width: "100%", background: "#e5e7eb", borderRadius: 999, height: 16, marginBottom: "0.5rem" }}>
                  <div
                    style={{
                      background: "#10b981",
                      height: 16,
                      borderRadius: 999,
                      width: `${summary.totalBudget > 0 ? Math.min((summary.totalSpend / summary.totalBudget) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700 }}>
                  {summary.totalBudget > 0 ? Math.round((summary.totalSpend / summary.totalBudget) * 100) : 0}%
                </div>
              </div>
              <div style={{ paddingTop: "1rem", borderTop: "1px solid #e5e7eb" }}>
                <div style={{ fontSize: "0.875rem", color: "#666", marginBottom: "0.5rem" }}>Remaining Budget</div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#374151" }}>
                  {(summary.totalBudget - summary.totalSpend).toLocaleString()} SEK
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
