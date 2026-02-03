import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Globe, User, AlertTriangle, CheckCircle2, Bell, Loader2, ExternalLink, Lock } from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

// TikTok icon component
function TikTokIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );
}

// X (Twitter) icon component
function XIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export function Settings() {
  const [websiteUrl, setWebsiteUrl] = useState("yoursite.com/inventory");
  const [websiteState, setWebsiteState] = useState<"idle" | "loading" | "success">("idle");
  const websiteConnected = true; // In production, this comes from your data
  const metaConnected = true; // Set to false to show disconnected state

  const handleTestConnection = () => {
    setWebsiteState("loading");
    setTimeout(() => {
      setWebsiteState("success");
      setTimeout(() => setWebsiteState("idle"), 3000);
    }, 1500);
  };

  const handleMetaConnect = () => {
    // In production: Redirect to Meta OAuth flow
    // window.location.href = '/api/auth/meta/connect';
    console.log("Redirecting to Meta OAuth...");
  };

  const handleMetaDisconnect = () => {
    // In production: Call API to disconnect
    console.log("Disconnecting Meta account...");
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and connected services</p>
      </div>

      <div className="space-y-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <CardTitle>Account information</CardTitle>
                <CardDescription>Your personal and company details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@acme.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company name</Label>
              <Input id="company" defaultValue="Acme Inc." />
            </div>

            <div className="pt-4">
              <Button>Save Changes</Button>
            </div>
          </CardContent>
        </Card>

        {/* Connected Website */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Connected website</CardTitle>
                <CardDescription>Your inventory source</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {websiteConnected ? (
              <>
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{websiteUrl}</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Connected on: Jan 28, 2026</div>
                      <div>Last sync: 2 hours ago</div>
                      <div>Items detected: 247</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={websiteState === "loading"}
                    >
                      {websiteState === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : websiteState === "success" ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        "Test Connection"
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="update-url">Update website URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="update-url"
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                    <Button variant="outline">Update</Button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Changing your URL will trigger a new inventory scan
                  </p>
                </div>
              </>
            ) : (
              <div className="p-6 border-2 border-dashed rounded-lg text-center">
                <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h4 className="font-medium mb-2">No website connected</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your inventory website to start automating ads
                </p>
                <div className="space-y-2 max-w-md mx-auto">
                  <Input
                    type="url"
                    placeholder="https://yoursite.com/inventory"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <Button className="w-full">Connect Website</Button>
                </div>
              </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-900">
                <strong>MVP limitation:</strong> Only one website source supported. Multiple
                sources coming in v2.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Connected Meta Account */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <MetaIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Meta Ads</CardTitle>
                <CardDescription>Connect to Facebook & Instagram advertising</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {metaConnected ? (
              <>
                <div className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Acme Inc. Ads</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Business ID: biz_7362847562</div>
                      <div>Ad Account: act_9283746529</div>
                      <div>Connected on: Jan 28, 2026</div>
                      <div>Permissions: Campaign management, catalog sync</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" onClick={handleMetaConnect}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Reconnect
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleMetaDisconnect}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>OAuth Connected:</strong> We can publish ads to your Meta account
                      automatically. Token refreshes every 60 days.
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 border-2 border-dashed rounded-lg">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MetaIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Connect your Meta account</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Connect your Facebook Business account to publish automated ads to Facebook
                        and Instagram. You'll grant permissions for:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1 mb-4">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Create and manage ad campaigns
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Sync product catalog
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Read campaign performance data
                        </li>
                      </ul>
                      <Button onClick={handleMetaConnect}>
                        <MetaIcon className="h-4 w-4 mr-2" />
                        Connect Meta Account
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
                  <strong>Note:</strong> You'll be redirected to Meta to authorize Project Auto. We
                  never see your password.
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon: Additional Ad Platforms */}
        <Card className="opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Additional ad platforms
                  <Badge variant="outline" className="text-xs">Coming in v2</Badge>
                </CardTitle>
                <CardDescription>Expand to more advertising channels</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* TikTok */}
              <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border">
                    <TikTokIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">TikTok Ads</div>
                    <div className="text-sm text-gray-600">Reach younger audiences</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>

              {/* X (Twitter) */}
              <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border">
                    <XIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">X Ads</div>
                    <div className="text-sm text-gray-600">Engage professional networks</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>

              {/* Google Ads */}
              <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border">
                    <div className="text-xl font-bold text-gray-600">G</div>
                  </div>
                  <div>
                    <div className="font-medium">Google Ads</div>
                    <div className="text-sm text-gray-600">Search & display advertising</div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">Coming Soon</Badge>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
              These platforms will be available in version 2. Meta Ads covers Facebook and
              Instagram in the current version.
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose what updates you want to receive</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="notif-run-complete" className="font-medium cursor-pointer">
                    Run completion notifications
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Get notified when automation runs complete (success or failure)
                  </p>
                </div>
                <Switch id="notif-run-complete" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="notif-errors" className="font-medium cursor-pointer">
                    Error alerts
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Immediate alerts when runs fail or connections drop
                  </p>
                </div>
                <Switch id="notif-errors" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="notif-budget" className="font-medium cursor-pointer">
                    Budget alerts
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Alerts when you reach 75%, 90%, and 100% of your monthly budget
                  </p>
                </div>
                <Switch id="notif-budget" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="notif-inventory" className="font-medium cursor-pointer">
                    Inventory change summary
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Daily digest of new and removed items
                  </p>
                </div>
                <Switch id="notif-inventory" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="notif-weekly" className="font-medium cursor-pointer">
                    Weekly summary report
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Weekly overview of inventory, runs, and ad performance
                  </p>
                </div>
                <Switch id="notif-weekly" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <Label htmlFor="notif-product" className="font-medium cursor-pointer">
                    Product updates & tips
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Occasional emails about new features and best practices
                  </p>
                </div>
                <Switch id="notif-product" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-900">Danger zone</CardTitle>
                <CardDescription>Irreversible actions for your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">
                    Disconnect website
                  </h4>
                  <p className="text-sm text-red-800">
                    Remove your website connection. Automation will stop but ad campaigns will
                    remain active.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                  Disconnect
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">Pause automation</h4>
                  <p className="text-sm text-red-800">
                    Temporarily stop all automation runs. Your connections and data will remain.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                  Pause
                </Button>
              </div>
            </div>

            <Separator />

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">Delete account</h4>
                  <p className="text-sm text-red-800">
                    Permanently delete your account, all data, disconnect integrations, and stop
                    billing.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700">
                  Delete Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}