import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Zap, Rocket, CheckCircle2, DollarSign, Target, Sparkles } from "lucide-react";
import { useLanguage } from "@/app/i18n/LanguageContext";
import { translations } from "@/app/i18n/translations";

export default function OnboardingLaunch() {
  const [budget, setBudget] = useState("500");
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const t = translations[lang];

  const handleLaunch = async () => {
    setIsLoading(true);
    // API call: POST /onboarding/launch
    await new Promise(resolve => setTimeout(resolve, 2000));
    navigate("/app/dashboard");
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
            {lang === "sv" ? "Ställ in dina regler" : "Set your rules"}
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            {lang === "sv" ? "Smarter ads. Zero busywork." : "Smarter ads. Zero busywork."}
          </p>
          <p className="text-sm text-gray-500">
            {lang === "sv" ? "Steg 3 av 3 • ~1 minut" : "Step 3 of 3 • ~1 minute"}
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <div className="w-3 h-3 rounded-full bg-green-600" />
                <div className="w-3 h-3 rounded-full bg-blue-600" />
              </div>
            </div>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {lang === "sv" ? "Budget & automation" : "Budget & automation"}
                </h2>
                <p className="text-sm text-gray-600">
                  {lang === "sv" ? "Ställ in budget och låt AI göra resten" : "Set budget and let AI do the rest"}
                </p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-900">
                  <strong>{lang === "sv" ? "Du har full kontroll" : "You have full control"}</strong>
                  <p className="text-xs mt-1 text-gray-700">
                    {lang === "sv"
                      ? "Du kan när som helst ändra budget, pausa annonser eller justera regler."
                      : "You can change budget, pause ads, or adjust rules anytime."}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Monthly Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget" className="text-sm font-medium">
                  {lang === "sv" ? "Månatlig budget" : "Monthly budget"}
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="budget"
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="500"
                    className="h-11 pl-10"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {lang === "sv"
                    ? "Rekommenderad startbudget: $500-1000/månad"
                    : "Recommended starting budget: $500-1000/month"}
                </p>
              </div>

              {/* What AI will do */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-medium text-gray-700 mb-3">
                  {lang === "sv" ? "AI kommer automatiskt att:" : "AI will automatically:"}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>{lang === "sv" ? "Skapa annonser för varje produkt" : "Create ads for each product"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>{lang === "sv" ? "Optimera budgivning för bästa ROI" : "Optimize bidding for best ROI"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>{lang === "sv" ? "Pausa underpresterande annonser" : "Pause underperforming ads"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    <span>{lang === "sv" ? "Skala upp vinnande annonser" : "Scale up winning ads"}</span>
                  </div>
                </div>
              </div>

              {/* Target Options (Pre-configured) */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Target size={16} className="text-gray-600" />
                  <p className="text-xs font-medium text-gray-700">
                    {lang === "sv" ? "Målgrupp (fördefinierad):" : "Audience (pre-configured):"}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{lang === "sv" ? "Plats" : "Location"}:</span>
                    <span className="font-medium text-gray-900">{lang === "sv" ? "Lokalt (50 km radie)" : "Local (50km radius)"}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{lang === "sv" ? "Ålder" : "Age"}:</span>
                    <span className="font-medium text-gray-900">25-65</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{lang === "sv" ? "Intressen" : "Interests"}:</span>
                    <span className="font-medium text-gray-900">{lang === "sv" ? "Auto" : "Automotive"}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {lang === "sv" 
                    ? "Du kan ändra dessa inställningar senare"
                    : "You can change these settings later"}
                </p>
              </div>

              {/* Launch Button */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  onClick={handleLaunch}
                  disabled={!budget || isLoading}
                  size="lg"
                  className="gap-2 font-semibold px-8 bg-gradient-to-br from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    lang === "sv" ? "Startar..." : "Launching..."
                  ) : (
                    <>
                      <Rocket size={18} />
                      {lang === "sv" ? "Starta annonser" : "Launch ads"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trust Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {lang === "sv"
              ? "🎉 Du kan börja se resultat inom 24-48 timmar"
              : "🎉 You'll start seeing results within 24-48 hours"}
          </p>
        </div>
      </div>
    </div>
  );
}
