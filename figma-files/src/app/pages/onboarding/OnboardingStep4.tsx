import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Loader2, CheckCircle2, Globe } from "lucide-react";

export function OnboardingStep4() {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const [url, setUrl] = useState("");

  const handleConnect = () => {
    setState("loading");
    // Simulate API call
    setTimeout(() => {
      setState("success");
    }, 2000);
  };

  const handleSkip = () => {
    // Go directly to dashboard with incomplete setup
    window.location.href = "/app/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight mb-4">Project Auto</div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <p className="text-sm text-gray-600">Step 4 of 4</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Connect your website</CardTitle>
              </div>
            </div>
            <CardDescription>
              Enter your inventory website URL so we can automatically detect your listings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {state === "idle" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="url">Website URL</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://yoursite.com/inventory"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    This can be your inventory page, homepage, or any page with your listings
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>What happens next?</strong> We'll scan your site to find all
                    listings, extract key details (title, price, images), and show you what we
                    found.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>Optional step:</strong> You can skip this and connect your website
                    later from the dashboard. Your account will be ready, but automation won't
                    run until you connect a site.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip for now
                  </Button>
                  <div className="flex items-center gap-3">
                    <Link to="/onboarding/step3">
                      <Button variant="outline">Back</Button>
                    </Link>
                    <Button onClick={handleConnect} disabled={!url}>
                      Connect & Scan Website
                    </Button>
                  </div>
                </div>
              </>
            )}

            {state === "loading" && (
              <div className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <div className="text-center">
                    <p className="font-medium mb-1">Scanning your website...</p>
                    <p className="text-sm text-gray-600">
                      This usually takes 30-60 seconds
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Discovering listing pages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Extracting inventory details</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-50">
                    <div className="h-4 w-4" />
                    <span>Analyzing data quality</span>
                  </div>
                </div>
              </div>
            )}

            {state === "success" && (
              <div className="py-8">
                <div className="flex flex-col items-center justify-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg mb-1">Website connected!</p>
                    <p className="text-sm text-gray-600">
                      We found 247 listings on your site
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-semibold mb-1">247</div>
                    <div className="text-sm text-gray-600">Total items</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-semibold mb-1">98%</div>
                    <div className="text-sm text-gray-600">With images</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-semibold mb-1">12</div>
                    <div className="text-sm text-gray-600">Fields/item</div>
                  </div>
                </div>

                <Link to="/app/dashboard">
                  <Button className="w-full" size="lg">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
