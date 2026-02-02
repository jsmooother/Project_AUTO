import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { StatusBadge } from "@/app/components/StatusBadge";
import { ConfidenceScore } from "@/app/components/ConfidenceScore";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Play, Search, Eye, Settings } from "lucide-react";

export function DataSourcesList() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Data Sources</h1>
            <p className="text-gray-600">Manage your website inventory connections</p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Data Source
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All data sources</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Base URL</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Health</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <Link
                    to="/app/data-sources/1"
                    className="font-medium hover:underline"
                  >
                    Main Inventory
                  </Link>
                </TableCell>
                <TableCell>
                  <code className="text-sm text-gray-600">yoursite.com/inventory</code>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-gray-900">sitemap + http</div>
                    <div className="text-gray-500">vehicle extract</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ConfidenceScore score={87} />
                </TableCell>
                <TableCell className="text-gray-600">2 hours ago</TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="Run Probe">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Run Sync">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Link to="/app/items?source=1">
                      <Button variant="ghost" size="sm" title="View Items">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/app/data-sources/1">
                      <Button variant="ghost" size="sm" title="Settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Link
                    to="/app/data-sources/2"
                    className="font-medium hover:underline"
                  >
                    Secondary Inventory
                  </Link>
                </TableCell>
                <TableCell>
                  <code className="text-sm text-gray-600">inventory2.yoursite.com</code>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-gray-900">html_links + headless</div>
                    <div className="text-gray-500">vehicle extract</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ConfidenceScore score={62} />
                </TableCell>
                <TableCell className="text-gray-600">5 hours ago</TableCell>
                <TableCell>
                  <StatusBadge status="attention" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="Run Probe">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Run Sync">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Link to="/app/items?source=2">
                      <Button variant="ghost" size="sm" title="View Items">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/app/data-sources/2">
                      <Button variant="ghost" size="sm" title="Settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <Link
                    to="/app/data-sources/3"
                    className="font-medium hover:underline"
                  >
                    Premium Listings
                  </Link>
                </TableCell>
                <TableCell>
                  <code className="text-sm text-gray-600">yoursite.com/premium</code>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-gray-900">sitemap + http</div>
                    <div className="text-gray-500">vehicle extract</div>
                  </div>
                </TableCell>
                <TableCell>
                  <ConfidenceScore score={91} />
                </TableCell>
                <TableCell className="text-gray-600">1 day ago</TableCell>
                <TableCell>
                  <StatusBadge status="healthy" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" title="Run Probe">
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" title="Run Sync">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Link to="/app/items?source=3">
                      <Button variant="ghost" size="sm" title="View Items">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to="/app/data-sources/3">
                      <Button variant="ghost" size="sm" title="Settings">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
