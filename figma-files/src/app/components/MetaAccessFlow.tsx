import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { CheckCircle2, ExternalLink, Copy, Check, Shield, Clock, RefreshCw, Info } from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

interface MetaAccessFlowProps {
  onRefresh: () => void;
}

export function MetaAccessFlow({ onRefresh }: MetaAccessFlowProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copiedBusinessId, setCopiedBusinessId] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Project AUTO's Meta Business ID (in production, this comes from your config)
  const PROJECT_AUTO_BUSINESS_ID = "123456789012345";

  const handleCopyBusinessId = () => {
    navigator.clipboard.writeText(PROJECT_AUTO_BUSINESS_ID);
    setCopiedBusinessId(true);
    setTimeout(() => setCopiedBusinessId(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    onRefresh();
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  return (
    <>
      {/* Empty State Card */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <MetaIcon className="h-7 w-7 text-white" />
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">
                Give Project AUTO access to your ad account
              </h3>
              <p className="text-gray-700 mb-4">
                To run ads on your behalf, Project AUTO needs access to your Meta ad account.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>You stay the owner of your ad account</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>You can revoke access at any time</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>We can only create and manage ads — never access billing or personal data</span>
                </div>
              </div>

              <div className="p-4 bg-white border border-blue-200 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium text-sm mb-1">Quick setup</div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-gray-500" />
                        <span>You keep full ownership</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span>Takes ~1 minute to complete</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button size="lg" onClick={() => setShowInstructions(true)}>
                  How to give access
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh ad accounts
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Modal */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Give access in Meta Business Manager</DialogTitle>
            <DialogDescription>
              Follow these steps to grant Project AUTO access to your ad account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Open Meta Business Manager</h4>
                <a
                  href="https://business.facebook.com/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <MetaIcon className="h-4 w-4 mr-2" />
                    Open Meta Business Manager
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Go to Business Settings → Partners</h4>
                <p className="text-sm text-gray-600">
                  In the left sidebar, find and click on <strong>Partners</strong> under the Business
                  Settings section
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Click "Add Partner"</h4>
                <p className="text-sm text-gray-600">
                  Look for the blue <strong>Add</strong> button in the Partners section
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-3">Enter this Business ID</h4>
                <div className="p-4 bg-gray-100 border-2 border-gray-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                        Project AUTO Business ID
                      </div>
                      <div className="font-mono text-lg font-bold">{PROJECT_AUTO_BUSINESS_ID}</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyBusinessId}
                      className="ml-4"
                    >
                      {copiedBusinessId ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Select your ad account & grant access</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Choose the ad account you want to use with Project AUTO</p>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <strong className="text-yellow-900">Grant these permissions:</strong>
                    <ul className="mt-2 space-y-1 text-yellow-900">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Ad account advertiser</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Catalog management</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Final Step */}
            <div className="flex gap-4 pt-4 border-t">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-2">Done! Return here and refresh</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Once you've completed the steps in Meta Business Manager, come back here and click
                  the refresh button
                </p>
                <Button onClick={() => setShowInstructions(false)}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Close & refresh ad accounts
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
