import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  Package,
  ExternalLink,
  RefreshCw,
  Settings as SettingsIcon,
  Megaphone,
  Palette,
  Users,
  ArrowRight,
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

export function AdsSimple() {
  const { lang } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Mock data
  const isLive = true;
  const lastSync = "2h";
  const inventoryCount = 247;
  const catalogId = "cat_7362847562";
  const campaignName = "Acme Auto - Dynamisk inventering";

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            {lang === "sv" ? "Annonser" : "Ads"}
          </h1>
          <p className="text-sm text-gray-600">
            {lang === "sv" ? "Hantera dina Meta-kampanjer" : "Manage your Meta campaigns"}
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Status */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                {isLive ? (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-2">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Status</div>
                    <div className="font-semibold text-gray-900">
                      {lang === "sv" ? "Live" : "Live"}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-2">
                      <Clock className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="text-xs text-gray-600 mb-1">Status</div>
                    <div className="font-semibold text-gray-900">
                      {lang === "sv" ? "Pausad" : "Paused"}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Last Sync */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {lang === "sv" ? "Senaste synk" : "Last sync"}
                </div>
                <div className="font-semibold text-gray-900">{lastSync}</div>
              </div>
            </CardContent>
          </Card>

          {/* Objects */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {lang === "sv" ? "Objekt" : "Objects"}
                </div>
                <div className="font-semibold text-gray-900">{inventoryCount}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Meta Objects Section */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-gray-900">
            {lang === "sv" ? "Meta-kampanjobjekt" : "Meta campaign objects"}
          </h2>

          {/* Product Catalog Card */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === "sv" ? "Produktkatalog" : "Product catalog"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{catalogId}</p>
                  <p className="text-sm text-gray-700">
                    {inventoryCount} {lang === "sv" ? "objekt synkroniserade" : "objects synced"}
                  </p>
                </div>
                <a
                  href={`https://business.facebook.com/commerce/catalogs/${catalogId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    {lang === "sv" ? "Visa i Meta" : "View in Meta"}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Campaign Card */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === "sv" ? "Kampanj" : "Campaign"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{campaignName}</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      style={{
                        background: "#d1fae5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      {lang === "sv" ? "Aktiv" : "Active"}
                    </Badge>
                  </div>
                </div>
                <a
                  href="https://business.facebook.com/adsmanager"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    {lang === "sv" ? "Hantera i Meta" : "Manage in Meta"}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Ads Card */}
          <Card className="border border-gray-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Palette className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {lang === "sv" ? "Dynamiska annonser" : "Dynamic ads"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {lang === "sv" ? "Format: Feed, Reels, Stories" : "Format: Feed, Reels, Stories"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Users className="h-4 w-4" />
                    <span>
                      {lang === "sv" ? "Målgrupp: Sverige • 25-65 år" : "Audience: Sweden • 25-65 years"}
                    </span>
                  </div>
                </div>
                <Link to="/app/ads/campaign">
                  <Button variant="outline" size="sm" className="gap-2">
                    {lang === "sv" ? "Se förhandsvisning" : "Preview"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-6">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="gap-2"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing
              ? (lang === "sv" ? "Synkroniserar..." : "Syncing...")
              : (lang === "sv" ? "Synkronisera nu" : "Sync now")}
          </Button>
          <Link to="/app/settings">
            <Button variant="outline" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              {lang === "sv" ? "Inställningar" : "Settings"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
