import { Link } from "react-router";
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
import { DollarSign, AlertTriangle } from "lucide-react";

export function AdminBilling() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Billing & Payments</h1>
        <p className="text-sm text-gray-600">Stripe integration and payment management</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Meta Spend (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold mb-1">$842,340</div>
            <div className="text-xs text-gray-600">Across 189 customers</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Project Auto Fees (MTD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-blue-600 mb-1">$25,270</div>
            <div className="text-xs text-gray-600">3% avg rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Collected This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600 mb-1">$18,420</div>
            <div className="text-xs text-gray-600">73% collection rate</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Payment Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-900 mb-1">7</div>
            <div className="text-xs text-red-700">Requires attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Issues */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Payment Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead className="text-right">Amount Due</TableHead>
                <TableHead>Last Attempt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-sm bg-red-50">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/7" className="text-blue-600 hover:underline">
                    Elite Motors LLC
                  </Link>
                </TableCell>
                <TableCell className="text-red-600">Payment failed - insufficient funds</TableCell>
                <TableCell className="text-right font-medium">$298.42</TableCell>
                <TableCell className="text-gray-600">2 days ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Failed
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">Retry</Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-red-50">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/8" className="text-blue-600 hover:underline">
                    Metro Cars
                  </Link>
                </TableCell>
                <TableCell className="text-red-600">Card declined</TableCell>
                <TableCell className="text-right font-medium">$87.12</TableCell>
                <TableCell className="text-gray-600">1 day ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Failed
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">Retry</Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-yellow-50">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/6" className="text-blue-600 hover:underline">
                    Prestige Auto
                  </Link>
                </TableCell>
                <TableCell className="text-yellow-700">Card expiring in 5 days</TableCell>
                <TableCell className="text-right font-medium">$142.35</TableCell>
                <TableCell className="text-gray-600">—</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                    Warning
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm">Notify</Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-yellow-50">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/4" className="text-blue-600 hover:underline">
                    Summit Auto Group
                  </Link>
                </TableCell>
                <TableCell className="text-yellow-700">High spend alert - review needed</TableCell>
                <TableCell className="text-right font-medium">$8,420.00</TableCell>
                <TableCell className="text-gray-600">Today</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                    Review
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm">Review</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Customers - Billing View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Billing Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Monthly Budget</TableHead>
                <TableHead className="text-right">MTD Meta Spend</TableHead>
                <TableHead className="text-right">MTD Fee</TableHead>
                <TableHead>Stripe ID</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/1" className="text-blue-600 hover:underline">
                    Acme Motors
                  </Link>
                </TableCell>
                <TableCell className="text-right">$5,000</TableCell>
                <TableCell className="text-right font-medium">$3,240</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$97.20</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe123</TableCell>
                <TableCell className="text-gray-600">•••• 4242</TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Current</Badge>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/2" className="text-blue-600 hover:underline">
                    Best Auto Sales
                  </Link>
                </TableCell>
                <TableCell className="text-right">$8,000</TableCell>
                <TableCell className="text-right font-medium">$6,120</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$183.60</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe456</TableCell>
                <TableCell className="text-gray-600">•••• 5678</TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Current</Badge>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/4" className="text-blue-600 hover:underline">
                    Summit Auto Group
                  </Link>
                </TableCell>
                <TableCell className="text-right">$12,000</TableCell>
                <TableCell className="text-right font-medium">$9,850</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$295.50</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe789</TableCell>
                <TableCell className="text-gray-600">•••• 9012</TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Current</Badge>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/5" className="text-blue-600 hover:underline">
                    Valley Motors
                  </Link>
                </TableCell>
                <TableCell className="text-right">$4,500</TableCell>
                <TableCell className="text-right font-medium">$2,890</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$86.70</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe012</TableCell>
                <TableCell className="text-gray-600">•••• 3456</TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Current</Badge>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm opacity-60">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/6" className="text-blue-600 hover:underline">
                    Prestige Auto
                  </Link>
                </TableCell>
                <TableCell className="text-right">$6,000</TableCell>
                <TableCell className="text-right font-medium">$0</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$0</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe345</TableCell>
                <TableCell className="text-gray-600">•••• 6789</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                    Paused
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/7" className="text-blue-600 hover:underline">
                    Elite Motors LLC
                  </Link>
                </TableCell>
                <TableCell className="text-right">$15,000</TableCell>
                <TableCell className="text-right font-medium">$12,340</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$370.20</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe678</TableCell>
                <TableCell className="text-gray-600">•••• 0123</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Failed
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/8" className="text-blue-600 hover:underline">
                    Metro Cars
                  </Link>
                </TableCell>
                <TableCell className="text-right">$2,500</TableCell>
                <TableCell className="text-right font-medium">$1,780</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">$53.40</TableCell>
                <TableCell className="font-mono text-xs">cus_stripe901</TableCell>
                <TableCell className="text-gray-600">•••• 4567</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Failed
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">Showing 1-7 of 189 customers</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
