import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import {
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Play,
  Clock,
  ExternalLink,
  Package,
  Settings as SettingsIcon,
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

export function Ads() {
  const { lang } = useLanguage();
  
  // System state
  const isLive = true; // Ads are running
  const autoSyncEnabled = true;
  const lastSync = "2 hours ago";
  const inventoryCount = 247;
  
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">
              {lang === "sv" ? "Annonser" : lang === "de" ? "Anzeigen" : "Ads"}
            </h1>
            <p className="text-sm text-gray-600">
              {lang === "sv" 
                ? "Automatiserade Meta-annonser för ditt lager" 
                : lang === "de" 
                ? "Automatisierte Meta-Anzeigen für Ihren Bestand"
                : "Automated Meta ads for your inventory"}
            </p>
          </div>
          {isLive && (
            <Badge className="gap-2 px-3 py-1.5" style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", color: "white" }}>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {lang === "sv" ? "Live" : lang === "de" ? "Live" : "Live"}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="status" className="space-y-6">
        <TabsList>
          <TabsTrigger value="status">
            {lang === "sv" ? "Status" : lang === "de" ? "Status" : "Status"}
          </TabsTrigger>
          <TabsTrigger value="automation">
            {lang === "sv" ? "Automation" : lang === "de" ? "Automatisierung" : "Automation"}
          </TabsTrigger>
        </TabsList>

        {/* STATUS TAB */}
        <TabsContent value="status" className="space-y-4">
          {/* Campaign Status */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">
                  {lang === "sv" ? "Status" : lang === "de" ? "Status" : "Status"}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-gray-900">
                    {lang === "sv" ? "Aktiv" : lang === "de" ? "Aktiv" : "Active"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">
                  {lang === "sv" ? "Senaste synk" : lang === "de" ? "Letzte Sync" : "Last sync"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">{lastSync}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200">
              <CardContent className="p-4">
                <div className="text-xs text-gray-600 mb-1">
                  {lang === "sv" ? "Annonserade artiklar" : lang === "de" ? "Beworbene Artikel" : "Advertised items"}
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="font-semibold text-gray-900">{inventoryCount}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meta Campaign Objects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    {lang === "sv" ? "Meta-kampanj" : lang === "de" ? "Meta-Kampagne" : "Meta campaign"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {lang === "sv" ? "Dina annonsobjekt på Meta" : lang === "de" ? "Ihre Anzeigenobjekte bei Meta" : "Your ad objects on Meta"}
                  </CardDescription>
                </div>
                <a
                  href="https://business.facebook.com/adsmanager"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <ExternalLink className="h-3 w-3 mr-1.5" />
                    {lang === "sv" ? "Öppna Ads Manager" : lang === "de" ? "Ads Manager öffnen" : "Open Ads Manager"}
                  </Button>
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between p-2.5 border rounded-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <div className="font-medium text-xs">
                      {lang === "sv" ? "Produktkatalog" : lang === "de" ? "Produktkatalog" : "Product Catalog"}
                    </div>
                    <div className="text-xs text-gray-600">{inventoryCount} {lang === "sv" ? "artiklar" : lang === "de" ? "Artikel" : "items"}</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  {lang === "sv" ? "aktiv" : lang === "de" ? "aktiv" : "active"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 border rounded-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <div className="font-medium text-xs">
                      {lang === "sv" ? "Kampanj" : lang === "de" ? "Kampagne" : "Campaign"}
                    </div>
                    <div className="text-xs text-gray-600">{lang === "sv" ? "Automatiserad" : lang === "de" ? "Automatisiert" : "Automated"}</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  {lang === "sv" ? "aktiv" : lang === "de" ? "aktiv" : "active"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 border rounded-lg">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <div>
                    <div className="font-medium text-xs">
                      {lang === "sv" ? "Dynamiska produktannonser" : lang === "de" ? "Dynamische Produktanzeigen" : "Dynamic Product Ads"}
                    </div>
                    <div className="text-xs text-gray-600">Feed, Reels</div>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                  {lang === "sv" ? "aktiv" : lang === "de" ? "aktiv" : "active"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {lang === "sv" ? "Synka nu" : lang === "de" ? "Jetzt synchronisieren" : "Sync now"}
            </Button>
            <Link to="/app/settings">
              <Button variant="outline" className="gap-2">
                <SettingsIcon className="h-4 w-4" />
                {lang === "sv" ? "Inställningar" : lang === "de" ? "Einstellungen" : "Settings"}
              </Button>
            </Link>
          </div>
        </TabsContent>

        {/* AUTOMATION TAB */}
        <TabsContent value="automation" className="space-y-4">
          {/* Auto Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "sv" ? "Automatisk synkronisering" : lang === "de" ? "Automatische Synchronisierung" : "Automatic sync"}
              </CardTitle>
              <CardDescription className="text-xs">
                {lang === "sv" 
                  ? "Håll dina annonser uppdaterade automatiskt" 
                  : lang === "de" 
                  ? "Halten Sie Ihre Anzeigen automatisch aktuell"
                  : "Keep your ads updated automatically"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <Label htmlFor="enable-auto" className="font-medium text-sm">
                    {lang === "sv" ? "Aktivera automatisk synk" : lang === "de" ? "Automatische Sync aktivieren" : "Enable automatic sync"}
                  </Label>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {lang === "sv" 
                      ? "Kontrollera nya och borttagna artiklar varje natt" 
                      : lang === "de" 
                      ? "Überprüfen Sie jede Nacht auf neue und entfernte Artikel"
                      : "Check for new and removed items nightly"}
                  </p>
                </div>
                <Switch id="enable-auto" defaultChecked={autoSyncEnabled} />
              </div>

              {autoSyncEnabled && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-900">
                    <div className="font-medium mb-0.5">
                      {lang === "sv" ? "Nästa schemalagda körning" : lang === "de" ? "Nächste geplante Ausführung" : "Next scheduled run"}
                    </div>
                    <div>
                      {lang === "sv" ? "Ikväll kl 02:00" : lang === "de" ? "Heute Nacht um 02:00 Uhr" : "Tonight at 2:00 AM"}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Button className="gap-2" size="sm">
                  <Play className="h-3.5 w-3.5" />
                  {lang === "sv" ? "Kör manuell synk" : lang === "de" ? "Manuelle Sync ausführen" : "Run manual sync"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "sv" ? "Hur det fungerar" : lang === "de" ? "Wie es funktioniert" : "How it works"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>
                      {lang === "sv" ? "Skapa annonser automatiskt:" : lang === "de" ? "Anzeigen automatisch erstellen:" : "Auto-create ads:"}
                    </strong>{" "}
                    {lang === "sv" 
                      ? "Nya lagerartiklar får automatiskt kampanjer skapade på Meta Ads" 
                      : lang === "de" 
                      ? "Neue Bestandsartikel erhalten automatisch Kampagnen bei Meta Ads"
                      : "New inventory items automatically get campaigns created on Meta Ads"}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>
                      {lang === "sv" ? "Pausa annonser automatiskt:" : lang === "de" ? "Anzeigen automatisch pausieren:" : "Auto-pause ads:"}
                    </strong>{" "}
                    {lang === "sv" 
                      ? "När artiklar tas bort från din webbplats pausas deras kampanjer automatiskt" 
                      : lang === "de" 
                      ? "Wenn Artikel von Ihrer Website entfernt werden, werden ihre Kampagnen automatisch pausiert"
                      : "When items are removed from your website, their campaigns are automatically paused"}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>
                      {lang === "sv" ? "Budgetfördelning:" : lang === "de" ? "Budgetverteilung:" : "Budget distribution:"}
                    </strong>{" "}
                    {lang === "sv" 
                      ? "Din månatliga budget fördelas jämnt över alla aktiva artiklar" 
                      : lang === "de" 
                      ? "Ihr Monatsbudget wird gleichmäßig auf alle aktiven Artikel verteilt"
                      : "Your monthly budget is evenly distributed across all active items"}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full bg-blue-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <strong>
                      {lang === "sv" ? "Daglig övervakning:" : lang === "de" ? "Tägliche Überwachung:" : "Daily monitoring:"}
                    </strong>{" "}
                    {lang === "sv" 
                      ? "Kampanjer övervakas och justeras för att hålla sig inom din budgetgräns" 
                      : lang === "de" 
                      ? "Kampagnen werden überwacht und angepasst, um innerhalb Ihres Budgets zu bleiben"
                      : "Campaigns are monitored and adjusted to stay within your budget limits"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {lang === "sv" ? "Aktuell status" : lang === "de" ? "Aktueller Status" : "Current status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Läge" : lang === "de" ? "Modus" : "Mode"}
                  </div>
                  <Badge className="bg-blue-600 text-xs">
                    {lang === "sv" ? "Alltid på" : lang === "de" ? "Immer an" : "Always On"}
                  </Badge>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Senaste körning" : lang === "de" ? "Letzte Ausführung" : "Last run"}
                  </div>
                  <div className="font-medium text-sm">{lastSync}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Status" : lang === "de" ? "Status" : "Status"}
                  </div>
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span className="font-medium text-sm">
                      {lang === "sv" ? "Hälsosam" : lang === "de" ? "Gesund" : "Healthy"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">
                    {lang === "sv" ? "Synkade artiklar" : lang === "de" ? "Synchronisierte Artikel" : "Items synced"}
                  </div>
                  <div className="font-medium text-sm">{inventoryCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
