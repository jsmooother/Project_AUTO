"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Zap, Globe, Megaphone, Settings as SettingsIcon, CheckCircle2 } from "lucide-react";

const ONBOARDING_COMPLETE_KEY = "onboardingComplete";

export default function OnboardingSetupPage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleContinueToDashboard = () => {
    router.push("/onboarding/done");
  };

  const handleSkipNow = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    }
    router.push("/dashboard");
  };

  if (auth.status !== "authenticated") return null;
  if (auth.status === "authenticated" && !auth.user?.customerId) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      {/* Figma-style background gradients */}
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
            {t.onboarding.connectYourWebsite}
          </h1>
          <p className="text-lg text-gray-600 mb-2">{t.onboarding.tagline}</p>
          <p className="text-sm text-gray-500">{t.onboarding.connectStepTime}</p>
          <button
            type="button"
            onClick={handleSkipNow}
            className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900 underline"
          >
            {t.onboarding.skipNow} →
          </button>
        </div>

        {/* Main Card - Figma Connect style */}
        <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden mb-6">
          <div className="p-8">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <div className="w-3 h-3 rounded-full bg-blue-600" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Globe className="h-6 w-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-gray-900">
                  {t.onboarding.connectCardTitle}
                </h2>
                <p className="text-sm text-gray-600">{t.onboarding.connectCardSubtitle}</p>
              </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-900">
                  <strong>{t.onboarding.connectPullInventory}</strong>
                  <p className="text-xs mt-1 text-gray-700">{t.onboarding.connectCreateAds}</p>
                </div>
              </div>
            </div>

            {/* Optional setup links */}
            <p className="text-sm text-gray-600 mb-4">{t.onboarding.setupOptional}</p>
            <div className="space-y-3">
              <Link
                href="/connect-website"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 no-underline transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{t.onboarding.guideConnectWebsite}</span>
                </div>
              </Link>
              <div className="px-4 py-2 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">{t.onboarding.nextUp}</p>
                <p className="text-xs text-gray-600">{t.onboarding.nextUpConnectMeta}</p>
              </div>
              <Link
                href="/settings#meta"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 no-underline transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Megaphone className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{t.onboarding.guideConnectMeta}</span>
                </div>
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 no-underline transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <SettingsIcon className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{t.onboarding.guideSettings}</span>
                </div>
              </Link>
            </div>

            {/* Actions - match shell layout */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSkipNow}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
              >
                {t.onboarding.skipNow}
              </button>
              <button
                type="button"
                onClick={handleContinueToDashboard}
                className="inline-flex items-center px-5 py-2.5 rounded-md font-medium text-white bg-gray-900 hover:bg-gray-800"
              >
                {t.onboarding.continueToDashboard}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">{t.onboarding.trustFooter}</p>
      </div>
    </div>
  );
}
