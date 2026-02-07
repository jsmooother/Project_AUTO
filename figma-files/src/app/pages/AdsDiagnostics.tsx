import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Activity,
  Package,
  Palette,
  DollarSign,
  Database,
  Globe,
  ExternalLink,
  Wrench,
} from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

type HealthStatus = "healthy" | "warning" | "error";

interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  lastCheck: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CommonIssue {
  title: string;
  description: string;
  solution: string;
  actionLabel: string;
  actionLink: string;
}

export function AdsDiagnostics() {
  // Mock health checks - in production, fetch from API
  const healthChecks: HealthCheck[] = [
    {
      name: "Meta Connection",
      status: "healthy",
      message: "OAuth token valid, expires in 45 days",
      lastCheck: "2026-02-05T10:30:00Z",
      icon: MetaIcon,
    },
    {
      name: "Catalog Sync",
      status: "healthy",
      message: "247 items synced successfully",
      lastCheck: "2026-02-05T08:30:00Z",
      icon: Package,
    },
    {
      name: "Last Publish",
      status: "healthy",
      message: "Published 2 hours ago",
      lastCheck: "2026-02-05T08:15:00Z",
      icon: Activity,
    },
    {
      name: "Template Approval",
      status: "healthy",
      message: "All templates approved",
      lastCheck: "2026-02-04T14:00:00Z",
      icon: Palette,
    },
    {
      name: "Budget Status",
      status: "healthy",
      message: "Budget on track, 65% remaining",
      lastCheck: "2026-02-05T10:00:00Z",
      icon: DollarSign,
    },
    {
      name: "Inventory Health",
      status: "healthy",
      message: "Last crawl successful, 247 items found",
      lastCheck: "2026-02-05T06:00:00Z",
      icon: Database,
    },
  ];

  // Mock system metadata
  const systemMetadata = {
    last_crawl: "2026-02-05T06:00:00Z",
    crawl_status: "success",
    items_in_inventory: 247,
    items_in_catalog: 247,
    catalog_sync_status: "synced",
    template_status: "approved",
    qa_gate_status: "passed",
    campaign_status: "active",
    last_ads_sync: "2026-02-05T08:30:00Z",
    error_count_24h: 0,
  };

  // Common issues and troubleshooting
  const commonIssues: CommonIssue[] = [
    {
      title: "No products showing in ads",
      description: "Your ads are running but showing no products",
      solution: "Check if catalog sync completed successfully. If items are 0, trigger a new crawl.",
      actionLabel: "View Catalog Status",
      actionLink: "/app/ads/campaign",
    },
    {
      title: "Ads paused unexpectedly",
      description: "Campaign was paused automatically",
      solution: "Check billing status. Ads pause automatically if budget is exhausted or payment fails.",
      actionLabel: "Check Billing",
      actionLink: "/app/billing",
    },
    {
      title: "Meta connection error",
      description: "Unable to sync with Meta API",
      solution: "OAuth token may have expired (60-day limit). Reconnect your Meta account.",
      actionLabel: "Reconnect Meta",
      actionLink: "/app/settings",
    },
    {
      title: "Inventory not updating",
      description: "New items not appearing in ads",
      solution: "Check when last crawl ran. Crawls run every 6 hours. You can also trigger manually.",
      actionLabel: "View Runs",
      actionLink: "/app/ads",
    },
  ];

  const getStatusIcon = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-green-600">Healthy</Badge>;
      case "warning":
        return <Badge className="bg-yellow-600">Warning</Badge>;
      case "error":
        return <Badge className="bg-red-600">Error</Badge>;
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

  const overallHealth: HealthStatus = healthChecks.some((check) => check.status === "error")
    ? "error"
    : healthChecks.some((check) => check.status === "warning")
    ? "warning"
    : "healthy";

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
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
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Diagnostics</h1>
            <p className="text-gray-600">System health checks and troubleshooting</p>
          </div>
          <div className="flex items-center gap-3">
            {overallHealth === "healthy" && (
              <Badge className="bg-green-600 text-base px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                All Systems Healthy
              </Badge>
            )}
            {overallHealth === "warning" && (
              <Badge className="bg-yellow-600 text-base px-4 py-2">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Warnings Detected
              </Badge>
            )}
            {overallHealth === "error" && (
              <Badge className="bg-red-600 text-base px-4 py-2">
                <XCircle className="h-4 w-4 mr-2" />
                Errors Detected
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overall Status Summary */}
        {overallHealth === "healthy" && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-900">
              <strong>All systems operational.</strong> Your automated ads are running smoothly with no
              issues detected.
            </AlertDescription>
          </Alert>
        )}

        {/* Health Checks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                overallHealth === "healthy" ? "bg-green-100" : 
                overallHealth === "warning" ? "bg-yellow-100" : "bg-red-100"
              }`}>
                <Activity className={`h-5 w-5 ${
                  overallHealth === "healthy" ? "text-green-600" : 
                  overallHealth === "warning" ? "text-yellow-600" : "text-red-600"
                }`} />
              </div>
              <div>
                <CardTitle>Health Checks</CardTitle>
                <CardDescription>System status and last check times</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {healthChecks.map((check) => {
                const IconComponent = check.icon;
                return (
                  <div
                    key={check.name}
                    className={`p-4 rounded-lg border-2 ${
                      check.status === "healthy"
                        ? "border-green-200 bg-green-50"
                        : check.status === "warning"
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent
                          className={`h-5 w-5 ${
                            check.status === "healthy"
                              ? "text-green-600"
                              : check.status === "warning"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        />
                        <span className="font-semibold">{check.name}</span>
                      </div>
                      {getStatusIcon(check.status)}
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{check.message}</p>
                    <p className="text-xs text-gray-500">
                      Last checked: {formatTimestamp(check.lastCheck)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh All Checks
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Metadata */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>System Metadata</CardTitle>
                <CardDescription>Detailed system information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Last Crawl</span>
                  <span className="font-semibold text-sm">
                    {formatTimestamp(systemMetadata.last_crawl)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Crawl Status</span>
                  <Badge className="bg-green-600 capitalize">{systemMetadata.crawl_status}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Items in Inventory</span>
                  <span className="font-semibold text-sm">{systemMetadata.items_in_inventory}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Items in Catalog</span>
                  <span className="font-semibold text-sm">{systemMetadata.items_in_catalog}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Catalog Sync Status</span>
                  <Badge className="bg-green-600 capitalize">
                    {systemMetadata.catalog_sync_status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Template Status</span>
                  <Badge className="bg-green-600 capitalize">{systemMetadata.template_status}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">QA Gate Status</span>
                  <Badge className="bg-green-600 capitalize">{systemMetadata.qa_gate_status}</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-600">Errors (24h)</span>
                  <span className="font-semibold text-sm">{systemMetadata.error_count_24h}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues Troubleshooter */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Wrench className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Common Issues</CardTitle>
                <CardDescription>Troubleshooting guide for frequent problems</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="p-4 border rounded-lg hover:border-gray-300 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{issue.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                        <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-blue-900">Solution: </span>
                          <span className="text-blue-800">{issue.solution}</span>
                        </div>
                      </div>
                    </div>
                    <Link to={issue.actionLink} className="ml-4">
                      <Button variant="outline" size="sm">
                        {issue.actionLabel}
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to resolve issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <Link to="/app/ads">
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Trigger Crawl
                </Button>
              </Link>
              <Link to="/app/ads/campaign">
                <Button variant="outline" className="w-full">
                  <Activity className="h-4 w-4 mr-2" />
                  View Campaign
                </Button>
              </Link>
              <Link to="/app/settings">
                <Button variant="outline" className="w-full">
                  <Globe className="h-4 w-4 mr-2" />
                  Check Connections
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}