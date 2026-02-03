import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
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
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe,
  Palette,
  Package,
  Rocket,
  Target,
  DollarSign,
  Square,
  Smartphone,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Clock,
  ExternalLink,
  Copy,
} from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

type RunStatus = "success" | "running" | "failed" | "queued";

interface Run {
  id: string;
  type: string;
  status: RunStatus;
  started_at: string;
  finished_at: string | null;
  error_message: string | null;
}

export function Ads() {
  // System state
  const websiteConnected = true;
  const inventoryCount = 247;
  const metaConnected = true;
  const templatesApproved = true;
  const adsLaunched = true; // Set to true to show active campaign state
  const campaignPaused = false;

  const isReady = websiteConnected && inventoryCount > 0 && metaConnected && templatesApproved;

  // UI state
  const [prerequisitesExpanded, setPrerequisitesExpanded] = useState(!isReady);
  const [configExpanded, setConfigExpanded] = useState(!adsLaunched);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "bold" | "minimal" | "modern">("modern");
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  // Form state
  const [geoMode, setGeoMode] = useState<"radius" | "regions">("radius");
  const [radiusKm, setRadiusKm] = useState("30");
  const [centerCity, setCenterCity] = useState("Stockholm");
  const [selectedRegions, setSelectedRegions] = useState<string[]>(["Stockholm", "Göteborg"]);
  const [formatFeed, setFormatFeed] = useState(true);
  const [formatReels, setFormatReels] = useState(true);
  const [ctaType, setCtaType] = useState("learn_more");
  const [budgetOverride, setBudgetOverride] = useState("");

  const defaultBudget = { amount: 15000, currency: "SEK" };
  const availableRegions = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg"];

  // Mock recent runs
  const recentRuns: Run[] = [
    {
      id: "run_847562",
      type: "ADS_SYNC",
      status: "success",
      started_at: "2026-02-03T10:30:00Z",
      finished_at: "2026-02-03T10:32:15Z",
      error_message: null,
    },
    {
      id: "run_847561",
      type: "ADS_PUBLISH",
      status: "success",
      started_at: "2026-02-02T14:15:00Z",
      finished_at: "2026-02-02T14:18:42Z",
      error_message: null,
    },
    {
      id: "run_847559",
      type: "ADS_SYNC",
      status: "failed",
      started_at: "2026-02-01T08:00:00Z",
      finished_at: "2026-02-01T08:01:12Z",
      error_message: "Meta API rate limit exceeded. Will retry in 1 hour.",
    },
  ];

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const handleLaunch = () => {
    console.log("Launching campaign...");
    // In production: POST to /api/ads/launch
  };

  const handleSaveConfig = () => {
    console.log("Saving configuration...");
    setConfigExpanded(false);
  };

  const getStatusBadge = (status: RunStatus) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-600">Success</Badge>;
      case "running":
        return <Badge className="bg-blue-600">Running</Badge>;
      case "failed":
        return <Badge className="bg-red-600">Failed</Badge>;
      case "queued":
        return <Badge variant="outline">Queued</Badge>;
    }
  };

  const getStatusIcon = (status: RunStatus) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "running":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "queued":
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("sv-SE", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight mb-2">Ads</h1>
            <p className="text-gray-600">
              Automated Meta advertising for your vehicle inventory
            </p>
          </div>
          {adsLaunched && (
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 text-base px-4 py-2">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Campaign Active
              </Badge>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[
            { label: "Prerequisites", done: isReady },
            { label: "Configuration", done: adsLaunched },
            { label: "Live", done: adsLaunched },
          ].map((step, idx) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    step.done
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                </div>
                <span className={`text-sm font-medium ${step.done ? "text-green-600" : "text-gray-600"}`}>
                  {step.label}
                </span>
              </div>
              {idx < 2 && (
                <div className={`h-0.5 w-12 ${step.done ? "bg-green-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Prerequisites Section */}
        <Card className={!isReady ? "border-yellow-200 bg-yellow-50" : "border-gray-200"}>
          <CardHeader>
            <button
              onClick={() => setPrerequisitesExpanded(!prerequisitesExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isReady ? "bg-green-100" : "bg-yellow-100"
                }`}>
                  {isReady ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">1. Prerequisites</CardTitle>
                  <CardDescription>
                    {isReady ? "All systems ready" : "Complete setup to continue"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isReady ? (
                  <Badge className="bg-green-600">Complete</Badge>
                ) : (
                  <Badge className="bg-yellow-600">Action Required</Badge>
                )}
                {prerequisitesExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
          </CardHeader>

          {prerequisitesExpanded && (
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {/* Website */}
                <div className={`p-4 rounded-lg border-2 ${
                  websiteConnected ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className={`h-4 w-4 ${websiteConnected ? "text-green-600" : "text-gray-400"}`} />
                    <span className="font-medium text-sm">Website</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {websiteConnected ? `${inventoryCount} items` : "Not connected"}
                  </p>
                  {!websiteConnected && (
                    <Link to="/app/settings">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        Connect
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Meta */}
                <div className={`p-4 rounded-lg border-2 ${
                  metaConnected ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <MetaIcon className={`h-4 w-4 ${metaConnected ? "text-blue-600" : "text-gray-400"}`} />
                    <span className="font-medium text-sm">Meta</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {metaConnected ? "Connected" : "Not connected"}
                  </p>
                  {!metaConnected && (
                    <Link to="/app/settings">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        Connect
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Templates */}
                <div className={`p-4 rounded-lg border-2 ${
                  templatesApproved ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className={`h-4 w-4 ${templatesApproved ? "text-purple-600" : "text-gray-400"}`} />
                    <span className="font-medium text-sm">Templates</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {templatesApproved ? "Approved" : "Needs approval"}
                  </p>
                  {!templatesApproved && (
                    <Link to="/app/templates">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        Approve
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Inventory */}
                <div className={`p-4 rounded-lg border-2 ${
                  inventoryCount > 0 ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Package className={`h-4 w-4 ${inventoryCount > 0 ? "text-orange-600" : "text-gray-400"}`} />
                    <span className="font-medium text-sm">Inventory</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {inventoryCount > 0 ? `${inventoryCount} items` : "No items"}
                  </p>
                  {inventoryCount === 0 && (
                    <Link to="/app/automation">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        Run Crawl
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 2. Template Selection */}
        <Card className={!isReady ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Palette className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">2. Ad Template</CardTitle>
                <CardDescription>Choose how your ads will look</CardDescription>
              </div>
              <Link to="/app/templates">
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Edit in Templates
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {(["classic", "bold", "minimal", "modern"] as const).map((template) => (
                <button
                  key={template}
                  onClick={() => setSelectedTemplate(template)}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template
                      ? "border-purple-600 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedTemplate === template && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-5 w-5 text-purple-600" />
                    </div>
                  )}
                  <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-xs">
                    Preview
                  </div>
                  <div className="font-medium text-sm capitalize">{template}</div>
                  <div className="text-xs text-gray-600">
                    {template === "classic" && "Balanced & clear"}
                    {template === "bold" && "High contrast"}
                    {template === "minimal" && "Clean design"}
                    {template === "modern" && "Gradient style"}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. Configuration */}
        <Card className={!isReady ? "opacity-50 pointer-events-none" : ""}>
          <CardHeader>
            <button
              onClick={() => setConfigExpanded(!configExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">3. Ad Configuration</CardTitle>
                  <CardDescription>
                    {configExpanded
                      ? "Set targeting, formats, and budget"
                      : `${geoMode === "radius" ? `${centerCity}, ${radiusKm} km` : `${selectedRegions.length} regions`} • ${[formatFeed && "Feed", formatReels && "Reels"].filter(Boolean).join(", ")} • ${budgetOverride || defaultBudget.amount.toLocaleString()} ${defaultBudget.currency}/mo`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {adsLaunched && <Badge className="bg-green-600">Configured</Badge>}
                {configExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>
          </CardHeader>

          {configExpanded && (
            <CardContent className="space-y-6">
              {/* Geo Targeting */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Geographic Targeting</Label>
                <RadioGroup
                  value={geoMode}
                  onValueChange={(value) => setGeoMode(value as "radius" | "regions")}
                  className="space-y-3"
                >
                  <div className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    geoMode === "radius" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                  }`} onClick={() => setGeoMode("radius")}>
                    <RadioGroupItem value="radius" id="geo-radius" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="geo-radius" className="font-medium cursor-pointer mb-2 block">
                        Radius around location
                      </Label>
                      {geoMode === "radius" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            value={centerCity}
                            onChange={(e) => setCenterCity(e.target.value)}
                            placeholder="Stockholm"
                          />
                          <Select value={radiusKm} onValueChange={setRadiusKm}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 km</SelectItem>
                              <SelectItem value="20">20 km</SelectItem>
                              <SelectItem value="30">30 km</SelectItem>
                              <SelectItem value="50">50 km</SelectItem>
                              <SelectItem value="75">75 km</SelectItem>
                              <SelectItem value="100">100 km</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                    geoMode === "regions" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                  }`} onClick={() => setGeoMode("regions")}>
                    <RadioGroupItem value="regions" id="geo-regions" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="geo-regions" className="font-medium cursor-pointer mb-2 block">
                        Select regions/cities
                      </Label>
                      {geoMode === "regions" && (
                        <div className="flex flex-wrap gap-2">
                          {availableRegions.map((region) => (
                            <Badge
                              key={region}
                              variant={selectedRegions.includes(region) ? "default" : "outline"}
                              className={`cursor-pointer ${
                                selectedRegions.includes(region)
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => toggleRegion(region)}
                            >
                              {region}
                              {selectedRegions.includes(region) && (
                                <X className="h-3 w-3 ml-1" />
                              )}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Formats & CTA Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Formats */}
                <div>
                  <Label className="text-sm font-semibold mb-3 block">Ad Formats</Label>
                  <div className="space-y-2">
                    <div
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                        formatFeed ? "border-blue-600 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setFormatFeed(!formatFeed)}
                    >
                      <Checkbox checked={formatFeed} onCheckedChange={setFormatFeed} />
                      <Square className="h-4 w-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Feed (Square)</div>
                        <div className="text-xs text-gray-600">Facebook & Instagram</div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer ${
                        formatReels ? "border-blue-600 bg-blue-50" : "border-gray-200"
                      }`}
                      onClick={() => setFormatReels(!formatReels)}
                    >
                      <Checkbox checked={formatReels} onCheckedChange={setFormatReels} />
                      <Smartphone className="h-4 w-4 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">Reels (Vertical)</div>
                        <div className="text-xs text-gray-600">Stories & Reels</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div>
                  <Label htmlFor="cta" className="text-sm font-semibold mb-3 block">
                    Call-to-Action
                  </Label>
                  <Select value={ctaType} onValueChange={setCtaType}>
                    <SelectTrigger id="cta">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="learn_more">Learn More</SelectItem>
                      <SelectItem value="call_now">Call Now</SelectItem>
                      <SelectItem value="send_message">Send Message</SelectItem>
                      <SelectItem value="get_offer">Get Offer</SelectItem>
                      <SelectItem value="book_now">Book Now</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">
                    Button shown on all ads
                  </p>
                </div>
              </div>

              {/* Budget */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Monthly Budget
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder={defaultBudget.amount.toString()}
                    value={budgetOverride}
                    onChange={(e) => setBudgetOverride(e.target.value)}
                  />
                  <Input value={defaultBudget.currency} disabled />
                </div>
                <div className="flex items-start gap-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-900">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Default from onboarding: {defaultBudget.amount.toLocaleString()} {defaultBudget.currency}.
                    Override to use different budget for ads.
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setConfigExpanded(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveConfig}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 4. Campaign Controls */}
        <Card className={!isReady ? "opacity-50 pointer-events-none" : "border-2 border-blue-600"}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Rocket className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {!adsLaunched && "Ready to launch your automated ads"}
                    {adsLaunched && !campaignPaused && "Your ads are live on Meta"}
                    {adsLaunched && campaignPaused && "Campaign paused"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {!adsLaunched && "Start running automated ads for all your inventory"}
                    {adsLaunched && !campaignPaused && "Inventory is automatically synced and advertised"}
                    {adsLaunched && campaignPaused && "Resume to continue showing ads"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                {!adsLaunched ? (
                  <Button size="lg" onClick={handleLaunch}>
                    <Rocket className="h-4 w-4 mr-2" />
                    Launch Campaign
                  </Button>
                ) : (
                  <>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Now
                    </Button>
                    <Button variant="outline">
                      {campaignPaused ? (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <PauseCircle className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 5. Campaign Status & Activity */}
        {adsLaunched && (
          <div className="grid grid-cols-3 gap-6">
            {/* Meta Objects */}
            <Card className="col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MetaIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Campaign Status</CardTitle>
                      <CardDescription>Meta ad objects</CardDescription>
                    </div>
                  </div>
                  <a
                    href="https://business.facebook.com/adsmanager"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Meta Ads Manager
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Product Catalog</div>
                      <div className="text-xs text-gray-600">247 items • cat_8472638492</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Campaign</div>
                      <div className="text-xs text-gray-600">Acme Motors - Automated</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    active
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium text-sm">Dynamic Product Ads</div>
                      <div className="text-xs text-gray-600">Feed, Reels • 15,000 SEK/mo</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Last Sync</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>4 hours ago</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Budget Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">3,240 SEK</div>
                  <div className="text-xs text-gray-600 mb-2">of 15,000 SEK</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "21.6%" }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {adsLaunched && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                  <CardDescription>Last automation runs</CardDescription>
                </div>
                <Link to="/app/automation">
                  <Button variant="outline" size="sm">
                    View All Runs
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Run ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRuns.map((run) => (
                    <>
                      <TableRow key={run.id} className="cursor-pointer hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center gap-2">
                            {run.id}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(run.id);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{run.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(run.status)}
                            {getStatusBadge(run.status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatTimestamp(run.started_at)}
                        </TableCell>
                        <TableCell>
                          {run.error_message && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedRun(expandedRun === run.id ? null : run.id)
                              }
                            >
                              {expandedRun === run.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedRun === run.id && run.error_message && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-red-50">
                            <div className="flex items-start gap-3 p-3">
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium text-red-900 mb-1">Error</div>
                                <div className="text-sm text-red-800 font-mono">
                                  {run.error_message}
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300"
                                onClick={() => navigator.clipboard.writeText(run.error_message!)}
                              >
                                <Copy className="h-3 w-3 mr-2" />
                                Copy
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}