import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Megaphone,
  TrendingUp,
  DollarSign,
  Eye,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

interface Campaign {
  id: string;
  customer_id: string;
  customer_name: string;
  status: "active" | "paused" | "failed" | "pending";
  budget_monthly: number;
  spend_current: number;
  currency: string;
  catalog_items: number;
  last_sync: string;
  campaign_id: string;
  formats: string[];
  geo_targeting: string;
  template: string;
}

export function AdminAds() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock campaigns data
  const campaigns: Campaign[] = [
    {
      id: "camp_001",
      customer_id: "cus_abc123",
      customer_name: "Acme Motors",
      status: "active",
      budget_monthly: 15000,
      spend_current: 3240,
      currency: "SEK",
      catalog_items: 247,
      last_sync: "2 hours ago",
      campaign_id: "camp_9384756384",
      formats: ["Feed", "Reels"],
      geo_targeting: "Stockholm, 30 km",
      template: "Modern",
    },
    {
      id: "camp_002",
      customer_id: "cus_def456",
      customer_name: "Göteborg Bil AB",
      status: "active",
      budget_monthly: 25000,
      spend_current: 18750,
      currency: "SEK",
      catalog_items: 412,
      last_sync: "1 hour ago",
      campaign_id: "camp_8473625847",
      formats: ["Feed"],
      geo_targeting: "Göteborg, Malmö",
      template: "Bold",
    },
    {
      id: "camp_003",
      customer_id: "cus_ghi789",
      customer_name: "Malmö Bilar",
      status: "paused",
      budget_monthly: 10000,
      spend_current: 4320,
      currency: "SEK",
      catalog_items: 156,
      last_sync: "12 hours ago",
      campaign_id: "camp_7362847562",
      formats: ["Feed", "Reels"],
      geo_targeting: "Malmö, 50 km",
      template: "Classic",
    },
    {
      id: "camp_004",
      customer_id: "cus_jkl012",
      customer_name: "Uppsala Auto",
      status: "failed",
      budget_monthly: 8000,
      spend_current: 1240,
      currency: "SEK",
      catalog_items: 98,
      last_sync: "3 days ago",
      campaign_id: "camp_9283746529",
      formats: ["Feed"],
      geo_targeting: "Uppsala, 30 km",
      template: "Minimal",
    },
    {
      id: "camp_005",
      customer_id: "cus_mno345",
      customer_name: "Stockholm Motors",
      status: "pending",
      budget_monthly: 20000,
      spend_current: 0,
      currency: "SEK",
      catalog_items: 324,
      last_sync: "Never",
      campaign_id: "-",
      formats: ["Feed", "Reels"],
      geo_targeting: "Stockholm, 40 km",
      template: "Modern",
    },
  ];

  // Calculate totals
  const totalBudget = campaigns.reduce((sum, c) => sum + c.budget_monthly, 0);
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend_current, 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const failedCampaigns = campaigns.filter((c) => c.status === "failed").length;

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-600">
            <PauseCircle className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.campaign_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Ads & Campaigns</h1>
        <p className="text-sm text-gray-600">
          Monitor all customer Meta ad campaigns and spending
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">{activeCampaigns}</div>
            <div className="text-xs text-gray-600">of {campaigns.length} total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Monthly Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">
              {totalBudget.toLocaleString()} SEK
            </div>
            <div className="text-xs text-gray-600">Across all customers</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Current Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">
              {totalSpend.toLocaleString()} SEK
            </div>
            <div className="text-xs text-green-600">
              {Math.round((totalSpend / totalBudget) * 100)}% of budget
            </div>
          </CardContent>
        </Card>

        <Card className={failedCampaigns > 0 ? "border-red-200 bg-red-50" : ""}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Failed Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold mb-1">{failedCampaigns}</div>
            <div className="text-xs text-red-600">Needs attention</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer or campaign ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Campaign Overview</TabsTrigger>
          <TabsTrigger value="meta">Meta Connections</TabsTrigger>
          <TabsTrigger value="spend">Spend Analysis</TabsTrigger>
        </TabsList>

        {/* Campaign Overview Tab */}
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget / Spend</TableHead>
                    <TableHead>Catalog</TableHead>
                    <TableHead>Formats</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{campaign.customer_name}</div>
                          <div className="text-xs text-gray-600">{campaign.customer_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {campaign.spend_current.toLocaleString()} /{" "}
                            {campaign.budget_monthly.toLocaleString()} {campaign.currency}
                          </div>
                          <div className="text-xs text-gray-600">
                            {Math.round((campaign.spend_current / campaign.budget_monthly) * 100)}%
                            used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{campaign.catalog_items} items</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {campaign.formats.map((format) => (
                            <Badge key={format} variant="outline" className="text-xs">
                              {format}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.template}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {campaign.last_sync}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Link to={`/admin/customers/${campaign.customer_id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {campaign.status === "active" && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {campaign.status === "paused" && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meta Connections Tab */}
        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <MetaIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Meta Business Connections</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      OAuth connections to customer Meta Business accounts
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Business ID</TableHead>
                    <TableHead>Ad Account</TableHead>
                    <TableHead>Connection Status</TableHead>
                    <TableHead>Token Expires</TableHead>
                    <TableHead>API Version</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns
                    .filter((c) => c.status !== "pending")
                    .map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="font-medium">{campaign.customer_name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs">biz_7362847562</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-xs">act_9283746529</div>
                        </TableCell>
                        <TableCell>
                          {campaign.status === "failed" ? (
                            <Badge className="bg-red-600">
                              <XCircle className="h-3 w-3 mr-1" />
                              Connection Error
                            </Badge>
                          ) : (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Connected
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {campaign.status === "failed" ? (
                            <span className="text-red-600">Expired</span>
                          ) : (
                            "45 days"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">v19.0</Badge>
                        </TableCell>
                        <TableCell>
                          <a
                            href="https://business.facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm" className="h-8">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Meta
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spend Analysis Tab */}
        <TabsContent value="spend">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Spend by Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns
                    .filter((c) => c.spend_current > 0)
                    .sort((a, b) => b.spend_current - a.spend_current)
                    .map((campaign) => (
                      <div key={campaign.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {campaign.customer_name}
                          </span>
                          <span className="text-sm font-semibold">
                            {campaign.spend_current.toLocaleString()} {campaign.currency}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (campaign.spend_current / campaign.budget_monthly) * 100
                              }%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {Math.round((campaign.spend_current / campaign.budget_monthly) * 100)}%
                          of {campaign.budget_monthly.toLocaleString()} {campaign.currency} budget
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Total Allocated Budget</div>
                    <div className="text-3xl font-bold">
                      {totalBudget.toLocaleString()} SEK
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Total Current Spend</div>
                    <div className="text-3xl font-bold text-blue-600">
                      {totalSpend.toLocaleString()} SEK
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Overall Utilization</div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div
                        className="bg-green-600 h-4 rounded-full"
                        style={{ width: `${(totalSpend / totalBudget) * 100}%` }}
                      />
                    </div>
                    <div className="text-2xl font-bold">
                      {Math.round((totalSpend / totalBudget) * 100)}%
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600 mb-2">Remaining Budget</div>
                    <div className="text-2xl font-bold text-gray-700">
                      {(totalBudget - totalSpend).toLocaleString()} SEK
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
