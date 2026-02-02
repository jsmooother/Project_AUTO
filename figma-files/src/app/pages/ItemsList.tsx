import { Link } from "react-router";
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
import { Search, Filter, ExternalLink } from "lucide-react";

export function ItemsList() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Items</h1>
        <p className="text-gray-600">Browse and manage your inventory items</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search items..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active only</SelectItem>
                <SelectItem value="removed">Removed only</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All data sources</SelectItem>
                <SelectItem value="1">Main Inventory</SelectItem>
                <SelectItem value="2">Secondary Inventory</SelectItem>
                <SelectItem value="3">Premium Listings</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="24h">New in last 24h</SelectItem>
                <SelectItem value="7d">New in last 7 days</SelectItem>
                <SelectItem value="30d">New in last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All items (247)</CardTitle>
            <div className="text-sm text-gray-600">
              12 new in last 24h • 3 removed
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600" />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to="/app/items/1"
                    className="font-medium hover:underline"
                  >
                    2024 Ford F-150 XL
                  </Link>
                  <div className="text-sm text-gray-500">VIN: 1FTFW1E5XPF...</div>
                </TableCell>
                <TableCell className="font-medium">$42,995</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">2024</Badge>
                    <Badge variant="secondary" className="text-xs">1,247 mi</Badge>
                    <Badge variant="secondary" className="text-xs">Gas</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/app/items/1">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600" />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to="/app/items/2"
                    className="font-medium hover:underline"
                  >
                    2023 Toyota Camry SE
                  </Link>
                  <div className="text-sm text-gray-500">VIN: 4T1G11AK5PU...</div>
                </TableCell>
                <TableCell className="font-medium">$28,450</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">2023</Badge>
                    <Badge variant="secondary" className="text-xs">15,342 mi</Badge>
                    <Badge variant="secondary" className="text-xs">Hybrid</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/app/items/2">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-red-400 to-red-600" />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to="/app/items/3"
                    className="font-medium hover:underline"
                  >
                    2024 Honda CR-V EX
                  </Link>
                  <div className="text-sm text-gray-500">VIN: 2HKRS3H74PH...</div>
                </TableCell>
                <TableCell className="font-medium">$34,200</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">2024</Badge>
                    <Badge variant="secondary" className="text-xs">5,120 mi</Badge>
                    <Badge variant="secondary" className="text-xs">Gas</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">
                  <span className="flex items-center gap-1">
                    2 hours ago
                    <Badge className="bg-blue-600 text-white text-xs">New</Badge>
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/app/items/3">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600" />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to="/app/items/4"
                    className="font-medium hover:underline text-gray-500"
                  >
                    2022 Chevrolet Silverado LT
                  </Link>
                  <div className="text-sm text-gray-400">VIN: 1GCUYDED2NZ...</div>
                </TableCell>
                <TableCell className="font-medium text-gray-500">$38,900</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1 opacity-60">
                    <Badge variant="secondary" className="text-xs">2022</Badge>
                    <Badge variant="secondary" className="text-xs">42,891 mi</Badge>
                    <Badge variant="secondary" className="text-xs">Diesel</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">3 days ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200">
                    Removed
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/app/items/4">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-purple-600" />
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to="/app/items/5"
                    className="font-medium hover:underline"
                  >
                    2024 Mazda CX-5 Touring
                  </Link>
                  <div className="text-sm text-gray-500">VIN: JM3KFBCM0P0...</div>
                </TableCell>
                <TableCell className="font-medium">$31,750</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">2024</Badge>
                    <Badge variant="secondary" className="text-xs">2,450 mi</Badge>
                    <Badge variant="secondary" className="text-xs">Gas</Badge>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/app/items/5">
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
