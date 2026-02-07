"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function OnboardingPreviewPage() {
  const router = useRouter();
  const { auth } = useAuth();

  useEffect(() => {
    if (auth.status === "authenticated") {
      router.replace("/onboarding/setup");
    }
  }, [auth.status, router]);

  if (auth.status !== "authenticated") return null;
  return <LoadingSpinner />;
}
