// src/app/dashboard/preferences/page.tsx
"use client";

import { SettingsClient } from "@/components/settings/SettingsClient";

export default function DashboardPreferencesPage() {
  return <SettingsClient initialTab="preferences" />;
}