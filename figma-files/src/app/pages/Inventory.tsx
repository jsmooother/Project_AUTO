import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
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
import { Badge } from "@/app/components/ui/badge";
import { Search, Download, RefreshCw } from "lucide-react";

export function Inventory() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Inventory</h1>
            <p className="text-gray-600">
              247 active items detected from yoursite.com/inventory
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Now
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1">247</div>
            <div className="text-sm text-gray-600">Total active</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-green-900 mb-1">12</div>
            <div className="text-sm text-green-700">New (24h)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1">3</div>
            <div className="text-sm text-gray-600">Removed (24h)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold mb-1">98%</div>
            <div className="text-sm text-gray-600">With images</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by title, VIN..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="new">New (24h)</SelectItem>
                <SelectItem value="removed">Removed (24h)</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="recent">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most recent</SelectItem>
                <SelectItem value="price-high">Price: High to low</SelectItem>
                <SelectItem value="price-low">Price: Low to high</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-900">
          <strong>Read-only for MVP:</strong> Item details are automatically synced from your
          website. Editing and manual overrides coming in a future update.
        </p>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>All items (247)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2024 Ford F-150 XL</div>
                  <div className="text-sm text-gray-500">VIN: 1FTFW1E5XPF123456</div>
                </TableCell>
                <TableCell className="font-medium">$42,995</TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2023 Toyota Camry SE</div>
                  <div className="text-sm text-gray-500">VIN: 4T1G11AK5PU789012</div>
                </TableCell>
                <TableCell className="font-medium">$28,450</TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow className="bg-green-50">
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2024 Honda CR-V EX</div>
                  <div className="text-sm text-gray-500">VIN: 2HKRS3H74PH345678</div>
                </TableCell>
                <TableCell className="font-medium">$34,200</TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex items-center gap-2">
                    2 hours ago
                    <Badge className="bg-green-600 text-xs">New</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow className="opacity-60">
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2022 Chevrolet Silverado LT</div>
                  <div className="text-sm text-gray-500">VIN: 1GCUYDED2NZ456789</div>
                </TableCell>
                <TableCell className="font-medium">$38,900</TableCell>
                <TableCell className="text-gray-600">3 days ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                    Removed
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2024 Mazda CX-5 Touring</div>
                  <div className="text-sm text-gray-500">VIN: JM3KFBCM0P0567890</div>
                </TableCell>
                <TableCell className="font-medium">$31,750</TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow className="bg-green-50">
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2023 Subaru Outback Limited</div>
                  <div className="text-sm text-gray-500">VIN: 4S4BTANC5P3678901</div>
                </TableCell>
                <TableCell className="font-medium">$36,500</TableCell>
                <TableCell className="text-gray-600">
                  <div className="flex items-center gap-2">
                    2 hours ago
                    <Badge className="bg-green-600 text-xs">New</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">2024 Hyundai Tucson SEL</div>
                  <div className="text-sm text-gray-500">VIN: 5NMS33AD2PH789012</div>
                </TableCell>
                <TableCell className="font-medium">$29,900</TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>Showing 1-7 of 247 items</div>
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
