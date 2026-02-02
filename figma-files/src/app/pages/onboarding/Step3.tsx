import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ConfidenceScore } from "@/app/components/ConfidenceScore";
import { Badge } from "@/app/components/ui/badge";
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

export function OnboardingStep3() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="text-2xl font-semibold tracking-tight mb-2">Project Auto</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-blue-600" />
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Probe results</CardTitle>
            <CardDescription>
              We analyzed your website and found your inventory. Review the results below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Confidence Score */}
            <div className="flex items-center justify-center py-6 border-b">
              <ConfidenceScore score={87} size="lg" />
            </div>

            {/* Strategy Summary */}
            <div className="space-y-3">
              <h3 className="font-semibold">Chosen Strategy</h3>
              <div className="grid gap-3">
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Discovery</div>
                    <div className="text-sm text-gray-600">sitemap + html_links</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Fetch</div>
                    <div className="text-sm text-gray-600">HTTP (fast, cost-effective)</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Extract</div>
                    <div className="text-sm text-gray-600">vehicle (specialized)</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            {/* What We Found */}
            <div className="space-y-3">
              <h3 className="font-semibold">What we found</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-3xl font-semibold text-blue-900 mb-1">247</div>
                  <div className="text-sm text-blue-700">Discovered listings</div>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-3xl font-semibold text-green-900 mb-1">98%</div>
                  <div className="text-sm text-green-700">With images</div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="text-3xl font-semibold text-purple-900 mb-1">12</div>
                  <div className="text-sm text-purple-700">Avg fields/item</div>
                </div>
              </div>
            </div>

            {/* Sample Listings */}
            <div className="space-y-3">
              <h3 className="font-semibold">Sample listing URLs</h3>
              <div className="space-y-2">
                {[
                  "/inventory/2024-ford-f150-xl-123456",
                  "/inventory/2023-toyota-camry-se-789012",
                  "/inventory/2024-honda-crv-ex-345678",
                ].map((url, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <code className="text-sm text-gray-700">yoursite.com{url}</code>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Fields */}
            <div className="space-y-3">
              <h3 className="font-semibold">Sample extracted fields</h3>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Title:</span>{" "}
                    <span className="font-medium">2024 Ford F-150 XL</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price:</span>{" "}
                    <span className="font-medium">$42,995</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Year:</span>{" "}
                    <span className="font-medium">2024</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Make:</span>{" "}
                    <span className="font-medium">Ford</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Model:</span>{" "}
                    <span className="font-medium">F-150</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Mileage:</span>{" "}
                    <span className="font-medium">1,247 mi</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Images:</span>{" "}
                    <span className="font-medium">24 photos</span>
                  </div>
                  <div>
                    <span className="text-gray-600">VIN:</span>{" "}
                    <span className="font-medium">1FTFW1E5XPF...</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-green-900">
                  <p className="font-medium mb-1">Looking good!</p>
                  <p className="text-green-800">
                    Your site is well-structured for automated extraction. We're ready to start
                    syncing.
                  </p>
                </div>
              </div>
            </div>

            {/* Low confidence example (hidden by default) */}
            {/* Uncomment to show fix suggestions */}
            {/* <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-900">
                  <p className="font-medium mb-2">Low confidence — Suggestions to improve:</p>
                  <ul className="space-y-1 text-yellow-800">
                    <li>• Add a specific inventory URL (e.g., /inventory or /vehicles)</li>
                    <li>• Enable headless fallback for JavaScript-rendered content</li>
                    <li>• Provide a direct inventory feed (JSON/XML)</li>
                  </ul>
                </div>
              </div>
            </div> */}

            <div className="flex items-center justify-between pt-4">
              <Link to="/onboarding/step2">
                <Button variant="ghost">Back</Button>
              </Link>
              <Link to="/onboarding/step4">
                <Button>Save Profile & Run First Sync</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
