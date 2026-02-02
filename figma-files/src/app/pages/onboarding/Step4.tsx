import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { Badge } from "@/app/components/ui/badge";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";

export function OnboardingStep4() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight mb-2">Project Auto</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>First sync in progress</CardTitle>
            <CardDescription>
              Setting up your Always On automation. This may take a few minutes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Stages */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Discovery</div>
                  <div className="text-sm text-gray-600">Found 247 listing URLs</div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Complete
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">Diff</div>
                  <div className="text-sm text-gray-600">Compared with previous state</div>
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Complete
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 flex-shrink-0 animate-spin" />
                <div className="flex-1">
                  <div className="font-medium">New details</div>
                  <div className="text-sm text-gray-600">Fetching 247 new items (142/247)</div>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Running
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-500">Removals</div>
                  <div className="text-sm text-gray-500">Detect removed listings</div>
                </div>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                  Pending
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-gray-500">Done</div>
                  <div className="text-sm text-gray-500">Finalize and update status</div>
                </div>
                <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                  Pending
                </Badge>
              </div>
            </div>

            <Progress value={57} className="h-2" />

            {/* Summary Counters */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-semibold mb-1">247</div>
                <div className="text-sm text-gray-600">Seen</div>
              </div>
              <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="text-2xl font-semibold text-green-900 mb-1">247</div>
                <div className="text-sm text-green-700">New</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-2xl font-semibold mb-1">0</div>
                <div className="text-sm text-gray-600">Removed</div>
              </div>
            </div>

            {/* Live Events Feed */}
            <div className="space-y-2">
              <h3 className="font-semibold">Run events</h3>
              <div className="border rounded-lg bg-gray-900 p-4 h-48 overflow-y-auto">
                <div className="font-mono text-xs text-gray-300 space-y-1">
                  <div>[14:23:42] Starting sync run_2024_02_01_142342</div>
                  <div>[14:23:43] Discovery: Using sitemap + html_links strategy</div>
                  <div>[14:23:45] Discovery: Found 247 listing URLs</div>
                  <div>[14:23:45] Diff: 247 new, 0 removed, 0 unchanged</div>
                  <div>[14:23:46] Fetching details for 247 new items...</div>
                  <div className="text-blue-400">[14:24:12] Progress: 50/247 items fetched</div>
                  <div className="text-blue-400">[14:24:38] Progress: 100/247 items fetched</div>
                  <div className="text-blue-400 animate-pulse">[14:25:04] Progress: 142/247 items fetched</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">First sync in progress</p>
                  <p className="text-blue-800">
                    We're fetching details for all 247 listings. You can leave this page and check
                    back later — we'll email you when it's done.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4">
              {/* When complete, this becomes active */}
              <Link to="/app/dashboard">
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing sync...
                </Button>
              </Link>
              {/* <Link to="/app/dashboard">
                <Button>Go to Dashboard</Button>
              </Link> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
