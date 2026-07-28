// src/app/dashboard/profile/page.tsx
"use client";

import { SettingsClient } from "@/components/settings/SettingsClient";

export default function DashboardProfilePage() {
  return <SettingsClient initialTab="profile" />;
}