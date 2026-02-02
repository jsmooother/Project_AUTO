import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { ArrowLeft, ExternalLink, Calendar } from "lucide-react";

export function ItemDetail() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <Link to="/app/items">
          <Button variant="ghost" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Items
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardContent className="pt-6">
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-lg">
                Main Image
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-blue-300 to-blue-500 rounded cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Normalized Fields */}
          <Card>
            <CardHeader>
              <CardTitle>Normalized fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Title</div>
                  <div className="font-medium">2024 Ford F-150 XL</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Price</div>
                  <div className="font-medium">$42,995</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Year</div>
                  <div className="font-medium">2024</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Make</div>
                  <div className="font-medium">Ford</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Model</div>
                  <div className="font-medium">F-150</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Trim</div>
                  <div className="font-medium">XL</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Mileage</div>
                  <div className="font-medium">1,247 mi</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Fuel Type</div>
                  <div className="font-medium">Gasoline</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Transmission</div>
                  <div className="font-medium">Automatic</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Exterior Color</div>
                  <div className="font-medium">Oxford White</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Interior Color</div>
                  <div className="font-medium">Medium Earth Gray</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">VIN</div>
                  <div className="font-medium font-mono text-sm">1FTFW1E5XPF123456</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Stock Number</div>
                  <div className="font-medium">P123456</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Image Count</div>
                  <div className="font-medium">24 photos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Raw Attributes */}
          <Accordion type="single" collapsible>
            <AccordionItem value="raw" className="border rounded-lg px-4">
              <AccordionTrigger className="text-base font-semibold">
                Raw attributes (JSON)
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="border rounded-lg bg-gray-50 p-4 font-mono text-sm">
                  <pre className="text-gray-800 overflow-x-auto">
{`{
  "title": "2024 Ford F-150 XL",
  "price": 42995,
  "year": 2024,
  "make": "Ford",
  "model": "F-150",
  "trim": "XL",
  "mileage": 1247,
  "fuel_type": "Gasoline",
  "transmission": "Automatic",
  "exterior_color": "Oxford White",
  "interior_color": "Medium Earth Gray",
  "vin": "1FTFW1E5XPF123456",
  "stock_number": "P123456",
  "description": "This 2024 Ford F-150 XL is in excellent condition...",
  "features": [
    "Bluetooth",
    "Backup Camera",
    "Cruise Control",
    "Power Windows",
    "Power Locks"
  ],
  "images": [
    "https://yoursite.com/images/123456-1.jpg",
    "https://yoursite.com/images/123456-2.jpg"
  ]
}`}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            </CardContent>
          </Card>

          {/* Lifecycle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lifecycle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">First seen</div>
                  <div className="font-medium text-sm">Jan 28, 2026 2:15 PM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Last seen</div>
                  <div className="font-medium text-sm">Feb 1, 2026 12:15 PM</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm text-gray-600">Removed at</div>
                  <div className="font-medium text-sm text-gray-400">—</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Data source</div>
                <Link to="/app/data-sources/1" className="text-sm font-medium text-blue-600 hover:underline">
                  Main Inventory
                </Link>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Source URL</div>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1 break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  yoursite.com/inventory/2024-ford-f150-xl-123456
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>
                Include in Always On
                <span className="ml-auto text-xs text-gray-400">(Future)</span>
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                Exclude from Campaigns
                <span className="ml-auto text-xs text-gray-400">(Future)</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
