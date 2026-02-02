import { Link } from "react-router";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Loader2, CheckCircle2 } from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

export function OnboardingStep3() {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleConnect = () => {
    setState("loading");
    // Simulate OAuth flow
    setTimeout(() => {
      setState("success");
    }, 1500);
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
            <div className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
          <p className="text-sm text-gray-600">Step 3 of 4</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MetaIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Connect Meta Ads</CardTitle>
              </div>
            </div>
            <CardDescription>
              Connect your Meta (Facebook/Instagram) ad account to automate campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {state === "idle" && (
              <>
                <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <MetaIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Meta Ads Manager</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        We'll request permission to manage campaigns on your behalf. You stay in
                        full control of budgets.
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">Recommended</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>What we need:</strong> Permission to create and update campaigns,
                    read account info, and access performance metrics. You can revoke access
                    anytime.
                  </p>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900">
                    <strong>MVP limitation:</strong> Only Meta Ads supported initially. Google
                    Ads, TikTok, and other platforms coming in v2.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Link to="/onboarding/step2">
                    <Button variant="ghost">Back</Button>
                  </Link>
                  <Button onClick={handleConnect}>
                    Connect Meta Ads
                  </Button>
                </div>
              </>
            )}

            {state === "loading" && (
              <div className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <div className="text-center">
                    <p className="font-medium mb-1">Connecting to Meta...</p>
                    <p className="text-sm text-gray-600">
                      Complete authorization in the popup window
                    </p>
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
                    <p className="font-semibold text-lg mb-1">Meta account connected!</p>
                    <p className="text-sm text-gray-600">
                      Account: Acme Inc.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border mb-6">
                  <div className="text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account ID</span>
                      <span className="font-medium">123456789</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Permissions</span>
                      <span className="font-medium">Campaign management</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Status</span>
                      <Badge className="bg-green-600">Active</Badge>
                    </div>
                  </div>
                </div>

                <Link to="/onboarding/step4">
                  <Button className="w-full">
                    Continue
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
