import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { ArrowLeft, RefreshCw, XCircle, CheckCircle2, AlertTriangle } from "lucide-react";

export function AdminRunDetail() {
  const [showRetryDialog, setShowRetryDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <Link to="/admin/runs">
          <Button variant="ghost" size="sm" className="gap-2 mb-3">
            <ArrowLeft className="h-4 w-4" />
            Back to Runs
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Run Details</h1>
            <p className="text-sm text-gray-600">run_abc123 • Started Feb 1, 2026 at 12:15 PM</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowRetryDialog(true)}>
              <RefreshCw className="h-4 w-4" />
              Retry Run
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCancelDialog(true)}>
              <XCircle className="h-4 w-4" />
              Cancel Run
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Customer</div>
            <Link to="/admin/customers/1" className="text-sm font-medium text-blue-600 hover:underline">
              Acme Motors
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Status</div>
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Success
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Duration</div>
            <div className="text-sm font-medium">4m 32s</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Items Seen</div>
            <div className="text-2xl font-semibold">247</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-xs text-green-700 uppercase tracking-wide mb-2 font-medium">Changes</div>
            <div className="text-sm font-semibold text-green-900">
              +12 new / -3 removed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Run Steps & Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Run Steps & Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step 1: Discovery */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Step 1: Discovery</h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto text-xs">
                  Complete
                </Badge>
                <span className="text-xs text-gray-500">3s</span>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:00] Starting inventory discovery</div>
                  <div>[12:15:01] Scanning acmemotors.com/inventory</div>
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
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto text-xs">
                  Complete
                </Badge>
                <span className="text-xs text-gray-500">1s</span>
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
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto text-xs">
                  Complete
                </Badge>
                <span className="text-xs text-gray-500">10s</span>
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
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto text-xs">
                  Complete
                </Badge>
                <span className="text-xs text-gray-500">4s</span>
              </div>
              <div className="ml-7 p-4 bg-gray-900 rounded-lg">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[12:15:16] Syncing to Meta Ads (Account: 123456789)</div>
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
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 ml-auto text-xs">
                  Complete
                </Badge>
                <span className="text-xs text-gray-500">12s</span>
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

      {/* Run Metadata */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Run Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 mb-1">Run ID</div>
                <div className="font-mono text-xs">run_abc123</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Trigger</div>
                <Badge variant="outline" className="text-xs">Manual</Badge>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Triggered by</div>
                <div className="font-medium">john@acmemotors.com</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 mb-1">Started at</div>
                <div className="font-medium">Feb 1, 2026 12:15:00 PM EST</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Completed at</div>
                <div className="font-medium">Feb 1, 2026 12:19:32 PM EST</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Total duration</div>
                <div className="font-medium">4m 32s</div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-gray-600 mb-1">Worker ID</div>
                <div className="font-mono text-xs">worker-03</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Region</div>
                <div className="font-medium">us-east-1</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Version</div>
                <div className="font-mono text-xs">v1.2.4</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retry Run Dialog */}
      <Dialog open={showRetryDialog} onOpenChange={setShowRetryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Retry Run
            </DialogTitle>
            <DialogDescription>
              This will create a new run with the same parameters for Acme Motors. The original run
              will remain in the history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRetryDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowRetryDialog(false)}>
              Start Retry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Run Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel Run
            </DialogTitle>
            <DialogDescription>
              This will immediately stop the current run. Partial progress may be saved, but the
              run will be marked as cancelled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Running
            </Button>
            <Button variant="destructive" onClick={() => setShowCancelDialog(false)}>
              Cancel Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
