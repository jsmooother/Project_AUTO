import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

export function AdminSystem() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">
          System Configuration
        </h1>
        <p className="text-sm text-gray-600">
          Feature flags, rate limits, and integration health
        </p>
      </div>

      {/* Integration Health */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Integration Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Meta API</h3>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-600 text-xs">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">99.98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Requests (24h)
                  </span>
                  <span className="font-medium">48,392</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Errors (24h)
                  </span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Avg response
                  </span>
                  <span className="font-medium">284ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Stripe API</h3>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge className="bg-green-600 text-xs">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium">100%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Requests (24h)
                  </span>
                  <span className="font-medium">892</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Errors (24h)
                  </span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Avg response
                  </span>
                  <span className="font-medium">142ms</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Job Queue</h3>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                  >
                    Degraded
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Pending jobs
                  </span>
                  <span className="font-medium">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Processing
                  </span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Workers active
                  </span>
                  <span className="font-medium">8 / 10</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    Avg wait time
                  </span>
                  <span className="font-medium text-yellow-700">
                    4m 22s
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label
                  htmlFor="flag-meta-api"
                  className="font-medium cursor-pointer"
                >
                  Meta API Integration
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enable Meta Ads API for campaign management
                </p>
              </div>
              <Switch id="flag-meta-api" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label
                  htmlFor="flag-nightly-sync"
                  className="font-medium cursor-pointer"
                >
                  Nightly Auto-Sync
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow customers to enable automatic nightly
                  inventory syncs
                </p>
              </div>
              <Switch id="flag-nightly-sync" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <Label
                  htmlFor="flag-manual-runs"
                  className="font-medium cursor-pointer"
                >
                  Manual Runs
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow customers to trigger manual sync runs
                </p>
              </div>
              <Switch id="flag-manual-runs" defaultChecked />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <Label
                  htmlFor="flag-google-ads"
                  className="font-medium cursor-pointer"
                >
                  Google Ads Integration
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enable Google Ads support (v2 feature)
                </p>
              </div>
              <Switch id="flag-google-ads" disabled />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <Label
                  htmlFor="flag-multi-source"
                  className="font-medium cursor-pointer"
                >
                  Multiple Inventory Sources
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Allow multiple website sources per customer
                  (v2 feature)
                </p>
              </div>
              <Switch id="flag-multi-source" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limits */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">
            Rate Limits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-crawl">
                  Max concurrent crawls
                </Label>
                <Input
                  id="rate-crawl"
                  type="number"
                  defaultValue="10"
                />
                <p className="text-xs text-gray-500">
                  Maximum number of simultaneous website crawls
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-runs">
                  Max runs per customer/day
                </Label>
                <Input
                  id="rate-runs"
                  type="number"
                  defaultValue="5"
                />
                <p className="text-xs text-gray-500">
                  Limit manual runs to prevent abuse
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate-meta">
                  Meta API calls/minute
                </Label>
                <Input
                  id="rate-meta"
                  type="number"
                  defaultValue="200"
                />
                <p className="text-xs text-gray-500">
                  Stay within Meta's rate limits
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate-webhook">
                  Webhook calls/minute
                </Label>
                <Input
                  id="rate-webhook"
                  type="number"
                  defaultValue="100"
                />
                <p className="text-xs text-gray-500">
                  Rate limit for incoming webhooks
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="outline">
                Update Rate Limits
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kill Switches */}
      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            Kill Switches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex-1">
                <Label
                  htmlFor="kill-all-runs"
                  className="font-medium cursor-pointer text-red-900"
                >
                  Disable All Automation Runs
                </Label>
                <p className="text-sm text-red-800 mt-1">
                  Emergency: Stop all scheduled and manual runs
                  immediately
                </p>
              </div>
              <Switch id="kill-all-runs" />
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex-1">
                <Label
                  htmlFor="kill-meta"
                  className="font-medium cursor-pointer text-red-900"
                >
                  Disable Meta API Calls
                </Label>
                <p className="text-sm text-red-800 mt-1">
                  Stop all campaign updates to Meta (read-only
                  mode)
                </p>
              </div>
              <Switch id="kill-meta" />
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex-1">
                <Label
                  htmlFor="kill-signups"
                  className="font-medium cursor-pointer text-red-900"
                >
                  Disable New Signups
                </Label>
                <p className="text-sm text-red-800 mt-1">
                  Prevent new customer registrations
                </p>
              </div>
              <Switch id="kill-signups" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Environment Information (Read-only)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 mb-1">
                  Environment
                </div>
                <Badge className="bg-blue-600">
                  Production
                </Badge>
              </div>
              <div>
                <div className="text-gray-600 mb-1">
                  Version
                </div>
                <div className="font-mono">v1.2.4</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Build</div>
                <div className="font-mono text-xs">
                  abc123def456
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 mb-1">Region</div>
                <div className="font-medium">us-east-1</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">
                  Database
                </div>
                <div className="font-medium">
                  PostgreSQL 15.2
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Redis</div>
                <div className="font-medium">7.0.8</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 mb-1">
                  Deployed
                </div>
                <div className="font-medium">Jan 28, 2026</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Uptime</div>
                <div className="font-medium">
                  5 days, 8 hours
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">
                  Last restart
                </div>
                <div className="font-medium">
                  Jan 28, 8:32 AM
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}