import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export function RunDetail() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link to="/app/automation">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Automation
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Run Details</h1>
            <div className="flex items-center gap-3 text-gray-600">
              <span>Feb 1, 2026 at 12:15 PM</span>
              <span>•</span>
              <Badge variant="outline">Manual</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Success
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-medium">4m 32s</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Items Seen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">247</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700">Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium text-green-900">
              +12 new / -3 removed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Steps & Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Run steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Discovery */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Step 1: Discovery</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto">
                  Complete
                </Badge>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:00] Starting inventory discovery</div>
                  <div>[12:15:01] Scanning yoursite.com/inventory</div>
                  <div>[12:15:03] Found 247 listing pages</div>
                  <div className="text-green-400">[12:15:03] Discovery complete</div>
                </div>
              </div>
            </div>

            {/* Step 2: Diff */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Step 2: Compare Changes</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto">
                  Complete
                </Badge>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:04] Comparing with last run (Jan 31, 2:00 AM)</div>
                  <div>[12:15:04] Previous: 238 items</div>
                  <div className="text-green-400">[12:15:04] Detected 12 new items</div>
                  <div className="text-yellow-400">[12:15:04] Detected 3 removed items</div>
                  <div>[12:15:04] 232 items unchanged</div>
                </div>
              </div>
            </div>

            {/* Step 3: Fetch Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Step 3: Fetch New Item Details</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto">
                  Complete
                </Badge>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:05] Fetching details for 12 new items</div>
                  <div>[12:15:08] Progress: 5/12 items</div>
                  <div>[12:15:12] Progress: 10/12 items</div>
                  <div className="text-green-400">[12:15:15] All items fetched successfully</div>
                  <div>[12:15:15] Avg: 11.2 fields per item</div>
                  <div>[12:15:15] 100% with images</div>
                </div>
              </div>
            </div>

            {/* Step 4: Update Campaigns */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Step 4: Update Campaigns</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto">
                  Complete
                </Badge>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:16] Syncing to ad platform</div>
                  <div>[12:15:18] Created ads for 12 new items</div>
                  <div>[12:15:20] Paused ads for 3 removed items</div>
                  <div className="text-green-400">[12:15:20] Campaign sync complete</div>
                </div>
              </div>
            </div>

            {/* Step 5: Finalize */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Step 5: Finalize</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto">
                  Complete
                </Badge>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:21] Updating database</div>
                  <div>[12:15:22] Generating report</div>
                  <div className="text-green-400 font-semibold">
                    [12:19:32] Run completed successfully
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total items processed</span>
              <span className="font-medium">247</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">New items added</span>
              <span className="font-medium text-green-600">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Items removed</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ads created</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Ads paused</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-gray-600">Started at</span>
              <span className="font-medium">Feb 1, 2026 12:15:00 PM EST</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Completed at</span>
              <span className="font-medium">Feb 1, 2026 12:19:32 PM EST</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
