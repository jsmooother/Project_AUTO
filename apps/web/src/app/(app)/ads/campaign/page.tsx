"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth";
import { apiGet } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ExternalLink, Copy } from "lucide-react";

function CampaignContent() {
  const { auth } = useAuth();
  const [status, setStatus] = useState<AdsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const customerId = auth.status === "authenticated" ? auth.user.customerId : null;

  useEffect(() => {
    if (!customerId) return;
    apiGet<AdsStatus>("/ads/status", { customerId })
      .then((res) => {
        if (res.ok) {
          setStatus(res.data);
        } else {
          setError(res.error);
        }
      })
      .catch(() => setError("Failed to load campaign status"))
      .finally(() => setLoading(false));
  }, [customerId]);

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

  if (error || !status) {
    return (
      <div className="p-6">
        <ErrorBanner message={error ?? "Failed to load campaign status"} />
      </div>
    );
  }

  const { objects, lastRuns } = status;
  const campaignId = objects?.campaignId;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Campaign Status</h1>
        <p className="text-gray-600">Monitor your Meta ads campaign</p>
      </div>

      {/* Meta Object IDs */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Meta Object IDs</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Catalog ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{objects?.catalogId ?? "Not created"}</span>
              {objects?.catalogId && (
                <button
                  onClick={() => copyToClipboard(objects.catalogId!)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Campaign ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{objects?.campaignId ?? "Not created"}</span>
              {objects?.campaignId && (
                <>
                  <button
                    onClick={() => copyToClipboard(objects.campaignId!)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={`https://business.facebook.com/adsmanager/manage/campaigns?act=${objects.campaignId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink size={16} />
                    View in Meta
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Ad Set ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{objects?.adsetId ?? "Not created"}</span>
              {objects?.adsetId && (
                <button
                  onClick={() => copyToClipboard(objects.adsetId!)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Ad ID:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{objects?.adId ?? "Not created"}</span>
              {objects?.adId && (
                <button
                  onClick={() => copyToClipboard(objects.adId!)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status */}
      {objects && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${
              objects.status === "active" ? "bg-green-100 text-green-800" :
              objects.status === "paused" ? "bg-yellow-100 text-yellow-800" :
              objects.status === "error" ? "bg-red-100 text-red-800" :
              "bg-gray-100 text-gray-800"
            }`}>
              {objects.status}
            </span>
          </div>
          <div className="mt-4">
            <button
              disabled
              className="px-4 py-2 bg-gray-200 text-gray-500 rounded cursor-not-allowed"
              title="Pause/Resume not yet implemented"
            >
              Pause Campaign
            </button>
          </div>
        </div>
      )}

      {/* Recent Runs */}
      {lastRuns.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Runs</h2>
          <div className="space-y-2">
            {lastRuns.slice(0, 10).map((run) => (
              <div key={run.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{run.status}</span>
                  {run.errorMessage && (
                    <span className="text-red-600 ml-2 text-sm">{run.errorMessage}</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {run.finishedAt ? new Date(run.finishedAt).toLocaleString() : "Running..."}
                </span>
              </div>
            ))}
          </div>
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
  } | null;
  lastRuns: Array<{
    id: string;
    status: string;
    finishedAt: string | null;
    errorMessage: string | null;
  }>;
}

export default function CampaignPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CampaignContent />
    </Suspense>
  );
}
