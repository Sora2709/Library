"use client";
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ui/states";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: string;
  book?: string;
  member: string;
  memberId?: string;
  time: string;
  status: string;
}

const iconMap: Record<string, { Icon: typeof ArrowRightLeft; color: string }> = {
  borrow: { Icon: ArrowRightLeft, color: "text-primary-600 bg-primary-50" },
  return: { Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
  overdue: { Icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  new_member: { Icon: UserPlus, color: "text-sky-600 bg-sky-50" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export function RecentActivities() {
  const { data, loading } = useApi<{ activities: Activity[] }>("/api/dashboard");

  if (loading) {
    return (
      <div className="space-y-3 px-5 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-48 rounded bg-slate-100 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-slate-50 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const activities = data?.activities ?? [];

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-slate-400">
        No recent activities yet. Issue or return a book to see activity here.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 -mx-5">
      {activities.map((activity, i) => {
        const conf = iconMap[activity.type] ?? iconMap.borrow;
        const Icon = conf.Icon;
        return (
          <div
            key={activity.id}
            className={cn(
              "flex items-start gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors",
              i === 0 && "pt-0"
            )}
          >
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                conf.color
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 leading-tight">
                {activity.type === "borrow" && (
                  <>
                    <span className="font-medium">{activity.member}</span>{" "}
                    <span className="text-slate-500">borrowed</span>{" "}
                    <span className="font-medium text-slate-700">
                      &ldquo;{activity.book}&rdquo;
                    </span>
                  </>
                )}
                {activity.type === "return" && (
                  <>
                    <span className="font-medium">{activity.member}</span>{" "}
                    <span className="text-slate-500">returned</span>{" "}
                    <span className="font-medium text-slate-700">
                      &ldquo;{activity.book}&rdquo;
                    </span>
                  </>
                )}
                {activity.type === "overdue" && (
                  <>
                    <span className="font-medium text-amber-700">Overdue:</span>{" "}
                    <span className="font-medium text-slate-700">
                      &ldquo;{activity.book}&rdquo;
                    </span>{" "}
                    <span className="text-slate-500">by {activity.member}</span>
                  </>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{timeAgo(activity.time)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
