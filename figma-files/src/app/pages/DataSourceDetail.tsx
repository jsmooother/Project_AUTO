import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ConfidenceScore } from "@/app/components/ConfidenceScore";
import { ArrowLeft, Search, Play, RefreshCw, Clock } from "lucide-react";

export function DataSourceDetail() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <Link to="/app/data-sources">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Data Sources
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Main Inventory</h1>
            <p className="text-gray-600">yoursite.com/inventory</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Search className="h-4 w-4" />
              Run Probe
            </Button>
            <Button className="gap-2">
              <Play className="h-4 w-4" />
              Run Sync
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Site Profile</TabsTrigger>
          <TabsTrigger value="runs">Runs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Overview */}
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Health</CardTitle>
              </CardHeader>
              <CardContent>
                <StatusBadge status="healthy" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                <ConfidenceScore score={87} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Last Sync</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600">2 hours ago</div>
              </CardContent>
            </Card>
          </div>

          {/* Automation Mode */}
          <Card>
            <CardHeader>
              <CardTitle>Automation mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <Label htmlFor="always-on" className="text-base font-medium">
                      Always On
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600">
                    Automatically sync inventory on a schedule
                  </p>
                </div>
                <Switch id="always-on" defaultChecked />
              </div>

              <div className="ml-11 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-sm">
                    Sync frequency
                  </Label>
                  <Select defaultValue="nightly">
                    <SelectTrigger id="frequency" className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every hour</SelectItem>
                      <SelectItem value="every-6h">Every 6 hours</SelectItem>
                      <SelectItem value="nightly">Nightly (2 AM)</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">
                  Next scheduled sync: <span className="font-medium">Today at 2:00 AM EST</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Play className="h-5 w-5 text-green-600" />
                  <span className="text-base font-medium">On Demand</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Run a sync manually anytime using the "Run Sync" button above
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Last Run Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Last run summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-semibold mb-1">247</div>
                  <div className="text-sm text-gray-600">Seen</div>
                </div>
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="text-2xl font-semibold text-green-900 mb-1">12</div>
                  <div className="text-sm text-green-700">New</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-semibold mb-1">3</div>
                  <div className="text-sm text-gray-600">Removed</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Started</span>
                  <span className="font-medium">Feb 1, 2026 12:15 PM EST</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">4m 32s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <StatusBadge status="healthy" />
                </div>
              </div>

              <Link to="/app/runs/1">
                <Button variant="outline" className="w-full">
                  View full run details
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mini Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "2 hours ago", event: "Sync completed", status: "healthy" },
                  { time: "1 day ago", event: "Sync completed", status: "healthy" },
                  { time: "2 days ago", event: "Sync completed", status: "healthy" },
                  { time: "3 days ago", event: "Probe completed", status: "healthy" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 w-24">{item.time}</span>
                    <span className="flex-1">{item.event}</span>
                    <StatusBadge status={item.status as any} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Site profile (read-only)</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit (Admin)
                  </Button>
                  <Button variant="outline" size="sm">
                    Re-run Probe
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-gray-50 p-4 font-mono text-sm">
                <pre className="text-gray-800 overflow-x-auto">
{`{
  "discovery": {
    "strategy": "sitemap",
    "fallback": ["html_links"],
    "sitemap_url": "https://yoursite.com/sitemap.xml",
    "seed_urls": ["https://yoursite.com/inventory"]
  },
  "fetch": {
    "strategy": "http",
    "user_agent": "ProjectAuto/1.0",
    "timeout_ms": 30000
  },
  "extract": {
    "strategy": "vehicle",
    "selectors": {
      "title": ".vehicle-title",
      "price": ".vehicle-price",
      "year": ".vehicle-year",
      "make": ".vehicle-make",
      "model": ".vehicle-model",
      "mileage": ".vehicle-mileage",
      "images": ".vehicle-gallery img"
    }
  },
  "confidence": 87,
  "notes": "High-quality structured data. Sitemap provides comprehensive coverage."
}`}
                </pre>
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Last probe</p>
                  <p className="text-blue-800">Jan 28, 2026 at 3:42 PM EST</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Run history</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                View all runs for this data source on the{" "}
                <Link to="/app/runs?source=1" className="text-blue-600 hover:underline">
                  Runs page
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
