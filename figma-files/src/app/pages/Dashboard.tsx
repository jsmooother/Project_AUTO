import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Play, CheckCircle2, Clock, Package, RefreshCw, TrendingUp, AlertTriangle, Globe, XCircle } from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

export function Dashboard() {
  // Simulating different states - in production, these would come from your data layer
  const websiteConnected = false; // Set to false to show incomplete setup
  const metaConnected = true;
  const hasInventory = false;
  const lastError = null; // or { message: "Connection timeout", time: "2 hours ago", action: "Retry connection" }

  const isSetupComplete = websiteConnected && metaConnected && hasInventory;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Dashboard</h1>
        <p className="text-gray-600">Monitor your automation status and inventory</p>
      </div>

      {/* Incomplete Setup Warning */}
      {!isSetupComplete && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">Setup incomplete</h3>
                  <Badge className="bg-yellow-600">Action Required</Badge>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  {!websiteConnected
                    ? "Connect your website to start detecting inventory and running automated campaigns."
                    : "Your website is connected but no inventory was found. Check your URL or contact support."}
                </p>
                <Link to="/app/settings">
                  <Button size="sm">
                    Complete Setup
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Banner */}
      {lastError && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-red-900">Last run failed</h3>
                  <Badge className="bg-red-600">Error</Badge>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  {lastError.message} • {lastError.time}
                </p>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                  {lastError.action}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status Panel */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>System status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            {/* Website Connection */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Website</div>
                {websiteConnected ? (
                  <>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 mb-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <div className="text-sm text-gray-600">
                      yoursite.com/inventory
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 mb-2">
                      Not connected
                    </Badge>
                    <Link to="/app/settings">
                      <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                        Connect now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Meta Account */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MetaIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Meta Ads</div>
                {metaConnected ? (
                  <>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 mb-2">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Acme Inc. Ads
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 mb-2">
                      Not connected
                    </Badge>
                    <Link to="/app/settings">
                      <Button variant="link" size="sm" className="p-0 h-auto text-blue-600">
                        Connect now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Automation Status */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Automation</div>
                {isSetupComplete ? (
                  <>
                    <Badge className="bg-green-600 mb-2">Active</Badge>
                    <div className="text-sm text-gray-600">
                      Nightly sync enabled
                    </div>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 mb-2">
                      Inactive
                    </Badge>
                    <div className="text-sm text-gray-600">
                      Complete setup to activate
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Only show metrics if setup is complete */}
      {isSetupComplete ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Inventory Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold mb-1">247</div>
                <div className="text-sm text-gray-600">Active items</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Run
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold mb-1">2 hours ago</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  New Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold mb-1">12</div>
                <div className="text-sm text-gray-600">Items added</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Automation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-green-600 mb-2">Active</Badge>
                <div className="text-sm text-gray-600">Nightly sync enabled</div>
              </CardContent>
            </Card>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <Card className="border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Run automation now</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Manually trigger a sync to update inventory and refresh campaigns immediately
                    </p>
                    <Button className="gap-2">
                      <Play className="h-4 w-4" />
                      Run Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Last run summary</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      View details from the most recent automation run
                    </p>
                    <Link to="/app/automation">
                      <Button variant="outline">
                        View Last Run
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent activity</CardTitle>
                <Link to="/app/automation">
                  <Button variant="ghost" size="sm">
                    View all runs
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Sync completed</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      247 items checked • 12 new • 3 removed
                    </div>
                    <div className="text-sm text-gray-500 mt-1">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Nightly sync completed</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      238 items checked • 8 new • 2 removed
                    </div>
                    <div className="text-sm text-gray-500 mt-1">1 day ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">Manual sync completed</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      235 items checked • 5 new • 3 removed
                    </div>
                    <div className="text-sm text-gray-500 mt-1">2 days ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Setup Guide for Incomplete Setup */
        <Card>
          <CardHeader>
            <CardTitle>Get started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">Connect your website</div>
                  <p className="text-sm text-gray-600 mb-3">
                    Add your inventory website URL so we can detect your listings
                  </p>
                  <Link to="/app/settings">
                    <Button size="sm">
                      Connect Website
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg opacity-60">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-600 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">Wait for inventory sync</div>
                  <p className="text-sm text-gray-600">
                    We'll automatically scan your site and detect all listings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg opacity-60">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-600 font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">Launch automation</div>
                  <p className="text-sm text-gray-600">
                    Set your budget and enable automatic campaign management
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
