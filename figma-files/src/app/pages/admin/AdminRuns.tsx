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
import { Search } from "lucide-react";

export function AdminRuns() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Runs & Automations</h1>
        <p className="text-sm text-gray-600">Global run log across all customers</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Total Runs (24h)</div>
            <div className="text-2xl font-semibold">342</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Successful</div>
            <div className="text-2xl font-semibold text-green-600">319</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Failed</div>
            <div className="text-2xl font-semibold text-red-600">23</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Success Rate</div>
            <div className="text-2xl font-semibold">93.3%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by customer name or run ID..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all-status">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All statuses</SelectItem>
                <SelectItem value="success">Success only</SelectItem>
                <SelectItem value="failed">Failed only</SelectItem>
                <SelectItem value="running">Running</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-trigger">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-trigger">All triggers</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="api">API</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Run ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="w-36">Started</TableHead>
                <TableHead>Trigger</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="text-sm">
                <TableCell className="font-mono text-xs">run_abc123</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/1" className="text-blue-600 hover:underline">
                    Acme Motors
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 12:15 PM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Manual</Badge>
                </TableCell>
                <TableCell className="text-gray-600">4m 32s</TableCell>
                <TableCell className="text-right font-medium">247</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/1">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-red-50">
                <TableCell className="font-mono text-xs">run_def456</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/2" className="text-blue-600 hover:underline">
                    Best Auto Sales
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 12:00 PM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                </TableCell>
                <TableCell className="text-gray-600">2m 14s</TableCell>
                <TableCell className="text-right font-medium">312</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Failed
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/2">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-mono text-xs">run_ghi789</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/4" className="text-blue-600 hover:underline">
                    Summit Auto Group
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 11:45 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                </TableCell>
                <TableCell className="text-gray-600">5m 8s</TableCell>
                <TableCell className="text-right font-medium">418</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/3">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-mono text-xs">run_jkl012</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/5" className="text-blue-600 hover:underline">
                    Valley Motors
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 11:30 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Manual</Badge>
                </TableCell>
                <TableCell className="text-gray-600">3m 42s</TableCell>
                <TableCell className="text-right font-medium">183</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/4">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm bg-red-50">
                <TableCell className="font-mono text-xs">run_mno345</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/3" className="text-blue-600 hover:underline">
                    Quality Cars Inc
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 11:15 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                </TableCell>
                <TableCell className="text-gray-600">1m 2s</TableCell>
                <TableCell className="text-right font-medium">0</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 text-xs">
                    Failed
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/5">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-mono text-xs">run_pqr678</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/7" className="text-blue-600 hover:underline">
                    Elite Motors LLC
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 11:00 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                </TableCell>
                <TableCell className="text-gray-600">6m 15s</TableCell>
                <TableCell className="text-right font-medium">521</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/6">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow className="text-sm">
                <TableCell className="font-mono text-xs">run_stu901</TableCell>
                <TableCell className="font-medium">
                  <Link to="/admin/customers/8" className="text-blue-600 hover:underline">
                    Metro Cars
                  </Link>
                </TableCell>
                <TableCell className="text-gray-600">Feb 1, 10:45 AM</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">Scheduled</Badge>
                </TableCell>
                <TableCell className="text-gray-600">2m 58s</TableCell>
                <TableCell className="text-right font-medium">142</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                    Success
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link to="/admin/runs/7">
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="text-gray-600">Showing 1-7 of 342 runs (24h)</div>
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
