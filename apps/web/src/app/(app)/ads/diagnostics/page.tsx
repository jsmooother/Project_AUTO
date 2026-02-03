"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { Copy, ChevronDown, ChevronUp } from "lucide-react";

function DiagnosticsContent() {
  const { auth } = useAuth();
  const [status, setStatus] = useState<AdsStatus | null>(null);
  const [runs, setRuns] = useState<AdRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRuns, setExpandedRuns] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"logs" | "meta">("logs");

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  useEffect(() => {
    if (!customerId) return;
    Promise.all([
      apiGet<AdsStatus>("/ads/status", { customerId }),
      apiGet<{ data: AdRun[] }>("/ads/runs", { customerId }),
    ])
      .then(([statusRes, runsRes]) => {
        if (statusRes.ok) setStatus(statusRes.data);
        if (runsRes.ok) setRuns(runsRes.data.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load diagnostics");
        setLoading(false);
      });
  }, [customerId]);

  const toggleRun = (runId: string) => {
    const newExpanded = new Set(expandedRuns);
    if (newExpanded.has(runId)) {
      newExpanded.delete(runId);
    } else {
      newExpanded.add(runId);
    }
    setExpandedRuns(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorBanner message={error} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Ads Diagnostics</h1>
        <p className="text-gray-600">Job logs and Meta debug information</p>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("logs")}
            className={`pb-2 px-4 ${activeTab === "logs" ? "border-b-2 border-blue-600 font-medium" : ""}`}
          >
            Job Logs
          </button>
          <button
            onClick={() => setActiveTab("meta")}
            className={`pb-2 px-4 ${activeTab === "meta" ? "border-b-2 border-blue-600 font-medium" : ""}`}
          >
            Meta Debug Info
          </button>
        </div>
      </div>

      {/* Job Logs Tab */}
      {activeTab === "logs" && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Ad Runs</h2>
            <div className="space-y-2">
              {runs.length === 0 ? (
                <p className="text-gray-500">No runs yet</p>
              ) : (
                runs.map((run) => (
                  <div key={run.id} className="border rounded">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleRun(run.id)}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          run.status === "success" ? "bg-green-100 text-green-800" :
                          run.status === "failed" ? "bg-red-100 text-red-800" :
                          run.status === "running" ? "bg-blue-100 text-blue-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {run.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "Running..."}
                        </span>
                      </div>
                      {expandedRuns.has(run.id) ? <ChevronUp /> : <ChevronDown />}
                    </div>
                    {expandedRuns.has(run.id) && (
                      <div className="p-4 border-t bg-gray-50">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Run ID:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono">{run.id}</span>
                              <button
                                onClick={() => copyToClipboard(run.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          </div>
                          {run.errorMessage && (
                            <div>
                              <span className="text-gray-600">Error:</span>
                              <pre className="mt-1 p-2 bg-red-50 text-red-800 rounded text-xs overflow-auto">
                                {run.errorMessage}
                              </pre>
                            </div>
                          )}
                          {run.startedAt && (
                            <div>
                              <span className="text-gray-600">Started:</span>{" "}
                              {new Date(run.startedAt).toLocaleString()}
                            </div>
                          )}
                          {run.finishedAt && run.startedAt && (
                            <div>
                              <span className="text-gray-600">Duration:</span>{" "}
                              {Math.round((new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)}s
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meta Debug Info Tab */}
      {activeTab === "meta" && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Meta Debug Info</h2>
          {status?.objects ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Meta Object IDs</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Catalog ID:</span>{" "}
                    <span className="font-mono">{status.objects.catalogId ?? "Not created"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Campaign ID:</span>{" "}
                    <span className="font-mono">{status.objects.campaignId ?? "Not created"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ad Set ID:</span>{" "}
                    <span className="font-mono">{status.objects.adsetId ?? "Not created"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ad ID:</span>{" "}
                    <span className="font-mono">{status.objects.adId ?? "Not created"}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Status</h3>
                <span className="px-2 py-1 rounded text-sm bg-gray-100">{status.objects.status}</span>
              </div>
              {status.objects.lastSyncedAt && (
                <div>
                  <h3 className="font-medium mb-2">Last Synced</h3>
                  <span className="text-sm">{new Date(status.objects.lastSyncedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Additional Meta debug information (pixels, rate limits, request payloads) will be available once real Meta API integration is enabled.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No Meta objects created yet</p>
          )}
        </div>
      )}
    </div>
  );
}

interface AdsStatus {
  objects: {
    catalogId: string | null;
    campaignId: string | null;
    adsetId: string | null;
    adId: string | null;
    status: string;
    lastSyncedAt: string | null;
  } | null;
}

interface AdRun {
  id: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  errorMessage: string | null;
}

export default function DiagnosticsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DiagnosticsContent />
    </Suspense>
  );
}
