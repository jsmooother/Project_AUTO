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
import { RefreshCw, Power, CheckCircle, ExternalLink } from "lucide-react";

export function AdminSources() {
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Inventory Sources</h1>
        <p className="text-sm text-gray-600">189 connected websites</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Sources</div>
            <div className="text-2xl font-semibold">189</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Active Crawls</div>
            <div className="text-2xl font-semibold text-blue-600">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Failed (24h)</div>
            <div className="text-2xl font-semibold text-red-600">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Items</div>
            <div className="text-2xl font-semibold">48,392</div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Inventory Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Last Crawl</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/1" className="text-blue-600 hover:underline">
                    Acme Motors
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://acmemotors.com/inventory" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    acmemotors.com/inventory
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">247</TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-blue-50">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/2" className="text-blue-600 hover:underline">
                    Best Auto Sales
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://bestautosales.com/cars" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    bestautosales.com/cars
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">312</TableCell>
                <TableCell className="text-gray-600">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    In progress...
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                    Crawling
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" disabled>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-red-50">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/3" className="text-blue-600 hover:underline">
                    Quality Cars Inc
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://qualitycars.com/vehicles" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    qualitycars.com/vehicles
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">0</TableCell>
                <TableCell className="text-gray-600">1 day ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Error
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/4" className="text-blue-600 hover:underline">
                    Summit Auto Group
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://summitauto.com/inventory" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    summitauto.com/inventory
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">418</TableCell>
                <TableCell className="text-gray-600">1 hour ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/5" className="text-blue-600 hover:underline">
                    Valley Motors
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://valleymotors.com/cars" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    valleymotors.com/cars
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">183</TableCell>
                <TableCell className="text-gray-600">3 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/7" className="text-blue-600 hover:underline">
                    Elite Motors LLC
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://elitemotors.com/vehicles" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    elitemotors.com/vehicles
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">521</TableCell>
                <TableCell className="text-gray-600">30 min ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Known
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-medium">
                  <Link to="/admin/customers/8" className="text-blue-600 hover:underline">
                    Metro Cars
                  </Link>
                </TableCell>
                <TableCell>
                  <a href="https://metrocars.com/inventory" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                    metrocars.com/inventory
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Vehicles</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">142</TableCell>
                <TableCell className="text-gray-600">6 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Healthy
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <Power className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">Showing 1-7 of 189 sources</div>
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
