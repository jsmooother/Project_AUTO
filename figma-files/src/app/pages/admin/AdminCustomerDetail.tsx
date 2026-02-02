import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { ArrowLeft, AlertTriangle, RefreshCw, Pause, Eye, XCircle, CheckCircle2 } from "lucide-react";

export function AdminCustomerDetail() {
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showRecrawlDialog, setShowRecrawlDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <Link to="/admin/customers">
          <Button variant="ghost" size="sm" className="gap-2 mb-3">
            <ArrowLeft className="h-4 w-4" />
            Back to Customers
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Acme Motors</h1>
            <p className="text-sm text-gray-600">Customer ID: cus_abc123xyz • Created Jan 28, 2026</p>
          </div>
          <Badge className="bg-green-600">Active</Badge>
        </div>
      </div>

      {/* Admin Actions */}
      <Card className="mb-6 border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowRecrawlDialog(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Force Re-crawl
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowPauseDialog(true)}
            >
              <Pause className="h-4 w-4" />
              Pause Automation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowResetDialog(true)}
            >
              <XCircle className="h-4 w-4" />
              Reset Connections
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              Impersonate (Read-only)
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Company name</div>
                <div className="font-medium">Acme Motors</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Email</div>
                <div className="font-medium">john@acmemotors.com</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Contact name</div>
                <div className="font-medium">John Doe</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Country</div>
                <div className="font-medium">United States</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Stripe ID</div>
                <div className="font-mono text-xs">cus_stripe123abc</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connected Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Connected Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-gray-600">Website</div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Connected
                  </Badge>
                </div>
                <div className="font-medium mb-1">acmemotors.com/inventory</div>
                <div className="text-xs text-gray-600">
                  Last sync: 2 hours ago
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-gray-600">Meta Ads</div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Active
                  </Badge>
                </div>
                <div className="font-medium mb-1">Account ID: 123456789</div>
                <div className="text-xs text-gray-600">
                  Connected: Jan 28, 2026
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Automation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Mode</div>
                <Badge className="bg-blue-600">Always On</Badge>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Last run</div>
                <div className="font-medium">2 hours ago</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Status</div>
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Healthy</span>
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Total runs</div>
                <div className="font-medium">127 (92% success)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Items</div>
            <div className="text-2xl font-semibold">247</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">New (24h)</div>
            <div className="text-2xl font-semibold text-green-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Removed (24h)</div>
            <div className="text-2xl font-semibold">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">With Images</div>
            <div className="text-2xl font-semibold">98%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Recent Runs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Date</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead className="w-20">Items</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="text-sm">
                  <TableCell className="text-gray-600">Feb 1, 12:15 PM</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">Manual</Badge>
                  </TableCell>
                  <TableCell className="font-medium">247</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Success
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="text-gray-600">Jan 31, 2:00 AM</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">Scheduled</Badge>
                  </TableCell>
                  <TableCell className="font-medium">238</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Success
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="text-gray-600">Jan 30, 2:00 AM</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">Scheduled</Badge>
                  </TableCell>
                  <TableCell className="font-medium">235</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Success
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow className="text-sm">
                  <TableCell className="text-gray-600">Jan 29, 2:00 AM</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">Scheduled</Badge>
                  </TableCell>
                  <TableCell className="font-medium">233</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                      Success
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Billing Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="text-xs text-gray-600 mb-1">Current Month (Feb 2026)</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <div className="text-xl font-semibold">$3,240</div>
                  <div className="text-gray-600">Meta spend</div>
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="text-lg font-semibold text-blue-600">$97.20</div>
                  <div className="text-gray-600">Project Auto fee</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly budget</span>
                  <span className="font-medium">$5,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Budget used</span>
                  <span className="font-medium">64.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment method</span>
                  <span className="font-medium">•••• 4242</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Payment status</span>
                  <Badge className="bg-green-600 text-xs">Current</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pause Automation Dialog */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Pause Automation
            </DialogTitle>
            <DialogDescription>
              This will stop all automated runs for Acme Motors. Their campaigns will remain active
              but won't be updated automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPauseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowPauseDialog(false)}>
              Confirm Pause
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Force Re-crawl Dialog */}
      <Dialog open={showRecrawlDialog} onOpenChange={setShowRecrawlDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-blue-600" />
              Force Re-crawl
            </DialogTitle>
            <DialogDescription>
              This will immediately trigger a full inventory re-crawl for Acme Motors. This may
              take 1-2 minutes to complete.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecrawlDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowRecrawlDialog(false)}>
              Start Re-crawl
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Connections Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Reset All Connections
            </DialogTitle>
            <DialogDescription>
              This will disconnect their website and Meta account. They will need to reconnect
              both services. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowResetDialog(false)}>
              Reset Connections
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
