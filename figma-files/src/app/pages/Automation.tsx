import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Switch } from "@/app/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Play, RefreshCw, CheckCircle2, Clock, DollarSign, Info } from "lucide-react";

export function Automation() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Automation</h1>
        <p className="text-gray-600">Manage your inventory sync, budget, and campaign automation</p>
      </div>

      <Tabs defaultValue="automation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="automation">Automation & Budget</TabsTrigger>
          <TabsTrigger value="history">Run History</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="space-y-6">
          {/* Monthly Budget */}
          <Card className="border-2 border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Monthly ad budget</CardTitle>
                  <CardDescription>
                    Set your total monthly ad spend across all campaigns
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Monthly budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="5000"
                  defaultValue="5000"
                />
                <p className="text-sm text-gray-500">
                  This is your Meta Ads spend limit. Campaigns will pause when this is reached.
                </p>
              </div>

              {/* Current Usage */}
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Current month usage</span>
                  <Badge variant="outline">Feb 2026</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">$3,240 spent</span>
                    <span className="text-gray-600">of $5,000 budget</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '64.8%' }} />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    19 days remaining in billing cycle
                  </div>
                </div>
              </div>

              {/* Budget Explanation */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">How budget works</p>
                  <p>
                    This budget is spent directly with Meta Ads. Project Auto distributes it
                    evenly across your active inventory items. You can adjust this anytime.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button>Update Budget</Button>
              </div>
            </CardContent>
          </Card>

          {/* Automation Modes */}
          <div className="grid grid-cols-2 gap-6">
            {/* Always On */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold">Always On</h3>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Automatically sync inventory every night at 2:00 AM
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div>
                      <Label htmlFor="enable-auto" className="font-medium">
                        Enable automatic sync
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Check for new and removed items nightly
                      </p>
                    </div>
                    <Switch id="enable-auto" defaultChecked />
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-900">
                      <div className="font-medium mb-1">Next scheduled run</div>
                      <div>Tonight at 2:00 AM EST</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* On Demand */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Play className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">On Demand</h3>
                    <p className="text-sm text-gray-600">
                      Manually trigger a sync anytime you need
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="text-sm text-gray-700 mb-3">
                      Run a manual sync to immediately check for inventory changes and update
                      campaigns
                    </div>
                    <Button className="w-full gap-2">
                      <Play className="h-4 w-4" />
                      Run Manual Sync
                    </Button>
                  </div>

                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium mb-1">Last manual run</div>
                      <div>2 days ago • Completed successfully</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Mode</div>
                  <Badge className="bg-blue-600">Always On</Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last run</div>
                  <div className="font-medium">2 hours ago</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Healthy</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Items synced</div>
                  <div className="font-medium">247</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How Automation Works */}
          <Card>
            <CardHeader>
              <CardTitle>How automation works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <div>
                    <strong>Auto-create ads:</strong> New inventory items automatically get
                    campaigns created on Meta Ads
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <div>
                    <strong>Auto-pause ads:</strong> When items are removed from your website,
                    their campaigns are automatically paused
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <div>
                    <strong>Budget distribution:</strong> Your monthly budget is evenly
                    distributed across all active items
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <div>
                    <strong>Daily monitoring:</strong> Campaigns are monitored and adjusted to
                    stay within your budget limits
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All runs</CardTitle>
                <div className="text-sm text-gray-600">Last 30 days</div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Started</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Seen</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead className="text-right">Removed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div>Feb 1, 2026</div>
                      <div className="text-sm text-gray-500">12:15 PM</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Manual</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">4m 32s</TableCell>
                    <TableCell className="text-right">247</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">12</TableCell>
                    <TableCell className="text-right">3</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to="/app/automation/runs/1">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div>Jan 31, 2026</div>
                      <div className="text-sm text-gray-500">2:00 AM</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Scheduled</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">4m 15s</TableCell>
                    <TableCell className="text-right">238</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">8</TableCell>
                    <TableCell className="text-right">2</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to="/app/automation/runs/2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div>Jan 30, 2026</div>
                      <div className="text-sm text-gray-500">2:00 AM</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Scheduled</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">4m 8s</TableCell>
                    <TableCell className="text-right">235</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">5</TableCell>
                    <TableCell className="text-right">3</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to="/app/automation/runs/3">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div>Jan 29, 2026</div>
                      <div className="text-sm text-gray-500">2:00 AM</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Scheduled</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">3m 52s</TableCell>
                    <TableCell className="text-right">233</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">3</TableCell>
                    <TableCell className="text-right">1</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to="/app/automation/runs/4">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-medium">
                      <div>Jan 28, 2026</div>
                      <div className="text-sm text-gray-500">3:42 PM</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Manual</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">5m 12s</TableCell>
                    <TableCell className="text-right">231</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">231</TableCell>
                    <TableCell className="text-right">0</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        Success
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to="/app/automation/runs/5">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
