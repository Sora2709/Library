// src/app/settings/page.tsx
"use client";

import { SettingsClient } from "@/components/settings/SettingsClient";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") || "general";
  return <SettingsClient initialTab={tab} />;
}