import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { 
  CheckCircle2, 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  Target,
  Clock,
  ExternalLink,
  Sparkles,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router";

export function Dashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock data - in production this comes from API
  const status = "running"; // "running" | "attention"
  const lastSync = "2 hours ago";
  const activeInventory = 247;
  
  const metrics = {
    impressions: "127,430",
    clicks: "3,847",
    ctr: "3.02%",
    reach: "28,934"
  };

  const creditsRemaining = "8,240";
  const estimatedRunway = "14";
  const runwayLow = parseInt(estimatedRunway) < 7;

  const performanceGood = true; // Based on CTR threshold
  const hasNewInventory = true;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {lang === "sv" ? "Översikt" : "Overview"}
          </h1>
          <p className="text-sm text-gray-600">
            {lang === "sv" ? "Din automationssammanfattning" : "Your automation summary"}
          </p>
        </div>

        {/* STATUS HERO CARD */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {status === "running" ? (
                  <Badge 
                    className="gap-2 px-3 py-1.5 font-medium"
                    style={{ 
                      background: "#d1fae5",
                      color: "#065f46",
                      border: "1px solid #a7f3d0"
                    }}
                  >
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                    {lang === "sv" ? "Aktiv" : "Active"}
                  </Badge>
                ) : (
                  <Badge 
                    className="gap-2 px-3 py-1.5 font-medium"
                    style={{ 
                      background: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #fde68a"
                    }}
                  >
                    <AlertCircle className="w-4 h-4" />
                    {lang === "sv" ? "Uppmärksamhet behövs" : "Attention needed"}
                  </Badge>
                )}
                <div className="text-sm text-gray-600">
                  {activeInventory} {lang === "sv" ? "objekt" : "items"} • {lang === "sv" ? "Senaste synk:" : "Last sync:"} {lastSync}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PERFORMANCE METRICS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              {lang === "sv" ? "Prestanda" : "Performance"}
            </h2>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">
                  {lang === "sv" ? "7 dagar" : "7 days"}
                </SelectItem>
                <SelectItem value="30d">
                  {lang === "sv" ? "30 dagar" : "30 days"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Impressions */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {metrics.impressions}
                </div>
                <div className="text-xs text-gray-600">
                  {lang === "sv" ? "Visningar" : "Impressions"}
                </div>
              </CardContent>
            </Card>

            {/* Clicks */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {metrics.clicks}
                </div>
                <div className="text-xs text-gray-600">
                  {lang === "sv" ? "Klick" : "Clicks"}
                </div>
              </CardContent>
            </Card>

            {/* CTR */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {metrics.ctr}
                </div>
                <div className="text-xs text-gray-600">CTR</div>
              </CardContent>
            </Card>

            {/* Reach */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-4 text-center">
                <div className="text-xl font-semibold text-gray-900 mb-1">
                  {metrics.reach}
                </div>
                <div className="text-xs text-gray-600">
                  {lang === "sv" ? "Räckvidd" : "Reach"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SMART SUGGESTIONS */}
        {hasNewInventory && (
          <Card 
            className="border"
            style={{
              background: "#dbeafe",
              borderColor: "#93c5fd"
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {lang === "sv" 
                      ? "12 nya objekt upptäckta"
                      : "12 new items detected"}
                  </p>
                  <p className="text-sm text-blue-800 mt-0.5">
                    {lang === "sv" 
                      ? "Synkronisera nu för att annonsera dem"
                      : "Sync now to advertise them"}
                  </p>
                </div>
                <Link to="/app/inventory">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    style={{
                      background: "white",
                      borderColor: "#93c5fd",
                      color: "#1e40af"
                    }}
                  >
                    {lang === "sv" ? "Visa" : "View"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {performanceGood && !hasNewInventory && (
          <Card 
            className="border"
            style={{
              background: "#d1fae5",
              borderColor: "#a7f3d0"
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">
                    {lang === "sv" ? "Bra prestanda" : "Good performance"}
                  </p>
                  <p className="text-sm text-green-800 mt-0.5">
                    {lang === "sv" 
                      ? "Din CTR är över snittet. Överväg att öka budgeten för fler leads."
                      : "Your CTR is above average. Consider increasing budget for more leads."}
                  </p>
                </div>
                <Link to="/app/billing">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="gap-1"
                    style={{
                      background: "white",
                      borderColor: "#a7f3d0",
                      color: "#065f46"
                    }}
                  >
                    {lang === "sv" ? "Öka budget" : "Increase"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BOTTOM CARDS ROW */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* CREDITS */}
          <Card 
            className="border-2"
            style={{
              background: runwayLow 
                ? "#fef3c7"
                : "white",
              borderColor: runwayLow ? "#fde68a" : "#e5e7eb"
            }}
          >
            <CardContent className="p-5">
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Krediter kvar" : "Credits remaining"}
                </div>
                <div className="text-2xl font-semibold text-gray-900">
                  {creditsRemaining} <span className="text-base text-gray-600">SEK</span>
                </div>
                <div className={`text-sm mt-1 ${runwayLow ? "text-amber-700 font-medium" : "text-gray-600"}`}>
                  ≈ {estimatedRunway} {lang === "sv" ? "dagar kvar" : "days remaining"}
                </div>
              </div>
              <Link to="/app/billing">
                <Button 
                  size="sm"
                  className="gap-2"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  {lang === "sv" ? "Fyll på" : "Top up"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* STATUS */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-5">
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">
                  {lang === "sv" ? "Status" : "Status"}
                </div>
                <div className="text-base font-medium text-gray-900 mb-1">
                  {status === "running" 
                    ? (lang === "sv" ? "Kampanj aktiv" : "Campaign active")
                    : (lang === "sv" ? "Kampanj pausad" : "Campaign paused")}
                </div>
                <div className="text-sm text-gray-600">
                  {lang === "sv" ? "Synk:" : "Sync:"} {lastSync}
                </div>
              </div>
              <Link to="/app/ads">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  {lang === "sv" ? "Visa annonser" : "View ads"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}