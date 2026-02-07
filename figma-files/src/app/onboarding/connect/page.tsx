import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Building2, ArrowRight, Zap, CheckCircle2, Globe, Link as LinkIcon } from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { translations } from "@/app/i18n/translations";

export default function OnboardingConnect() {
  const [companyName, setCompanyName] = useState("");
  const [inventoryUrl, setInventoryUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !inventoryUrl.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // API call: POST /onboarding/connect
      await new Promise(resolve => setTimeout(resolve, 800));
      navigate("/onboarding/setup");
    } catch (err) {
      setError(lang === "sv" ? "Något gick fel. Försök igen." : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      {/* Subtle background gradients */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-[640px] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Zap size={20} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold">Agentic Ads</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-3">
            {lang === "sv" ? "Anslut din webbplats" : "Connect your website"}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {lang === "sv" ? "Smarter ads. Zero busywork." : "Smarter ads. Zero busywork."}
          </p>
          <p className="text-sm text-gray-500">
            {lang === "sv" ? "Steg 1 av 3 • ~2 minuter" : "Step 1 of 3 • ~2 minutes"}
          </p>
          
          {/* Skip Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/dashboard")}
            className="mt-4 text-gray-600 hover:text-gray-900"
          >
            {lang === "sv" ? "Hoppa över →" : "Skip →"}
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {lang === "sv" ? "Företagsinformation" : "Company information"}
                </h2>
                <p className="text-sm text-gray-600">
                  {lang === "sv" ? "Berätta om ditt företag och lager" : "Tell us about your business and inventory"}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info Banner */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-900">
                    <strong>{lang === "sv" ? "Vi hämtar automatiskt ditt lager" : "We automatically pull your inventory"}</strong>
                    <p className="text-xs mt-1 text-gray-700">
                      {lang === "sv"
                        ? "Anslut din webbplats så skapar vi annonser för alla dina produkter."
                        : "Connect your website and we'll create ads for all your products."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium">
                  {lang === "sv" ? "Företagsnamn" : "Company name"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={lang === "sv" ? "Acme Bil AB" : "Acme Auto Ltd"}
                  className="h-11"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  {lang === "sv"
                    ? "Namnet på ditt företag eller varumärke"
                    : "The name of your business or brand"}
                </p>
              </div>

              {/* Inventory URL */}
              <div className="space-y-2">
                <Label htmlFor="inventoryUrl" className="text-sm font-medium">
                  {lang === "sv" ? "Lager-URL" : "Inventory URL"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="inventoryUrl"
                    type="url"
                    required
                    value={inventoryUrl}
                    onChange={(e) => setInventoryUrl(e.target.value)}
                    placeholder={lang === "sv" ? "https://mittföretag.se/lager" : "https://mycompany.com/inventory"}
                    className="h-11 pl-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {lang === "sv"
                    ? "URL till sidan där dina fordon/produkter visas"
                    : "URL to the page where your vehicles/products are displayed"}
                </p>
              </div>

              {/* What's Next Preview */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  {lang === "sv" ? "Nästa steg:" : "Next up:"}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>{lang === "sv" ? "Anslut Meta-konto för publicering" : "Connect Meta account for publishing"}</span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!companyName.trim() || !inventoryUrl.trim() || isLoading}
                  className="gap-2 font-semibold px-8"
                >
                  {isLoading ? (
                    lang === "sv" ? "Sparar..." : "Saving..."
                  ) : (
                    <>
                      {lang === "sv" ? "Nästa steg" : "Next step"}
                      <ArrowRight size={18} />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {lang === "sv"
              ? "Säker & privat. Vi skyddar dina data enligt GDPR."
              : "Secure & private. We protect your data according to GDPR."}
          </p>
        </div>
      </div>
    </div>
  );
}
