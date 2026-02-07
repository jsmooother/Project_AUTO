import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { CheckCircle2, XCircle, AlertTriangle, TrendingUp, Users, Play, DollarSign, Megaphone } from "lucide-react";

export function AdminOverview() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">System Overview</h1>
        <p className="text-sm text-gray-600">Last updated: 2 minutes ago</p>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 uppercase tracking-wide">Meta API</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-semibold text-green-600">Operational</div>
            <div className="text-xs text-gray-500 mt-1">99.98% uptime</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 uppercase tracking-wide">Stripe API</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-semibold text-green-600">Operational</div>
            <div className="text-xs text-gray-500 mt-1">100% uptime</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 uppercase tracking-wide">Crawlers</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-semibold text-green-600">Healthy</div>
            <div className="text-xs text-gray-500 mt-1">12 active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 uppercase tracking-wide">Database</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-semibold text-green-600">Healthy</div>
            <div className="text-xs text-gray-500 mt-1">24ms avg query</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-yellow-700 uppercase tracking-wide font-medium">Queue</div>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="font-semibold text-yellow-900">Degraded</div>
            <div className="text-xs text-yellow-700 mt-1">342 jobs pending</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 uppercase tracking-wide">Workers</div>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="font-semibold text-green-600">8 / 10 active</div>
            <div className="text-xs text-gray-500 mt-1">CPU: 42%</div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">247</div>
            <div className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12 this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Active Ad Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">132</div>
            <div className="text-xs text-gray-600">53% of customers</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Failed Runs (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">23</div>
            <div className="text-xs text-red-600">Needs review</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Ad Spend (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">2.4M SEK</div>
            <div className="text-xs text-green-600">+18% vs last month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Failed Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Failed Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Customer</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead className="w-24">Time</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Acme Motors</TableCell>
                  <TableCell className="text-red-600">Crawl timeout (30s)</TableCell>
                  <TableCell className="text-gray-600">12m ago</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Best Auto</TableCell>
                  <TableCell className="text-red-600">Meta API rate limit</TableCell>
                  <TableCell className="text-gray-600">24m ago</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Quality Cars</TableCell>
                  <TableCell className="text-red-600">No inventory found</TableCell>
                  <TableCell className="text-gray-600">1h ago</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Summit Auto</TableCell>
                  <TableCell className="text-red-600">Meta auth expired</TableCell>
                  <TableCell className="text-gray-600">2h ago</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Valley Motors</TableCell>
                  <TableCell className="text-red-600">Site restructure detected</TableCell>
                  <TableCell className="text-gray-600">3h ago</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Billing Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Customer</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead className="w-24">Amount</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Prestige Auto</TableCell>
                  <TableCell className="text-yellow-700">Card expiring soon</TableCell>
                  <TableCell className="font-medium">$142</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      Warning
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Elite Motors</TableCell>
                  <TableCell className="text-red-600">Payment failed</TableCell>
                  <TableCell className="font-medium">$298</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Metro Cars</TableCell>
                  <TableCell className="text-red-600">Card declined</TableCell>
                  <TableCell className="font-medium">$87</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Failed
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Premier Auto</TableCell>
                  <TableCell className="text-yellow-700">High spend alert</TableCell>
                  <TableCell className="font-medium">$8,420</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                      Review
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="font-medium">Crown Motors</TableCell>
                  <TableCell className="text-red-600">Over budget</TableCell>
                  <TableCell className="font-medium">$5,120</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                      Paused
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Runs (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total runs</span>
                <span className="font-medium">342</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-600">Successful</span>
                <span className="font-medium">319</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600">Failed</span>
                <span className="font-medium">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success rate</span>
                <span className="font-medium">93.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Inventory Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total items tracked</span>
                <span className="font-medium">48,392</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-green-600">Added (24h)</span>
                <span className="font-medium">1,284</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Removed (24h)</span>
                <span className="font-medium">892</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg per customer</span>
                <span className="font-medium">196</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ad Spend (MTD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Meta spend</span>
                <span className="font-medium">$842,340</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600">Agentic Ads fees</span>
                <span className="font-medium">$25,270</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg spend/customer</span>
                <span className="font-medium">$3,410</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Projected month-end</span>
                <span className="font-medium">$1.2M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}