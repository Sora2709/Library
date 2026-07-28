// src/app/settings/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const TAB_REDIRECTS: Record<string, string> = {
  general: "/dashboard/settings",
  profile: "/dashboard/profile",
  preferences: "/dashboard/preferences",
  help: "/dashboard/help",
};

function SettingsRedirect() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "general";
  const redirectUrl = TAB_REDIRECTS[tab] || "/dashboard/settings";

  useEffect(() => {
    window.location.href = redirectUrl;
  }, [redirectUrl]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      }
    >
      <SettingsRedirect />
    </Suspense>
  );
}