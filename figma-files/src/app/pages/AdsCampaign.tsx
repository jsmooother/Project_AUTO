import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  Copy,
  Package,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  ArrowLeft,
  Loader2,
} from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

type RunStatus = "success" | "running" | "failed" | "queued";
type CampaignStatus = "active" | "paused" | "error";

interface Run {
  id: string;
  type: string;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

export function AdsCampaign() {
  // Mock campaign state - in production, fetch from API
  const [campaignStatus, setCampaignStatus] = useState<CampaignStatus>("active");
  const [syncing, setSyncing] = useState(false);

  // Mock campaign data
  const campaign = {
    name: "Acme Vehicles - Always On",
    id: "camp_847562001",
    meta_campaign_id: "23847562001",
    status: campaignStatus,
    created_at: "2026-01-28T10:00:00Z",
    last_sync: "2026-02-05T08:30:00Z",
    catalog: {
      id: "cat_847562",
      meta_catalog_id: "2847562847562",
      item_count: 247,
      last_updated: "2026-02-05T08:30:00Z",
    },
    ad_account: {
      name: "Acme Inc. Main Ads",
      id: "act_123456789",
    },
    config: {
      geo: "Stockholm, 30 km radius",
      formats: ["Feed", "Reels"],
      cta: "Learn More",
      budget_monthly: 15000,
      currency: "SEK",
    },
  };

  // Mock recent runs
  const recentRuns: Run[] = [
    {
      id: "run_847562",
      type: "ADS_SYNC",
      status: "success",
      started_at: "2026-02-05T08:30:00Z",
      finished_at: "2026-02-05T08:32:15Z",
      error_message: null,
    },
    {
      id: "run_847561",
      type: "ADS_PUBLISH",
      status: "success",
      started_at: "2026-02-04T14:15:00Z",
      finished_at: "2026-02-04T14:18:42Z",
      error_message: null,
    },
    {
      id: "run_847560",
      type: "ADS_SYNC",
      status: "success",
      started_at: "2026-02-04T02:00:00Z",
      finished_at: "2026-02-04T02:01:33Z",
      error_message: null,
    },
    {
      id: "run_847559",
      type: "ADS_SYNC",
      status: "failed",
      started_at: "2026-02-03T08:00:00Z",
      finished_at: "2026-02-03T08:01:12Z",
      error_message: "Meta API rate limit exceeded. Will retry in 1 hour.",
    },
    {
      id: "run_847558",
      type: "CRAWL",
      status: "success",
      started_at: "2026-02-03T06:00:00Z",
      finished_at: "2026-02-03T06:05:48Z",
      error_message: null,
    },
  ];

  // Mock spend data
  const spendData = {
    current_month: 3240,
    budget_monthly: 15000,
    daily_average: 162,
    projected_total: 5200,
    currency: "SEK",
  };

  const handlePause = () => {
    console.log("Pausing campaign...");
    setCampaignStatus("paused");
  };

  const handleResume = () => {
    console.log("Resuming campaign...");
    setCampaignStatus("active");
  };

  const handleSyncNow = () => {
    console.log("Forcing sync...");
    setSyncing(true);
    setTimeout(() => setSyncing(false), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: RunStatus) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-600">Success</Badge>;
      case "running":
        return <Badge className="bg-blue-600">Running</Badge>;
      case "failed":
        return <Badge className="bg-red-600">Failed</Badge>;
      case "queued":
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  const getStatusIcon = (status: RunStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "queued":
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCampaignStatusBadge = () => {
    switch (campaignStatus) {
      case "active":
        return (
          <Badge className="bg-green-600 text-base px-4 py-2">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-600 text-base px-4 py-2">
            <PauseCircle className="h-4 w-4 mr-2" />
            Paused
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-600 text-base px-4 py-2">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Error
          </Badge>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/app/ads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ads
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Campaign Monitor</h1>
            <p className="text-gray-600">{campaign.name}</p>
          </div>
          <div className="flex items-center gap-3">
            {getCampaignStatusBadge()}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Campaign Status Card */}
        <Card className={campaignStatus === "error" ? "border-red-200 bg-red-50" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  campaignStatus === "active" ? "bg-green-100" : 
                  campaignStatus === "paused" ? "bg-yellow-100" : "bg-red-100"
                }`}>
                  {campaignStatus === "active" && <Activity className="h-5 w-5 text-green-600" />}
                  {campaignStatus === "paused" && <PauseCircle className="h-5 w-5 text-yellow-600" />}
                  {campaignStatus === "error" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                </div>
                <div>
                  <CardTitle>Campaign Status</CardTitle>
                  <CardDescription>
                    Last synced: {formatTimestamp(campaign.last_sync)}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {campaignStatus === "active" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncNow}
                      disabled={syncing}
                    >
                      {syncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePause}
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  </>
                ) : campaignStatus === "paused" ? (
                  <Button
                    size="sm"
                    onClick={handleResume}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : null}
                <Link to="/app/ads">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Meta Objects Status */}
        <div className="grid grid-cols-3 gap-6">
          {/* Product Catalog */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Product Catalog</CardTitle>
                  <CardDescription className="text-xs">Meta Catalog</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Items</span>
                  <span className="font-semibold">{campaign.catalog.item_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Catalog ID</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono">{campaign.catalog.meta_catalog_id.slice(0, 8)}...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(campaign.catalog.meta_catalog_id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`https://business.facebook.com/commerce/catalogs/${campaign.catalog.meta_catalog_id}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View in Meta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <MetaIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Campaign</CardTitle>
                  <CardDescription className="text-xs">Meta Campaign</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {campaignStatus === "active" && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      Active
                    </Badge>
                  )}
                  {campaignStatus === "paused" && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                      Paused
                    </Badge>
                  )}
                  {campaignStatus === "error" && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Error
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Name</span>
                  <span className="font-semibold text-sm text-right">{campaign.name.slice(0, 15)}...</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Campaign ID</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono">{campaign.meta_campaign_id.slice(0, 8)}...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(campaign.meta_campaign_id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(`https://business.facebook.com/adsmanager/manage/campaigns?act=${campaign.ad_account.id}&selected_campaign_ids=${campaign.meta_campaign_id}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View in Meta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Product Ads */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Dynamic Product Ads</CardTitle>
                  <CardDescription className="text-xs">Ad Configuration</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Formats</span>
                  <span className="font-semibold text-sm">{campaign.config.formats.join(", ")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Targeting</span>
                  <span className="font-semibold text-sm text-right">{campaign.config.geo}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">CTA</span>
                  <span className="font-semibold text-sm">{campaign.config.cta}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="font-bold text-base">
                      {campaign.config.budget_monthly.toLocaleString()} {campaign.config.currency}
                      <span className="text-xs text-gray-500 font-normal">/mo</span>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Monitoring */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>Budget Monitoring</CardTitle>
                <CardDescription>Current month spend vs. budget</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Current Spend</div>
                  <div className="text-xl font-semibold">
                    {spendData.current_month.toLocaleString()} {spendData.currency}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Monthly Budget</div>
                  <div className="text-xl font-semibold">
                    {spendData.budget_monthly.toLocaleString()} {spendData.currency}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Daily Average</div>
                  <div className="text-xl font-semibold">
                    {spendData.daily_average} {spendData.currency}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-700 mb-1">Projected Total</div>
                  <div className="text-xl font-semibold text-blue-900">
                    ~{spendData.projected_total.toLocaleString()} {spendData.currency}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Budget Progress</span>
                  <span className="text-sm text-gray-600">
                    {Math.round((spendData.current_month / spendData.budget_monthly) * 100)}% used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min((spendData.current_month / spendData.budget_monthly) * 100, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {spendData.budget_monthly - spendData.current_month > 0 
                    ? `${(spendData.budget_monthly - spendData.current_month).toLocaleString()} ${spendData.currency} remaining`
                    : "Budget exceeded"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Automation Runs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest automation runs</CardDescription>
                </div>
              </div>
              <Link to="/app/ads">
                <Button variant="outline" size="sm">
                  View All Runs
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRuns.map((run) => {
                  const duration = run.finished_at
                    ? Math.round(
                        (new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000
                      )
                    : null;

                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-mono text-sm">{run.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{run.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status)}
                          {getStatusBadge(run.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{formatTimestamp(run.started_at)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {duration ? `${duration}s` : "-"}
                      </TableCell>
                      <TableCell>
                        <Link to={`/app/runs/${run.id}`}>
                          <Button variant="ghost" size="sm">
                            Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}