import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card, CardContent } from "@/app/components/ui/card";
import { Building2, ArrowRight, Zap, CheckCircle2, Sparkles, Globe, Megaphone } from "lucide-react";

export default function OnboardingStart() {
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // API call to save company info
      // POST /onboarding/company
      await new Promise(resolve => setTimeout(resolve, 800));
      navigate("/onboarding/connect");
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
            <span className="text-xl font-bold text-gray-900">Agentic Ads</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-3 text-gray-900">
            Welcome to Agentic Ads
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Smarter ads. Zero busywork.
          </p>
          <p className="text-sm text-gray-500">
            Set up automatic advertising in 5 minutes
          </p>
          
          {/* Skip Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/app/dashboard")}
            className="mt-4 text-gray-600 hover:text-gray-900"
          >
            Skip for now →
          </Button>
        </div>

        {/* What You'll Do */}
        <Card className="border border-gray-200 mb-6">
          <CardContent className="p-6">
            <p className="font-semibold text-sm text-gray-900 mb-4">
              What you'll do:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">
                    1. Connect website
                  </p>
                  <p className="text-xs text-gray-600">
                    URL to your inventory
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">
                    2. Connect Meta
                  </p>
                  <p className="text-xs text-gray-600">
                    Facebook & Instagram
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">
                    3. Launch ads
                  </p>
                  <p className="text-xs text-gray-600">
                    Budget & automation
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form Card */}
        <Card className="border border-gray-200">
          <CardContent className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  Step 1 of 3
                </span>
                <span className="text-xs text-gray-500">
                  ~5 min remaining
                </span>
              </div>
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
                <h2 className="font-semibold text-lg text-gray-900">
                  Company information
                </h2>
                <p className="text-sm text-gray-600">
                  Tell us about your business
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info Banner */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-900">
                    <strong>Smarter ads. Zero busywork.</strong>
                    <p className="text-xs mt-1 text-gray-700">
                      We automate the entire ad process so you can focus on sales.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-sm font-medium text-gray-900">
                  Company name
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Auto Ltd"
                  className="h-11 text-gray-900"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  The name of your business or brand
                </p>
              </div>

              {/* Company Website */}
              <div className="space-y-2">
                <Label htmlFor="companyWebsite" className="text-sm font-medium text-gray-900">
                  Website
                  <span className="text-gray-400 text-xs ml-2">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder="https://acmeauto.com"
                  className="h-11 text-gray-900"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">
                  Your main website (not necessarily where inventory is)
                </p>
              </div>

              {/* What's Next Preview */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Next up:
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>Connect your inventory page</span>
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
                  disabled={!companyName.trim() || isLoading}
                  className="gap-2 font-semibold px-8"
                >
                  {isLoading ? "Saving..." : (
                    <>
                      Next step
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
            Secure & private. We protect your data according to GDPR.
          </p>
        </div>
      </div>
    </div>
  );
}