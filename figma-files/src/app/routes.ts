import { createBrowserRouter } from "react-router";
import { LandingPage } from "@/app/pages/LandingPage";
import { Login } from "@/app/pages/Login";
import { Signup } from "@/app/pages/Signup";
import { OnboardingStep1 } from "@/app/pages/onboarding/OnboardingStep1";
import { OnboardingStep2 } from "@/app/pages/onboarding/OnboardingStep2";
import { OnboardingStep3 } from "@/app/pages/onboarding/OnboardingStep3";
import { OnboardingStep4 } from "@/app/pages/onboarding/OnboardingStep4";
import { Dashboard } from "@/app/pages/Dashboard";
import { Inventory } from "@/app/pages/Inventory";
import { Automation } from "@/app/pages/Automation";
import { RunDetail } from "@/app/pages/RunDetail";
import { Billing } from "@/app/pages/Billing";
import { Settings } from "@/app/pages/Settings";
import { Templates } from "@/app/pages/Templates";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
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
    path: "/onboarding/step1",
    Component: OnboardingStep1,
  },
  {
    path: "/onboarding/step2",
    Component: OnboardingStep2,
  },
  {
    path: "/onboarding/step3",
    Component: OnboardingStep3,
  },
  {
    path: "/onboarding/step4",
    Component: OnboardingStep4,
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
        Component: Inventory,
      },
      {
        path: "automation",
        Component: Automation,
      },
      {
        path: "automation/runs/:id",
        Component: RunDetail,
      },
      {
        path: "billing",
        Component: Billing,
      },
      {
        path: "settings",
        Component: Settings,
      },
      {
        path: "templates",
        Component: Templates,
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