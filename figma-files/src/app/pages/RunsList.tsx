import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
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
import { StatusBadge } from "@/app/components/StatusBadge";
import { Badge } from "@/app/components/ui/badge";

export function RunsList() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Runs</h1>
        <p className="text-gray-600">View all probe and sync run history</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
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
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="probe">Probe only</SelectItem>
                <SelectItem value="prod">Production only</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="attention">Needs attention</SelectItem>
                <SelectItem value="failing">Failing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Seen</TableHead>
                <TableHead className="text-right">New</TableHead>
                <TableHead className="text-right">Removed</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Main Inventory</TableCell>
                <TableCell>
                  <Badge variant="outline">Prod</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell className="text-right">247</TableCell>
                <TableCell className="text-right text-green-600 font-medium">12</TableCell>
                <TableCell className="text-right">3</TableCell>
                <TableCell className="text-gray-600">Feb 1, 12:15 PM</TableCell>
                <TableCell className="text-gray-600">4m 32s</TableCell>
                <TableCell>
                  <Link to="/app/runs/1">
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Secondary Inventory</TableCell>
                <TableCell>
                  <Badge variant="outline">Probe</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status="attention" />
                </TableCell>
                <TableCell className="text-right">15</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-gray-600">Feb 1, 9:30 AM</TableCell>
                <TableCell className="text-gray-600">1m 18s</TableCell>
                <TableCell>
                  <Link to="/app/runs/2">
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Main Inventory</TableCell>
                <TableCell>
                  <Badge variant="outline">Prod</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell className="text-right">238</TableCell>
                <TableCell className="text-right text-green-600 font-medium">8</TableCell>
                <TableCell className="text-right">2</TableCell>
                <TableCell className="text-gray-600">Jan 31, 2:00 AM</TableCell>
                <TableCell className="text-gray-600">4m 15s</TableCell>
                <TableCell>
                  <Link to="/app/runs/3">
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Premium Listings</TableCell>
                <TableCell>
                  <Badge variant="outline">Prod</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell className="text-right">42</TableCell>
                <TableCell className="text-right text-green-600 font-medium">3</TableCell>
                <TableCell className="text-right">1</TableCell>
                <TableCell className="text-gray-600">Jan 31, 2:00 AM</TableCell>
                <TableCell className="text-gray-600">1m 42s</TableCell>
                <TableCell>
                  <Link to="/app/runs/4">
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Main Inventory</TableCell>
                <TableCell>
                  <Badge variant="outline">Prod</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell className="text-right">235</TableCell>
                <TableCell className="text-right text-green-600 font-medium">5</TableCell>
                <TableCell className="text-right">3</TableCell>
                <TableCell className="text-gray-600">Jan 30, 2:00 AM</TableCell>
                <TableCell className="text-gray-600">4m 8s</TableCell>
                <TableCell>
                  <Link to="/app/runs/5">
                    <Button variant="ghost" size="sm">
                      Open
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Premium Listings</TableCell>
                <TableCell>
                  <Badge variant="outline">Prod</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell className="text-right">40</TableCell>
                <TableCell className="text-right text-green-600 font-medium">2</TableCell>
                <TableCell className="text-right">0</TableCell>
                <TableCell className="text-gray-600">Jan 30, 2:00 AM</TableCell>
                <TableCell className="text-gray-600">1m 35s</TableCell>
                <TableCell>
                  <Link to="/app/runs/6">
                    <Button variant="ghost" size="sm">
                      Open
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
