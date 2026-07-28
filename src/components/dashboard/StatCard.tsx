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

const colorMap: Record<string, { bg: string; text: string; ring: string; light: string; gradient: string }> = {
  primary: { 
    bg: "bg-blue-600", 
    text: "text-blue-600", 
    ring: "ring-blue-100", 
    light: "bg-blue-50",
    gradient: "from-blue-600 to-blue-700"
  },
  emerald: { 
    bg: "bg-emerald-600", 
    text: "text-emerald-600", 
    ring: "ring-emerald-100", 
    light: "bg-emerald-50",
    gradient: "from-emerald-600 to-emerald-700"
  },
  sky: { 
    bg: "bg-sky-600", 
    text: "text-sky-600", 
    ring: "ring-sky-100", 
    light: "bg-sky-50",
    gradient: "from-sky-600 to-sky-700"
  },
  violet: { 
    bg: "bg-violet-600", 
    text: "text-violet-600", 
    ring: "ring-violet-100", 
    light: "bg-violet-50",
    gradient: "from-violet-600 to-violet-700"
  },
  amber: { 
    bg: "bg-amber-600", 
    text: "text-amber-600", 
    ring: "ring-amber-100", 
    light: "bg-amber-50",
    gradient: "from-amber-600 to-amber-700"
  },
  rose: { 
    bg: "bg-rose-600", 
    text: "text-rose-600", 
    ring: "ring-rose-100", 
    light: "bg-rose-50",
    gradient: "from-rose-600 to-rose-700"
  },
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
    <Card className="group hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden relative border border-slate-200/60 bg-white">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
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
              "flex h-11 w-11 items-center justify-center rounded-xl ring-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg",
              c.light,
              c.text,
              c.ring
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2.2} />
          </div>
        </div>
      </CardContent>
      <div className={cn("h-1 w-full absolute bottom-0 left-0 bg-gradient-to-r", c.gradient)} />
    </Card>
  );
}