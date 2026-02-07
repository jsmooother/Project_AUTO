import { createBrowserRouter } from "react-router";
import { TestLanding } from "@/app/pages/TestLanding";
import { LandingPage } from "@/app/pages/LandingPage";
import { FeaturesPage } from "@/app/pages/FeaturesPage";
import { PricingPage } from "@/app/pages/PricingPage";
import { AboutPage } from "@/app/pages/AboutPage";
import { Login } from "@/app/pages/Login";
import { Signup } from "@/app/pages/Signup";
import { ResetPassword } from "@/app/pages/ResetPassword";

// New onboarding screens (3-step flow)
import OnboardingStart from "@/app/onboarding/start/page";
import OnboardingConnect from "@/app/onboarding/connect/page";
import OnboardingLaunch from "@/app/onboarding/launch/page";

import { Dashboard } from "@/app/pages/Dashboard";
import { InventoryNew } from "@/app/pages/InventoryNew";
import { RunDetail } from "@/app/pages/RunDetail";
import { RunsNew } from "@/app/pages/RunsNew";
import { BillingNew } from "@/app/pages/BillingNew";
import { SettingsNew } from "@/app/pages/SettingsNew";
import { TemplatesNew } from "@/app/pages/TemplatesNew";
import { Ads } from "@/app/pages/Ads";
import { AdsSimple } from "@/app/pages/AdsSimple";
import { AdsSetup } from "@/app/pages/AdsSetup";
import { AdsCampaign } from "@/app/pages/AdsCampaign";
import { AdsDiagnostics } from "@/app/pages/AdsDiagnostics";
import { AdsBoosts } from "@/app/pages/AdsBoosts";
import { PerformanceNew } from "@/app/pages/PerformanceNew";
import { AppLayout } from "@/app/components/AppLayout";

// Admin pages
import { AdminLayout } from "@/app/components/AdminLayout";
import { AdminOverview } from "@/app/pages/admin/AdminOverview";
import { AdminCustomers } from "@/app/pages/admin/AdminCustomers";
import { AdminCustomerDetail } from "@/app/pages/admin/AdminCustomerDetail";
import { AdminSources } from "@/app/pages/admin/AdminSources";
import { AdminRuns } from "@/app/pages/admin/AdminRuns";
import { AdminRunDetail } from "@/app/pages/admin/AdminRunDetail";
import { AdminBilling } from "@/app/pages/admin/AdminBilling";
import { AdminSystem } from "@/app/pages/admin/AdminSystem";
import { AdminAds } from "@/app/pages/admin/AdminAds";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/test",
    Component: TestLanding,
  },
  {
    path: "/features",
    Component: FeaturesPage,
  },
  {
    path: "/pricing",
    Component: PricingPage,
  },
  {
    path: "/about",
    Component: AboutPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/onboarding/start",
    Component: OnboardingStart,
  },
  {
    path: "/onboarding/connect",
    Component: OnboardingConnect,
  },
  {
    path: "/onboarding/launch",
    Component: OnboardingLaunch,
  },
  {
    path: "/app",
    Component: AppLayout,
    children: [
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "inventory",
        Component: InventoryNew,
      },
      {
        path: "billing",
        Component: BillingNew,
      },
      {
        path: "settings",
        Component: SettingsNew,
      },
      {
        path: "templates",
        Component: TemplatesNew,
      },
      {
        path: "ads",
        Component: Ads,
      },
      {
        path: "ads/simple",
        Component: AdsSimple,
      },
      {
        path: "ads/setup",
        Component: AdsSetup,
      },
      {
        path: "ads/campaign",
        Component: AdsCampaign,
      },
      {
        path: "ads/diagnostics",
        Component: AdsDiagnostics,
      },
      {
        path: "ads/boosts",
        Component: AdsBoosts,
      },
      {
        path: "performance",
        Component: PerformanceNew,
      },
      {
        path: "runs",
        Component: RunsNew,
      },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      {
        path: "overview",
        Component: AdminOverview,
      },
      {
        path: "customers",
        Component: AdminCustomers,
      },
      {
        path: "customers/:id",
        Component: AdminCustomerDetail,
      },
      {
        path: "sources",
        Component: AdminSources,
      },
      {
        path: "runs",
        Component: AdminRuns,
      },
      {
        path: "runs/:id",
        Component: AdminRunDetail,
      },
      {
        path: "ads",
        Component: AdminAds,
      },
      {
        path: "billing",
        Component: AdminBilling,
      },
      {
        path: "system",
        Component: AdminSystem,
      },
    ],
  },
]);