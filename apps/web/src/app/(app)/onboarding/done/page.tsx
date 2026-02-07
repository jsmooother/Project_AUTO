"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n/context";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CheckCircle2, Globe, Megaphone, LayoutDashboard, Zap } from "lucide-react";

const ONBOARDING_COMPLETE_KEY = "onboardingComplete";

export default function OnboardingDonePage() {
  const { auth } = useAuth();
  const { t } = useI18n();
  const router = useRouter();

  const handleGoToDashboard = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
    }
    router.push("/dashboard");
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
        {/* Logo - minimal for consistency */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Zap size={20} color="white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-gray-900">Agentic Ads</span>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <span className="text-xs font-medium text-gray-500">
              {t.onboarding.step} 3 / 3
            </span>
          </div>

          <div className="p-8">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {t.onboarding.doneTitle}
            </h1>
            <p className="text-gray-600 mb-6">{t.onboarding.guidesIntro}</p>

            <div className="space-y-3 mb-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 no-underline transition-colors"
              >
                <LayoutDashboard className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-sm">{t.nav.dashboard}</span>
              </Link>
              <Link
                href="/connect-website"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 no-underline transition-colors"
              >
                <Globe className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-sm">{t.onboarding.guideConnectWebsite}</span>
              </Link>
              <Link
                href="/settings#meta"
                className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-900 no-underline transition-colors"
              >
                <Megaphone className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-sm">{t.onboarding.guideConnectMeta}</span>
              </Link>
            </div>
          </div>

          <div className="px-8 py-4 border-t border-gray-200 flex flex-wrap justify-between items-center gap-3 bg-gray-50">
            <button
              type="button"
              onClick={handleSkipNow}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 underline"
            >
              {t.onboarding.skipNow}
            </button>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="px-5 py-2.5 rounded-md font-medium text-white bg-gray-900 hover:bg-gray-800"
            >
              {t.onboarding.goToDashboard}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500">{t.onboarding.trustFooter}</p>
      </div>
    </div>
  );
}
