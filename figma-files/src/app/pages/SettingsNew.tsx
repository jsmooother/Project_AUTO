import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { 
  Globe, 
  User, 
  CheckCircle2, 
  Loader2, 
  ExternalLink, 
  Copy,
  AlertCircle,
  Info,
  Settings as SettingsIcon
} from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

export function SettingsNew() {
  const { lang } = useLanguage();
  const [websiteUrl, setWebsiteUrl] = useState("yoursite.com/inventory");
  const [websiteState, setWebsiteState] = useState<"idle" | "loading" | "success">("idle");
  const [copiedPartner, setCopiedPartner] = useState(false);
  const [copiedBMID, setCopiedBMID] = useState(false);
  
  const websiteConnected = true;
  const metaConnected = true;
  const metaVerified = true;
  
  // Meta Partner Details
  const partnerName = "Agentic Ads";
  const businessManagerId = "123456789012345";
  const adAccountId = "act_987654321";

  const handleTestConnection = () => {
    setWebsiteState("loading");
    setTimeout(() => {
      setWebsiteState("success");
      setTimeout(() => setWebsiteState("idle"), 3000);
    }, 1500);
  };

  const copyToClipboard = (text: string, type: 'partner' | 'bmid') => {
    navigator.clipboard.writeText(text);
    if (type === 'partner') {
      setCopiedPartner(true);
      setTimeout(() => setCopiedPartner(false), 2000);
    } else {
      setCopiedBMID(true);
      setTimeout(() => setCopiedBMID(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {lang === "sv" ? "Inställningar" : "Settings"}
          </h1>
          <p className="text-sm text-gray-600">
            {lang === "sv" ? "Hantera ditt konto och anslutningar" : "Manage your account and connections"}
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account">
              {lang === "sv" ? "Konto" : "Account"}
            </TabsTrigger>
            <TabsTrigger value="integrations">
              {lang === "sv" ? "Integrationer" : "Integrations"}
            </TabsTrigger>
          </TabsList>

          {/* ACCOUNT TAB */}
          <TabsContent value="account" className="space-y-4">
            {/* Account Information */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {lang === "sv" ? "Kontoinformation" : "Account information"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lang === "sv" ? "Dina personliga uppgifter" : "Your personal details"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        {lang === "sv" ? "Fullständigt namn" : "Full name"}
                      </Label>
                      <Input id="name" defaultValue="John Doe" className="h-10" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        {lang === "sv" ? "E-post" : "Email"}
                      </Label>
                      <Input id="email" type="email" defaultValue="john@acme.com" className="h-10" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">
                      {lang === "sv" ? "Företagsnamn" : "Company name"}
                    </Label>
                    <Input id="company" defaultValue="Acme Inc." className="h-10" />
                  </div>

                  <div className="pt-2">
                    <Button size="sm">
                      {lang === "sv" ? "Spara ändringar" : "Save changes"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations" className="space-y-4">
            {/* Connected Website */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {lang === "sv" ? "Ansluten webbplats" : "Connected website"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lang === "sv" ? "Din lagerkälla" : "Your inventory source"}
                    </p>
                  </div>
                  {websiteConnected && (
                    <Badge
                      style={{
                        background: "#d1fae5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0"
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {lang === "sv" ? "Ansluten" : "Connected"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-sm font-medium">
                      {lang === "sv" ? "Webbplats-URL" : "Website URL"}
                    </Label>
                    <Input 
                      id="website" 
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="h-10" 
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestConnection}
                      disabled={websiteState === "loading"}
                    >
                      {websiteState === "loading" && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      {websiteState === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                      )}
                      {lang === "sv" ? "Testa anslutning" : "Test connection"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Meta Connection */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <MetaIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {lang === "sv" ? "Meta-anslutning" : "Meta connection"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lang === "sv" ? "Facebook & Instagram Ads" : "Facebook & Instagram Ads"}
                    </p>
                  </div>
                  {metaConnected && (
                    <Badge
                      style={{
                        background: metaVerified ? "#d1fae5" : "#fef3c7",
                        color: metaVerified ? "#065f46" : "#92400e",
                        border: metaVerified ? "1px solid #a7f3d0" : "1px solid #fde68a"
                      }}
                    >
                      {metaVerified ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {lang === "sv" ? "Verifierad" : "Verified"}
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {lang === "sv" ? "Väntar" : "Pending"}
                        </>
                      )}
                    </Badge>
                  )}
                </div>

                {metaConnected ? (
                  <div className="space-y-4">
                    {/* Partner Access Instructions */}
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-900">
                          <p className="font-medium mb-1">
                            {lang === "sv" 
                              ? "Ge Agentic Ads partneråtkomst" 
                              : "Grant Agentic Ads partner access"}
                          </p>
                          <p className="text-xs text-blue-800">
                            {lang === "sv"
                              ? "Du behöver bara göra detta en gång. Det ger oss tillåtelse att hantera annonser för dig."
                              : "You only need to do this once. It grants us permission to manage ads for you."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-step Instructions */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-900">
                        {lang === "sv" ? "Steg-för-steg:" : "Step-by-step:"}
                      </h4>

                      {/* Step 1 */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            1
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium mb-2">
                            {lang === "sv" 
                              ? "Gå till Meta Business Manager" 
                              : "Go to Meta Business Manager"}
                          </p>
                          <a
                            href="https://business.facebook.com/settings"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm" className="gap-2">
                              {lang === "sv" ? "Öppna Business Manager" : "Open Business Manager"}
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            2
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium mb-2">
                            {lang === "sv" 
                              ? "Kopiera partnerns namn" 
                              : "Copy partner name"}
                          </p>
                          <div className="flex gap-2">
                            <Input 
                              value={partnerName}
                              readOnly
                              className="h-9 font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(partnerName, 'partner')}
                            >
                              {copiedPartner ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            3
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 font-medium mb-2">
                            {lang === "sv" 
                              ? "Kopiera Business Manager ID" 
                              : "Copy Business Manager ID"}
                          </p>
                          <div className="flex gap-2">
                            <Input 
                              value={businessManagerId}
                              readOnly
                              className="h-9 font-mono text-sm"
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => copyToClipboard(businessManagerId, 'bmid')}
                            >
                              {copiedBMID ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Step 4 */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            4
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-1">
                            {lang === "sv" 
                              ? "I Business Manager, gå till Partners → Lägg till" 
                              : "In Business Manager, go to Partners → Add"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {lang === "sv"
                              ? "Klistra in partnerns namn och Business Manager ID"
                              : "Paste the partner name and Business Manager ID"}
                          </p>
                        </div>
                      </div>

                      {/* Step 5 */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                            5
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-1">
                            {lang === "sv" 
                              ? "Ge tillgång till ditt annonskonto" 
                              : "Grant access to your ad account"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {lang === "sv"
                              ? "Välj 'Hantera annonskampanjer' rättigheter"
                              : "Select 'Manage ad campaigns' permissions"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Current Connection Info */}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-gray-600 mb-2">
                        {lang === "sv" ? "Anslutet konto:" : "Connected account:"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">{adAccountId}</p>
                    </div>

                    {/* Disconnect */}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                        {lang === "sv" ? "Koppla från Meta" : "Disconnect Meta"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {lang === "sv"
                        ? "Anslut till Meta för att börja annonsera på Facebook och Instagram."
                        : "Connect to Meta to start advertising on Facebook and Instagram."}
                    </p>
                    <Button
                      style={{
                        background: "#0866FF",
                        color: "white"
                      }}
                      className="gap-2"
                    >
                      <MetaIcon className="h-5 w-5" />
                      {lang === "sv" ? "Anslut till Meta" : "Connect to Meta"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
