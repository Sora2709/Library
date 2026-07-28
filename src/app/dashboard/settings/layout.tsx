// src/app/dashboard/settings/layout.tsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { Building2, User, Sliders, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "general", label: "General", icon: Building2, href: "/dashboard/settings" },
  { id: "profile", label: "Profile", icon: User, href: "/dashboard/settings/profile" },
  { id: "preferences", label: "Preferences", icon: Sliders, href: "/dashboard/settings/preferences" },
  { id: "help", label: "Help & Support", icon: HelpCircle, href: "/dashboard/settings/help" },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = tabs.find((t) => pathname === t.href)?.id || "general";

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl">
      <div className="inline-flex w-full flex-wrap gap-2 rounded-xl border border-slate-200/60 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      {children}
    </div>
  );
}