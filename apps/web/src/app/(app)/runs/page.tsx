"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { apiGet, apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";

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

  const load = () => {
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
  };

  useEffect(() => {
    if (customerId) load();
  }, [customerId, runType]);

  const hasActiveRuns = runs.some((r) => r.status === "queued" || r.status === "running");
  const QUEUED_TIMEOUT_MS = 5 * 60 * 1000;
  const staleQueued = runs.find(
    (r) => r.status === "queued" && Date.now() - new Date(r.createdAt).getTime() > QUEUED_TIMEOUT_MS
  );

  useEffect(() => {
    if (!customerId || !hasActiveRuns) return;
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [customerId, runType, hasActiveRuns]);

  const handleRunNow = async () => {
    if (!customerId) return;
    setRunNowError(null);
    setRunNowHint(null);
    setRunNowLoading(true);
    const res = await apiPost<{ runId: string }>("/runs/crawl", undefined, { customerId });
    setRunNowLoading(false);
    if (res.ok) {
      load();
    } else {
      setRunNowError(res.error);
      setRunNowHint(res.errorDetail?.hint ?? null);
    }
  };

  if (auth.status !== "authenticated") return <LoadingSpinner />;
  if (loading) return <LoadingSpinner />;

  return (
    <>
      <h1 style={{ marginBottom: "1rem" }}>Automation / Runs</h1>
      {error && <ErrorBanner message={error} onRetry={load} />}
      {runNowError && <ErrorBanner message={runNowError} hint={runNowHint ?? undefined} />}
      {staleQueued && (
        <div
          style={{
            padding: "1rem",
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        >
          <strong>Worker may be offline.</strong> A run has been queued for over 5 minutes. Check that the worker is running (<code>pnpm --filter @repo/worker dev</code>) and Redis is available.
        </div>
      )}
      {hasActiveRuns && !staleQueued && (
        <p style={{ marginBottom: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Polling for updates… (runs in progress)
        </p>
      )}
      {runType === "crawl" && hasSource && (
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            onClick={handleRunNow}
            disabled={runNowLoading}
            style={{
              padding: "0.5rem 1rem",
              background: runNowLoading ? "#cbd5e0" : "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: runNowLoading ? "not-allowed" : "pointer",
            }}
          >
            {runNowLoading ? "Starting…" : "Run now"}
          </button>
        </div>
      )}
      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <span style={{ color: "#666" }}>Show:</span>
        <Link
          href="/runs?type=crawl"
          style={{
            color: runType === "crawl" ? "#0070f3" : "#666",
            fontWeight: runType === "crawl" ? 600 : 400,
            textDecoration: runType === "crawl" ? "underline" : "none",
          }}
        >
          Crawl runs
        </Link>
        <Link
          href="/runs?type=preview"
          style={{
            color: runType === "preview" ? "#0070f3" : "#666",
            fontWeight: runType === "preview" ? 600 : 400,
            textDecoration: runType === "preview" ? "underline" : "none",
          }}
        >
          Preview runs
        </Link>
      </div>
      <p style={{ marginBottom: "1rem", color: "#666" }}>
        {runType === "crawl"
          ? "Crawl run history. Trigger a run from the dashboard with \"Run crawl\"."
          : "Preview run history. Generate previews from the Templates page."}
      </p>
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
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Type</th>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Trigger</th>
                <th style={{ padding: "0.5rem" }}>Started</th>
                <th style={{ padding: "0.5rem" }}>Finished</th>
                <th style={{ padding: "0.5rem" }}>Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background: run.type === "preview" ? "#e8f4fd" : "#f0f0f0",
                      }}
                    >
                      {run.type}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background:
                          run.status === "success"
                            ? "#d4edda"
                            : run.status === "failed"
                              ? "#f8d7da"
                              : run.status === "running"
                                ? "#fff3cd"
                                : "#f0f0f0",
                      }}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem" }}>{run.trigger}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {run.startedAt ? new Date(run.startedAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "—"}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>{run.errorMessage ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function RunsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RunsContent />
    </Suspense>
  );
}
