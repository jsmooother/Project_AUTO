import { useState } from "react";
import { Link, useNavigate } from "react-router";
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
  CheckCircle2,
  AlertTriangle,
  Globe,
  Palette,
  Package,
  Target,
  DollarSign,
  Square,
  Smartphone,
  Info,
  X,
  Rocket,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { AdAccountSelector, type AdAccount } from "@/app/components/AdAccountSelector";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

type SetupStep = 1 | 2 | 3 | 4;

export function AdsSetup() {
  const navigate = useNavigate();
  
  // Mock data - in production, fetch from API
  const websiteConnected = true;
  const inventoryCount = 247;
  const metaConnected = true;
  const templatesApproved = true;

  // Setup wizard state
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [selectedAdAccount, setSelectedAdAccount] = useState<AdAccount | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "bold" | "minimal" | "modern">("modern");
  
  // Configuration state
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

  // Mock ad accounts - in production, fetch from API
  const mockAdAccounts: AdAccount[] = [
    {
      id: "act_123456789",
      name: "Acme Inc. Main Ads",
      account_id: "123456789",
      account_status: 1,
      currency: "SEK",
      timezone_name: "Europe/Stockholm",
    },
    {
      id: "act_987654321",
      name: "Acme Inc. Test Account",
      account_id: "987654321",
      account_status: 1,
      currency: "SEK",
      timezone_name: "Europe/Stockholm",
    },
  ];

  const prerequisites = [
    {
      label: "Website",
      icon: Globe,
      done: websiteConnected,
      value: websiteConnected ? `${inventoryCount} items` : "Not connected",
      link: "/app/settings",
    },
    {
      label: "Meta OAuth",
      icon: MetaIcon,
      done: metaConnected,
      value: metaConnected ? "Connected" : "Not connected",
      link: "/app/settings",
    },
    {
      label: "Templates",
      icon: Palette,
      done: templatesApproved,
      value: templatesApproved ? "Approved" : "Needs approval",
      link: "/app/templates",
    },
    {
      label: "Inventory",
      icon: Package,
      done: inventoryCount > 0,
      value: inventoryCount > 0 ? `${inventoryCount} items` : "No items",
      link: "/app/ads",
    },
  ];

  const allPrerequisitesMet = prerequisites.every((p) => p.done);
  const canProceedFromStep1 = allPrerequisitesMet;
  const canProceedFromStep2 = selectedAdAccount !== null;
  const canProceedFromStep3 = selectedTemplate !== null;

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) =>
      prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]
    );
  };

  const handleLaunch = () => {
    console.log("Launching campaign...");
    // In production: POST to /api/ads/launch
    navigate("/app/ads");
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as SetupStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as SetupStep);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/app/ads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Ads
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Campaign Setup</h1>
        <p className="text-gray-600">
          Set up your first automated ad campaign in 4 simple steps
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Prerequisites" },
            { num: 2, label: "Ad Account" },
            { num: 3, label: "Template & Config" },
            { num: 4, label: "Review & Launch" },
          ].map((step, idx) => (
            <div key={step.num} className="flex items-center flex-1">
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep === step.num
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : currentStep > step.num
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.num ? <CheckCircle2 className="h-5 w-5" /> : step.num}
                </div>
                <div>
                  <div
                    className={`text-sm font-medium ${
                      currentStep >= step.num ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500">Step {step.num} of 4</div>
                </div>
              </div>
              {idx < 3 && (
                <div
                  className={`h-1 flex-1 mx-4 rounded-full ${
                    currentStep > step.num ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Prerequisites */}
      {currentStep === 1 && (
        <Card className={!allPrerequisitesMet ? "border-yellow-200 bg-yellow-50" : ""}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  allPrerequisitesMet ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                {allPrerequisitesMet ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-yellow-600" />
                )}
              </div>
              <div>
                <CardTitle>Prerequisites Check</CardTitle>
                <CardDescription>
                  {allPrerequisitesMet
                    ? "All systems ready to continue"
                    : "Please complete all prerequisites before continuing"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {prerequisites.map((prereq) => {
                const IconComponent = prereq.icon;
                return (
                  <div
                    key={prereq.label}
                    className={`p-4 rounded-lg border-2 ${
                      prereq.done ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <IconComponent
                        className={`h-5 w-5 ${prereq.done ? "text-green-600" : "text-gray-400"}`}
                      />
                      <span className="font-medium">{prereq.label}</span>
                      {prereq.done && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{prereq.value}</p>
                    {!prereq.done && (
                      <Link to={prereq.link}>
                        <Button variant="outline" size="sm" className="w-full">
                          Complete
                        </Button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <Button onClick={() => navigate("/app/ads")} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleNext} disabled={!canProceedFromStep1}>
                Next: Select Ad Account
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Ad Account Selection */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <AdAccountSelector
            state="loaded"
            accounts={mockAdAccounts}
            selectedAccountId={selectedAdAccount?.id}
            onSelect={(account) => setSelectedAdAccount(account)}
            onRefresh={() => console.log("Refreshing accounts...")}
            onReconnect={() => console.log("Reconnecting to Meta...")}
          />

          <div className="flex justify-between gap-3">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceedFromStep2}>
              Next: Configure Campaign
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Template & Configuration */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Palette className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Ad Template</CardTitle>
                  <CardDescription>Choose how your ads will look</CardDescription>
                </div>
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

          {/* Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Campaign Configuration</CardTitle>
                  <CardDescription>Set targeting, formats, and budget</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Geo Targeting */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Geographic Targeting</Label>
                <RadioGroup
                  value={geoMode}
                  onValueChange={(value) => setGeoMode(value as "radius" | "regions")}
                  className="space-y-3"
                >
                  <div
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                      geoMode === "radius" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setGeoMode("radius")}
                  >
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

                  <div
                    className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer ${
                      geoMode === "regions" ? "border-blue-600 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setGeoMode("regions")}
                  >
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
                  <p className="text-xs text-gray-500 mt-2">Button shown on all ads</p>
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
                    Default from onboarding: {defaultBudget.amount.toLocaleString()}{" "}
                    {defaultBudget.currency}. Override to use different budget for ads.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-3">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceedFromStep3}>
              Next: Review & Launch
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Launch */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Review Your Campaign</CardTitle>
                  <CardDescription>
                    Review all settings before launching your automated ads
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ad Account */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MetaIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Ad Account</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>{selectedAdAccount?.name}</div>
                  <div>Account ID: {selectedAdAccount?.account_id}</div>
                </div>
              </div>

              {/* Template */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <span className="font-semibold">Template</span>
                </div>
                <div className="text-sm text-gray-600 capitalize">{selectedTemplate}</div>
              </div>

              {/* Configuration */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold">Configuration</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Targeting:</span>
                    <span className="font-medium">
                      {geoMode === "radius"
                        ? `${centerCity}, ${radiusKm} km radius`
                        : `${selectedRegions.length} regions`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formats:</span>
                    <span className="font-medium">
                      {[formatFeed && "Feed", formatReels && "Reels"].filter(Boolean).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Call-to-Action:</span>
                    <span className="font-medium capitalize">{ctaType.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Budget:</span>
                    <span className="font-medium">
                      {budgetOverride || defaultBudget.amount.toLocaleString()}{" "}
                      {defaultBudget.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Launch Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">What happens when you launch?</p>
                    <ul className="space-y-1 list-disc list-inside text-blue-800">
                      <li>Product catalog will be created in Meta</li>
                      <li>Campaign and ad sets will be configured</li>
                      <li>Dynamic Product Ads will be published</li>
                      <li>Inventory will sync automatically every 6 hours</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between gap-3">
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleLaunch} size="lg" className="bg-green-600 hover:bg-green-700">
              <Rocket className="h-5 w-5 mr-2" />
              Launch Campaign
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}