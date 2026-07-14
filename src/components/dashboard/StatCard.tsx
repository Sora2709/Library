import {
  BookOpen,
  Library,
  BookMarked,
  Users,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Library,
  BookMarked,
  Users,
  AlertTriangle,
  DollarSign,
};

const colorMap: Record<string, { bg: string; text: string; ring: string; light: string }> = {
  primary: { bg: "bg-primary-600", text: "text-primary-600", ring: "ring-primary-100", light: "bg-primary-50" },
  emerald: { bg: "bg-emerald-600", text: "text-emerald-600", ring: "ring-emerald-100", light: "bg-emerald-50" },
  sky: { bg: "bg-sky-600", text: "text-sky-600", ring: "ring-sky-100", light: "bg-sky-50" },
  violet: { bg: "bg-violet-600", text: "text-violet-600", ring: "ring-violet-100", light: "bg-violet-50" },
  amber: { bg: "bg-amber-600", text: "text-amber-600", ring: "ring-amber-100", light: "bg-amber-50" },
  rose: { bg: "bg-rose-600", text: "text-rose-600", ring: "ring-rose-100", light: "bg-rose-50" },
};

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  trend,
  icon,
  color,
}: StatCardProps) {
  const Icon = iconMap[icon] || BookOpen;
  const c = colorMap[color] || colorMap.primary;

  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600 bg-emerald-50"
      : trend === "down"
      ? "text-rose-600 bg-rose-50"
      : "text-slate-500 bg-slate-100";

  return (
    <Card className="group hover:shadow-md hover:shadow-slate-200/60 transition-all duration-200 overflow-hidden relative">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">
              {value}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
                  trendColor
                )}
              >
                <TrendIcon className="h-3 w-3" />
                {change}
              </span>
              <span className="text-xs text-slate-400">{changeLabel}</span>
            </div>
          </div>
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl ring-4 transition-transform group-hover:scale-110",
              c.light,
              c.text,
              c.ring
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
        </div>
      </CardContent>
      <div className={cn("h-1 w-full absolute bottom-0 left-0", c.bg)} />
    </Card>
  );
}
