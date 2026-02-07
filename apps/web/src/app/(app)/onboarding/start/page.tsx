"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { apiPost } from "@/lib/api";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Building2,
  ArrowRight,
  Zap,
  CheckCircle2,
  Globe,
  Megaphone,
  Sparkles,
} from "lucide-react";

const ONBOARDING_COMPLETE_KEY = "onboardingComplete";

export default function OnboardingStartPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkipNow = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    }
    router.push("/dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setIsLoading(true);
    setError(null);
    const customerId = auth.status === "authenticated" ? auth.user?.customerId : undefined;
    const res = await apiPost(
      "/onboarding/company",
      { companyName: companyName.trim(), companyWebsite: companyWebsite.trim() || undefined },
      { customerId }
    );
    if (!res.ok) {
      setError(res.errorDetail?.hint ?? res.error);
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    router.push("/onboarding/setup");
  };

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && !auth.user?.customerId) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      {/* Subtle background gradients - Figma style */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-5%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-10%",
          left: "-5%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(147, 51, 234, 0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
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
            {t.onboarding.startTitle}
          </h1>
          <p className="text-lg text-gray-600 mb-2">{t.onboarding.tagline}</p>
          <p className="text-sm text-gray-500">{t.onboarding.setupTime}</p>
          <button
            type="button"
            onClick={handleSkipNow}
            className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900 underline"
          >
            {t.onboarding.skipNow} →
          </button>
        </div>

        {/* What You'll Do - Figma card */}
        <div className="border border-gray-200 rounded-lg mb-6 bg-white shadow-sm overflow-hidden">
          <div className="p-6">
            <p className="font-semibold text-sm text-gray-900 mb-4">{t.onboarding.whatYoullDo}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">
                    1. {t.onboarding.stepConnectWebsite}
                  </p>
                  <p className="text-xs text-gray-600">{t.onboarding.stepConnectWebsiteSub}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">
                    2. {t.onboarding.stepConnectMeta}
                  </p>
                  <p className="text-xs text-gray-600">{t.onboarding.stepConnectMetaSub}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 mb-1">
                    3. {t.onboarding.stepLaunchAds}
                  </p>
                  <p className="text-xs text-gray-600">{t.onboarding.stepLaunchAdsSub}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
          <div className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">
                  {t.onboarding.step} 1 / 3
                </span>
                <span className="text-xs text-gray-500">~5 min remaining</span>
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
                <h2 className="font-semibold text-lg text-gray-900">Company information</h2>
                <p className="text-sm text-gray-600">Tell us about your business</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info Banner */}
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-900">
                    <strong>{t.onboarding.tagline}</strong>
                    <p className="text-xs mt-1 text-gray-700">
                      We automate the entire ad process so you can focus on sales.
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-2">
                <label htmlFor="companyName" className="text-sm font-medium text-gray-900 block">
                  {t.onboarding.companyNameLabel} <span className="text-red-500">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t.onboarding.companyNamePlaceholder}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">{t.onboarding.companyNameHint}</p>
              </div>

              {/* Company Website */}
              <div className="space-y-2">
                <label htmlFor="companyWebsite" className="text-sm font-medium text-gray-900 block">
                  {t.onboarding.companyWebsiteLabel}{" "}
                  <span className="text-gray-400 text-xs">{t.onboarding.companyWebsiteOptional}</span>
                </label>
                <input
                  id="companyWebsite"
                  type="url"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  placeholder={t.onboarding.companyWebsitePlaceholder}
                  className="w-full h-11 px-3 rounded-md border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500">{t.onboarding.companyWebsiteHint}</p>
              </div>

              {/* Next up */}
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">{t.onboarding.nextUp}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span>{t.onboarding.nextUpConnectInventory}</span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end pt-2 gap-3">
                <button
                  type="button"
                  onClick={handleSkipNow}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                >
                  {t.onboarding.skipNow}
                </button>
                <button
                  type="submit"
                  disabled={!companyName.trim() || isLoading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t.onboarding.saving : t.onboarding.nextStep}
                  {!isLoading && <ArrowRight size={18} />}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Trust Footer */}
        <p className="text-center mt-6 text-xs text-gray-500">{t.onboarding.trustFooter}</p>
      </div>
    </div>
  );
}
