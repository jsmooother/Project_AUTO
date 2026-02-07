import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import {
  Package,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";

interface InventoryItem {
  id: string;
  name: string;
  status: "eligible" | "ineligible" | "pending";
  reason?: string;
  lastUpdated: string;
  price: string;
  url: string;
}

export function InventoryNew() {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "eligible" | "ineligible">("all");

  // Mock data
  const lastSync = "2 hours ago";
  const totalItems = 247;
  const eligibleItems = 235;
  const ineligibleItems = 12;

  const inventoryItems: InventoryItem[] = [
    {
      id: "1",
      name: "Volvo XC90 T8 Inscription 2024",
      status: "eligible",
      lastUpdated: "2h ago",
      price: "789,000 SEK",
      url: "https://example.com/volvo-xc90",
    },
    {
      id: "2",
      name: "BMW X5 xDrive40i M Sport 2023",
      status: "eligible",
      lastUpdated: "2h ago",
      price: "845,000 SEK",
      url: "https://example.com/bmw-x5",
    },
    {
      id: "3",
      name: "Mercedes-Benz GLE 450 AMG 2024",
      status: "eligible",
      lastUpdated: "2h ago",
      price: "925,000 SEK",
      url: "https://example.com/mercedes-gle",
    },
    {
      id: "4",
      name: "Audi Q7 55 TFSI e quattro S line 2023",
      status: "ineligible",
      reason: lang === "sv" ? "Saknar pris" : "Missing price",
      lastUpdated: "2h ago",
      price: "-",
      url: "https://example.com/audi-q7",
    },
    {
      id: "5",
      name: "Tesla Model Y Long Range 2024",
      status: "eligible",
      lastUpdated: "2h ago",
      price: "659,000 SEK",
      url: "https://example.com/tesla-model-y",
    },
    {
      id: "6",
      name: "Porsche Cayenne E-Hybrid 2024",
      status: "eligible",
      lastUpdated: "3h ago",
      price: "1,125,000 SEK",
      url: "https://example.com/porsche-cayenne",
    },
    {
      id: "7",
      name: "Range Rover Sport P400e HSE 2023",
      status: "ineligible",
      reason: lang === "sv" ? "Saknar bild" : "Missing image",
      lastUpdated: "3h ago",
      price: "1,245,000 SEK",
      url: "https://example.com/range-rover",
    },
    {
      id: "8",
      name: "BMW iX xDrive50 2024",
      status: "eligible",
      lastUpdated: "4h ago",
      price: "995,000 SEK",
      url: "https://example.com/bmw-ix",
    },
  ];

  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "eligible" && item.status === "eligible") ||
      (filterStatus === "ineligible" && item.status === "ineligible");
    return matchesSearch && matchesFilter;
  });

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  const toggleItemEligibility = (itemId: string) => {
    console.log("Toggle eligibility for item:", itemId);
    // In production, this would update the item's status via API
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">
          {lang === "sv" ? "Inventering" : "Inventory"}
        </h1>
        <p className="text-sm text-gray-600">
          {lang === "sv" ? "Hantera dina produkter och deras status" : "Manage your products and their status"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Totalt" : "Total items"}
                </div>
                <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>
                {lang === "sv" ? "Uppdaterad" : "Updated"} {lastSync}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Berättigad" : "Eligible"}
                </div>
                <div className="text-3xl font-bold text-green-600">{eligibleItems}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-3">
              {((eligibleItems / totalItems) * 100).toFixed(1)}%{" "}
              {lang === "sv" ? "av total" : "of total"}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Ogiltig" : "Ineligible"}
                </div>
                <div className="text-3xl font-bold text-amber-600">{ineligibleItems}</div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-3">
              {lang === "sv" ? "Kräver åtgärd" : "Requires action"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card className="border border-gray-200 bg-white mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={lang === "sv" ? "Sök produkter..." : "Search products..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("all")}
                >
                  {lang === "sv" ? "Alla" : "All"}
                </Button>
                <Button
                  variant={filterStatus === "eligible" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("eligible")}
                >
                  {lang === "sv" ? "Berättigad" : "Eligible"}
                </Button>
                <Button
                  variant={filterStatus === "ineligible" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus("ineligible")}
                >
                  {lang === "sv" ? "Ogiltig" : "Ineligible"}
                </Button>
              </div>
            </div>

            {/* Sync Button */}
            <Button
              onClick={handleSync}
              disabled={isSyncing}
              className="gap-2"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing
                ? lang === "sv"
                  ? "Synkroniserar..."
                  : "Syncing..."
                : lang === "sv"
                ? "Synkronisera"
                : "Sync"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-6">
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      item.status === "eligible"
                        ? "bg-green-50"
                        : item.status === "ineligible"
                        ? "bg-amber-50"
                        : "bg-gray-50"
                    }`}
                  >
                    {item.status === "eligible" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : item.status === "ineligible" ? (
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-600" />
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-600">{item.price}</p>
                      {item.reason && (
                        <>
                          <span className="text-gray-300">•</span>
                          <p className="text-sm text-amber-600">{item.reason}</p>
                        </>
                      )}
                      <span className="text-gray-300">•</span>
                      <p className="text-xs text-gray-500">{item.lastUpdated}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    style={{
                      background:
                        item.status === "eligible"
                          ? "#d1fae5"
                          : item.status === "ineligible"
                          ? "#fef3c7"
                          : "#f3f4f6",
                      color:
                        item.status === "eligible"
                          ? "#065f46"
                          : item.status === "ineligible"
                          ? "#92400e"
                          : "#6b7280",
                      border:
                        item.status === "eligible"
                          ? "1px solid #a7f3d0"
                          : item.status === "ineligible"
                          ? "1px solid #fde68a"
                          : "1px solid #d1d5db",
                    }}
                  >
                    {item.status === "eligible"
                      ? lang === "sv"
                        ? "Berättigad"
                        : "Eligible"
                      : item.status === "ineligible"
                      ? lang === "sv"
                        ? "Ogiltig"
                        : "Ineligible"
                      : lang === "sv"
                      ? "Väntar"
                      : "Pending"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-6">
                  {/* Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {lang === "sv" ? "Annonsera" : "Advertise"}
                    </span>
                    <Switch
                      checked={item.status === "eligible"}
                      onCheckedChange={() => toggleItemEligibility(item.id)}
                    />
                  </div>

                  {/* View Link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {lang === "sv" ? "Inga produkter hittades" : "No products found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}