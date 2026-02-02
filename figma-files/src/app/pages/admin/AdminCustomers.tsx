import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Search, ExternalLink } from "lucide-react";

export function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Customers</h1>
        <p className="text-sm text-gray-600">247 total customers</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by company, email, or domain..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="onboarding">Onboarding</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="recent">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="spend-high">Highest spend</SelectItem>
                <SelectItem value="spend-low">Lowest spend</SelectItem>
                <SelectItem value="name">Company A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Monthly Budget</TableHead>
                <TableHead className="text-right">Current Spend</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-sm">
                <TableCell className="font-medium">Acme Motors</TableCell>
                <TableCell className="text-gray-600">john@acmemotors.com</TableCell>
                <TableCell>
                  <a href="https://acmemotors.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    acmemotors.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$5,000</TableCell>
                <TableCell className="text-right">$3,240</TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/1">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">Best Auto Sales</TableCell>
                <TableCell className="text-gray-600">mike@bestautosales.com</TableCell>
                <TableCell>
                  <a href="https://bestautosales.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    bestautosales.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$8,000</TableCell>
                <TableCell className="text-right">$6,120</TableCell>
                <TableCell className="text-gray-600">5 hours ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/2">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-yellow-50">
                <TableCell className="font-medium">Quality Cars Inc</TableCell>
                <TableCell className="text-gray-600">sarah@qualitycars.com</TableCell>
                <TableCell>
                  <a href="https://qualitycars.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    qualitycars.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                    Onboarding
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$3,000</TableCell>
                <TableCell className="text-right text-gray-400">—</TableCell>
                <TableCell className="text-gray-600">1 day ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/3">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">Summit Auto Group</TableCell>
                <TableCell className="text-gray-600">alex@summitauto.com</TableCell>
                <TableCell>
                  <a href="https://summitauto.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    summitauto.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$12,000</TableCell>
                <TableCell className="text-right">$9,850</TableCell>
                <TableCell className="text-gray-600">1 hour ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/4">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">Valley Motors</TableCell>
                <TableCell className="text-gray-600">lisa@valleymotors.com</TableCell>
                <TableCell>
                  <a href="https://valleymotors.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    valleymotors.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$4,500</TableCell>
                <TableCell className="text-right">$2,890</TableCell>
                <TableCell className="text-gray-600">3 hours ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/5">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm opacity-60">
                <TableCell className="font-medium">Prestige Auto</TableCell>
                <TableCell className="text-gray-600">chris@prestigeauto.com</TableCell>
                <TableCell>
                  <a href="https://prestigeauto.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    prestigeauto.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                    Paused
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$6,000</TableCell>
                <TableCell className="text-right">$0</TableCell>
                <TableCell className="text-gray-600">2 weeks ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/6">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">Elite Motors LLC</TableCell>
                <TableCell className="text-gray-600">david@elitemotors.com</TableCell>
                <TableCell>
                  <a href="https://elitemotors.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    elitemotors.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$15,000</TableCell>
                <TableCell className="text-right">$12,340</TableCell>
                <TableCell className="text-gray-600">30 min ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/7">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">Metro Cars</TableCell>
                <TableCell className="text-gray-600">emma@metrocars.com</TableCell>
                <TableCell>
                  <a href="https://metrocars.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    metrocars.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge className="bg-green-600 text-xs">Active</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">$2,500</TableCell>
                <TableCell className="text-right">$1,780</TableCell>
                <TableCell className="text-gray-600">6 hours ago</TableCell>
                <TableCell>
                  <Link to="/admin/customers/8">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">Showing 1-8 of 247 customers</div>
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
