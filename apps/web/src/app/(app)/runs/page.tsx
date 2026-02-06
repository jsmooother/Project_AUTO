"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Play } from "lucide-react";

interface Run {
  id: string;
  type: "crawl" | "preview";
  trigger: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

function RunsContent() {
  const { auth } = useAuth();
  const searchParams = useSearchParams();
  const runType = searchParams.get("type") === "preview" ? "preview" : "crawl";
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasSource, setHasSource] = useState(false);
  const [runNowLoading, setRunNowLoading] = useState(false);
  const [runNowError, setRunNowError] = useState<string | null>(null);
  const [runNowHint, setRunNowHint] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  const load = useCallback(() => {
    if (!customerId) return;
    setLoading(true);
    Promise.all([
      apiGet<{ data: Run[] }>(`/runs?type=${runType}&limit=50`, { customerId }),
      runType === "crawl" ? apiGet<{ source?: unknown }>("/inventory/items", { customerId }) : Promise.resolve(null),
    ])
      .then(([runsRes, invRes]) => {
        if (runsRes.ok) setRuns(runsRes.data.data ?? []);
        else setError(runsRes.error);
        if (invRes?.ok) setHasSource(!!invRes.data.source);
      })
      .catch(() => setError("Failed to load runs"))
      .finally(() => setLoading(false));
  }, [customerId, runType]);

  useEffect(() => {
    if (customerId) load();
  }, [customerId, load]);

  const hasActiveRuns = runs.some((r) => r.status === "queued" || r.status === "running");
  const QUEUED_TIMEOUT_MS = 5 * 60 * 1000;
  const staleQueued = runs.find(
    (r) => r.status === "queued" && Date.now() - new Date(r.createdAt).getTime() > QUEUED_TIMEOUT_MS
  );

  useEffect(() => {
    if (!customerId || !hasActiveRuns) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [customerId, hasActiveRuns, load]);

  const handleRunNow = async () => {
    if (!customerId) return;
    setRunNowError(null);
    setRunNowHint(null);
    setRunNowLoading(true);
    const res = await apiPost<{ runId: string }>("/runs/crawl", undefined, { customerId });
    setRunNowLoading(false);
    if (res.ok) load();
    else {
      setRunNowError(res.error);
      setRunNowHint(res.errorDetail?.hint ?? null);
    }
  };

  if (auth.status !== "authenticated") return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;

  const statusStyle = (status: string) => {
    if (status === "success") return { bg: "#d1fae5", color: "#065f46", border: "#a7f3d0" };
    if (status === "failed") return { bg: "#fee2e2", color: "#991b1b", border: "#fecaca" };
    if (status === "running" || status === "queued") return { bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
    return { bg: "#f3f4f6", color: "var(--pa-gray)", border: "var(--pa-border)" };
  };

  return (
    <div style={{ maxWidth: 1280 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: 600,
              letterSpacing: "-0.025em",
              marginBottom: "0.5rem",
              color: "var(--pa-dark)",
            }}
          >
            Automation
          </h1>
          <p style={{ fontSize: "1rem", color: "var(--pa-gray)" }}>
            View all probe and sync run history
          </p>
        </div>
        {runType === "crawl" && hasSource && (
          <button
            type="button"
            onClick={handleRunNow}
            disabled={runNowLoading}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: runNowLoading ? "#d1d5db" : "var(--pa-dark)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: 500,
              fontSize: "0.875rem",
              cursor: runNowLoading ? "not-allowed" : "pointer",
            }}
          >
            <Play style={{ width: 16, height: 16 }} />
            {runNowLoading ? "Starting…" : "Run now"}
          </button>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}
      {runNowError && <ErrorBanner message={runNowError} hint={runNowHint ?? undefined} />}

      {staleQueued && (
        <div
          style={{
            padding: "1rem",
            background: "#fef3c7",
            border: "1px solid #fcd34d",
            borderRadius: "var(--pa-radius)",
            marginBottom: "1rem",
          }}
        >
          <strong>Worker may be offline.</strong> A run has been queued for over 5 minutes. Check that the worker is running and Redis is available.
        </div>
      )}

      {hasActiveRuns && !staleQueued && (
        <p style={{ marginBottom: "1rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
          Polling for updates… (runs in progress)
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
        }}
      >
        <Link
          href="/runs?type=crawl"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 500,
            background: runType === "crawl" ? "var(--pa-gray-bg)" : "white",
            border: "1px solid var(--pa-border)",
            color: runType === "crawl" ? "var(--pa-dark)" : "var(--pa-gray)",
            textDecoration: "none",
          }}
        >
          Crawl runs
        </Link>
        <Link
          href="/runs?type=preview"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "6px",
            fontSize: "0.875rem",
            fontWeight: 500,
            background: runType === "preview" ? "var(--pa-gray-bg)" : "white",
            border: "1px solid var(--pa-border)",
            color: runType === "preview" ? "var(--pa-dark)" : "var(--pa-gray)",
            textDecoration: "none",
          }}
        >
          Preview runs
        </Link>
      </div>

      {!error && runs.length === 0 && (
        <EmptyState
          title={`No ${runType} runs yet`}
          description={
            runType === "crawl"
              ? "Connect a website and run a crawl from the dashboard."
              : "Configure a template and generate previews from the Templates page."
          }
          actionLabel={runType === "crawl" ? "Go to Dashboard" : "Go to Templates"}
          actionHref={runType === "crawl" ? "/dashboard" : "/templates"}
        />
      )}

      {runs.length > 0 && (
        <div
          style={{
            background: "white",
            border: "1px solid var(--pa-border)",
            borderRadius: "var(--pa-radius-lg)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--pa-border)" }}>
            <h2 style={{ fontWeight: 600, fontSize: "1rem" }}>All runs</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--pa-border)", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Type</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Status</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Trigger</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Started</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Finished</th>
                  <th style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", fontWeight: 500, color: "var(--pa-gray)" }}>Error</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => {
                  const s = statusStyle(run.status);
                  return (
                    <tr key={run.id} style={{ borderBottom: "1px solid var(--pa-border)" }}>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: run.type === "preview" ? "#dbeafe" : "#f3f4f6",
                            color: run.type === "preview" ? "#2563eb" : "var(--pa-gray)",
                            border: `1px solid ${run.type === "preview" ? "#93c5fd" : "var(--pa-border)"}`,
                          }}
                        >
                          {run.type}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span
                          style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            background: s.bg,
                            color: s.color,
                            border: `1px solid ${s.border}`,
                          }}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem" }}>{run.trigger}</td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                        {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--pa-gray)" }}>
                        {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "—"}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--pa-gray)" }}>
                        {run.errorMessage ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RunsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RunsContent />
    </Suspense>
  );
}
