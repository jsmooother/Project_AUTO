import { useState } from "react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Target,
  Download,
} from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";

export function PerformanceNew() {
  const { lang } = useLanguage();
  const [timeRange, setTimeRange] = useState("30d");

  // Mock data for charts
  const performanceData = [
    { date: "1 Feb", impressions: 18234, clicks: 547, ctr: 3.0 },
    { date: "2 Feb", impressions: 21456, clicks: 673, ctr: 3.1 },
    { date: "3 Feb", impressions: 19876, clicks: 615, ctr: 3.1 },
    { date: "4 Feb", impressions: 23567, clicks: 731, ctr: 3.1 },
    { date: "5 Feb", impressions: 20987, clicks: 650, ctr: 3.1 },
    { date: "6 Feb", impressions: 22345, clicks: 695, ctr: 3.1 },
  ];

  const topPerformers = [
    { id: "1", name: "Volvo XC90 2024", impressions: 4532, clicks: 156, ctr: 3.44 },
    { id: "2", name: "BMW X5 2023", impressions: 3987, clicks: 134, ctr: 3.36 },
    { id: "3", name: "Mercedes GLE 2024", impressions: 4123, clicks: 137, ctr: 3.32 },
    { id: "4", name: "Audi Q7 2023", impressions: 3654, clicks: 118, ctr: 3.23 },
    { id: "5", name: "Tesla Model Y 2024", impressions: 5234, clicks: 167, ctr: 3.19 },
  ];

  // Summary metrics
  const metrics = {
    impressions: { value: "127,430", change: "+12.3%", trend: "up" },
    clicks: { value: "3,847", change: "+8.7%", trend: "up" },
    ctr: { value: "3.02%", change: "+0.2%", trend: "up" },
    reach: { value: "28,934", change: "+15.4%", trend: "up" },
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {lang === "sv" ? "Prestanda" : "Performance"}
            </h1>
            <p className="text-sm text-gray-600">
              {lang === "sv" ? "Detaljerad analys av dina annonser" : "Detailed analysis of your ads"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">
                  {lang === "sv" ? "7 dagar" : "7 days"}
                </SelectItem>
                <SelectItem value="30d">
                  {lang === "sv" ? "30 dagar" : "30 days"}
                </SelectItem>
                <SelectItem value="90d">
                  {lang === "sv" ? "90 dagar" : "90 days"}
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              {lang === "sv" ? "Exportera" : "Export"}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {/* Impressions */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-600" />
              </div>
              {metrics.impressions.trend === "up" ? (
                <Badge
                  style={{
                    background: "#d1fae5",
                    color: "#065f46",
                    border: "1px solid #a7f3d0",
                  }}
                  className="gap-1"
                >
                  <TrendingUp className="h-3 w-3" />
                  {metrics.impressions.change}
                </Badge>
              ) : (
                <Badge
                  style={{
                    background: "#fee2e2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                  }}
                  className="gap-1"
                >
                  <TrendingDown className="h-3 w-3" />
                  {metrics.impressions.change}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.impressions.value}
            </div>
            <div className="text-sm text-gray-600">
              {lang === "sv" ? "Visningar" : "Impressions"}
            </div>
          </CardContent>
        </Card>

        {/* Clicks */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <MousePointerClick className="h-5 w-5 text-purple-600" />
              </div>
              <Badge
                style={{
                  background: "#d1fae5",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                }}
                className="gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {metrics.clicks.change}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.clicks.value}
            </div>
            <div className="text-sm text-gray-600">
              {lang === "sv" ? "Klick" : "Clicks"}
            </div>
          </CardContent>
        </Card>

        {/* CTR */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <Badge
                style={{
                  background: "#d1fae5",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                }}
                className="gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {metrics.ctr.change}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.ctr.value}
            </div>
            <div className="text-sm text-gray-600">CTR</div>
          </CardContent>
        </Card>

        {/* Reach */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <Badge
                style={{
                  background: "#d1fae5",
                  color: "#065f46",
                  border: "1px solid #a7f3d0",
                }}
                className="gap-1"
              >
                <TrendingUp className="h-3 w-3" />
                {metrics.reach.change}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {metrics.reach.value}
            </div>
            <div className="text-sm text-gray-600">
              {lang === "sv" ? "Räckvidd" : "Reach"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time Chart */}
      <Card className="border border-gray-200 bg-white mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-6">
            {lang === "sv" ? "Prestanda över tid" : "Performance over time"}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#3b82f6"
                strokeWidth={2}
                name={lang === "sv" ? "Visningar" : "Impressions"}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#8b5cf6"
                strokeWidth={2}
                name={lang === "sv" ? "Klick" : "Clicks"}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* CTR Trend */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">
              {lang === "sv" ? "CTR-trend" : "CTR trend"}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="ctr" fill="#16a34a" radius={[8, 8, 0, 0]} name="CTR %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6">
              {lang === "sv" ? "Bästa prestanda" : "Top performers"}
            </h3>
            <div className="space-y-3">
              {topPerformers.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.impressions.toLocaleString()}{" "}
                        {lang === "sv" ? "visningar" : "impressions"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{item.ctr.toFixed(2)}%</p>
                    <p className="text-xs text-gray-600">
                      {item.clicks} {lang === "sv" ? "klick" : "clicks"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}