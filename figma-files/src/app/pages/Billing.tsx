import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { CreditCard, Download, Info } from "lucide-react";

export function Billing() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Billing & Usage</h1>
        <p className="text-gray-600">Track your usage and manage payment details</p>
      </div>

      <div className="space-y-6">
        {/* How Pricing Works */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">How pricing works</p>
                <p className="mb-3">
                  You pay Meta Ads directly for your advertising spend. Project Auto charges
                  <strong> 3% of your actual ad spend</strong> (minimum $50/month).
                </p>
                <p className="text-blue-800">
                  Example: If you spend $5,000 on Meta Ads, Project Auto charges $150 that month.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Month Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current month</CardTitle>
                <CardDescription>February 2026 (19 days remaining)</CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Meta Ads spend</div>
                <div className="text-2xl font-semibold mb-1">$3,240</div>
                <div className="text-xs text-gray-500">Paid directly to Meta</div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 mb-1">Project Auto fee</div>
                <div className="text-2xl font-semibold text-blue-900 mb-1">$97.20</div>
                <div className="text-xs text-blue-700">3% of ad spend</div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">Estimated total</div>
                <div className="text-2xl font-semibold mb-1">$150</div>
                <div className="text-xs text-gray-500">Projected at month end</div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Ad spend progress</span>
                <span className="text-sm text-gray-600">$3,240 of $5,000 budget</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '64.8%' }} />
              </div>
              <div className="text-xs text-gray-600">
                On pace to spend ~$5,200 this month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>This month's activity</CardTitle>
            <CardDescription>Daily breakdown of ad spend and fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="font-medium">Feb 1, 2026</div>
                <div className="flex items-center gap-6">
                  <div className="text-gray-600">Ad spend: <span className="font-medium text-gray-900">$210</span></div>
                  <div className="text-blue-600">Fee: <span className="font-medium">$6.30</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="font-medium">Jan 31, 2026</div>
                <div className="flex items-center gap-6">
                  <div className="text-gray-600">Ad spend: <span className="font-medium text-gray-900">$195</span></div>
                  <div className="text-blue-600">Fee: <span className="font-medium">$5.85</span></div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg text-sm">
                <div className="font-medium">Jan 30, 2026</div>
                <div className="flex items-center gap-6">
                  <div className="text-gray-600">Ad spend: <span className="font-medium text-gray-900">$203</span></div>
                  <div className="text-blue-600">Fee: <span className="font-medium">$6.09</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm">
                View all activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment method</CardTitle>
            <CardDescription>How we charge you for Project Auto fees</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium">•••• •••• •••• 4242</div>
                  <div className="text-sm text-gray-600">Expires 12/2026</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Billing cycle</span>
                  <span className="font-medium">Monthly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Next charge date</span>
                  <span className="font-medium">Mar 1, 2026</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated next charge</span>
                  <span className="font-medium">~$150</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-900">
                <strong>Need invoicing?</strong> Contact us to set up invoice-based billing for
                your organization.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Billing history</CardTitle>
                <CardDescription>Past invoices and payments</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">January 2026</div>
                  <div className="text-sm text-gray-600">
                    Meta spend: $4,823 • Project Auto fee: $144.69
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">$144.69</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Paid
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">December 2025</div>
                  <div className="text-sm text-gray-600">
                    Meta spend: $3,210 • Project Auto fee: $96.30
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">$96.30</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Paid
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">November 2025</div>
                  <div className="text-sm text-gray-600">
                    Meta spend: $1,580 • Project Auto fee: $50.00
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">$50.00</span>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Paid
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Minimum Fee Notice */}
        <Card>
          <CardHeader>
            <CardTitle>Minimum monthly fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-gray-50 border rounded-lg">
              <Info className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="mb-2">
                  Project Auto has a <strong>$50 minimum monthly fee</strong>. If your 3% fee
                  falls below $50 in any month, you'll be charged $50.
                </p>
                <p className="text-gray-600">
                  This covers the cost of maintaining your automations, monitoring, and support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
