"use client";
import { useApi } from "@/hooks/useApi";
import { StatCard } from "@/components/dashboard/StatCard";
import { Loading } from "@/components/ui/states";
import type { DashboardStats } from "@/lib/types";

const buildCards = (s: DashboardStats) => [
  { label: "Total Books", value: s.totalBooks.toLocaleString(), change: "Live", changeLabel: "in catalog", trend: "up" as const, icon: "BookOpen", color: "primary" },
  { label: "Available Books", value: s.availableBooks.toLocaleString(), change: `${s.totalBooks ? Math.round((s.availableBooks / s.totalBooks) * 100) : 0}%`, changeLabel: "available", trend: "neutral" as const, icon: "Library", color: "emerald" },
  { label: "Borrowed Books", value: s.borrowedBooks.toLocaleString(), change: "Live", changeLabel: "active loans", trend: "up" as const, icon: "BookMarked", color: "sky" },
  { label: "Active Members", value: s.activeMembers.toLocaleString(), change: "Live", changeLabel: "members", trend: "up" as const, icon: "Users", color: "violet" },
  { label: "Overdue Books", value: s.overdueBooks.toLocaleString(), change: s.overdueBooks > 0 ? "Action" : "None", changeLabel: "need attention", trend: (s.overdueBooks > 0 ? "down" : "neutral") as "down" | "neutral", icon: "AlertTriangle", color: "amber" },
];

export function LiveStats() {
  const { data, loading, error, reload } = useApi<DashboardStats>("/api/stats");

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-white border border-slate-200 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <Loading />
        <button onClick={reload} className="block mx-auto text-xs font-medium text-primary-600 hover:text-primary-700">Try again</button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {buildCards(data).map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
