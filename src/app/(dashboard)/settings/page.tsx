import { SettingsClient } from "@/components/settings/SettingsClient";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  return <SettingsClient initialTab={params.tab} />;
}
