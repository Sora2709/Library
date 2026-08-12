// src/components/dashboard/LiveStats.tsx
"use client";
import { useApi } from "@/hooks/useApi";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/states";
import type { DashboardStats } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, TrendingUp, TrendingDown, Minus, BookOpen, Users, Library, BookMarked, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const iconMap = {
  BookOpen,
  Users,
  Library,
  BookMarked,
  Clock,
  AlertTriangle,
};

const colorMap = {
  primary: { bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", ring: "ring-sky-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", ring: "ring-violet-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
};

const trendIconMap = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

const trendColorMap = {
  up: "text-emerald-600 bg-emerald-50",
  down: "text-red-600 bg-red-50",
  neutral: "text-slate-400 bg-slate-50",
};

const kpiVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.05,
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    }
  }),
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: "0 10px 40px -5px rgba(0,0,0,0.1)",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15,
    }
  }
};

const buildCards = (s: DashboardStats) => [
  { 
    label: "Total Books", 
    value: s.totalBooks.toLocaleString(), 
    change: "Live", 
    changeLabel: "in catalog", 
    trend: "up" as const, 
    icon: "BookOpen", 
    color: "primary",
    description: "All books in the library collection"
  },
  { 
    label: "Available Books", 
    value: s.availableBooks.toLocaleString(), 
    change: `${s.totalBooks ? Math.round((s.availableBooks / s.totalBooks) * 100) : 0}%`, 
    changeLabel: "available", 
    trend: "neutral" as const, 
    icon: "Library", 
    color: "emerald",
    description: "Books currently on shelves"
  },
  { 
    label: "Borrowed Books", 
    value: s.borrowedBooks.toLocaleString(), 
    change: "Live", 
    changeLabel: "active loans", 
    trend: "up" as const, 
    icon: "BookMarked", 
    color: "sky",
    description: "Books currently checked out"
  },
  { 
    label: "Active Members", 
    value: s.activeMembers.toLocaleString(), 
    change: "Live", 
    changeLabel: "members", 
    trend: "up" as const, 
    icon: "Users", 
    color: "violet",
    description: "Registered library members"
  },
  { 
    label: "Overdue Books", 
    value: s.overdueBooks.toLocaleString(), 
    change: s.overdueBooks > 0 ? "Action" : "None", 
    changeLabel: "attention", 
    trend: (s.overdueBooks > 0 ? "down" : "neutral") as "down" | "neutral", 
    icon: "AlertTriangle", 
    color: "amber",
    description: "Books past their return date"
  },
];

export function LiveStats() {
  const { data, loading, error, reload } = useApi<DashboardStats>("/api/stats");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleReload = async () => {
    setIsRefreshing(true);
    await reload();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-8 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-32 rounded-xl bg-white border border-slate-200/60 shadow-sm overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 to-transparent animate-shimmer" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-slate-200/60 bg-white p-8 shadow-sm text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 bg-red-50 rounded-full">
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Failed to load statistics</p>
            <p className="text-xs text-slate-400 mt-1">
              {typeof error === 'string' ? error : "Please try again later"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Try again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const cards = buildCards(data);

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
            />
            <span className="text-xs font-medium text-slate-600">Live</span>
          </div>
          <span className="text-xs text-slate-400">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05, rotate: isRefreshing ? 0 : 90 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleReload}
          disabled={isRefreshing}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200 text-slate-400 hover:text-slate-600"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </motion.div>

      {/* Stats Grid - Reports Page KPI Style */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.1,
            }
          }
        }}
      >
        <AnimatePresence mode="sync">
          {cards.map((stat, index) => {
            const Icon = iconMap[stat.icon as keyof typeof iconMap] || BookOpen;
            const TrendIcon = trendIconMap[stat.trend];
            const colors = colorMap[stat.color as keyof typeof colorMap] || colorMap.primary;
            const trendColors = trendColorMap[stat.trend];

            return (
              <motion.div
                key={stat.label}
                custom={index}
                variants={kpiVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
              >
                <Card className="border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardContent className="p-5 relative">
                    <div className="flex items-start justify-between">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg} ${colors.text} ring-4 ${colors.ring}`}
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      
                      {/* Trend indicator */}
                      {stat.trend !== "neutral" && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${trendColors} text-xs font-medium`}>
                          <TrendIcon className="h-3 w-3" />
                          {stat.change}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mt-3">
                      {stat.label}
                    </p>
                    <motion.p 
                      key={stat.value}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="text-2xl font-bold text-slate-900 tracking-tight mt-1"
                    >
                      {stat.value}
                    </motion.p>
                    
                    {stat.changeLabel && (
                      <p className="text-xs text-slate-400 mt-1 truncate">
                        {stat.changeLabel}
                      </p>
                    )}
                    
                    {/* Animated indicator for live data */}
                    {stat.change === "Live" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                        className="absolute top-3 right-3"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Quick stats summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-200/50"
      >
        <span>Summary</span>
        <span>•</span>
        <span>{data.totalBooks} total books</span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="text-emerald-600">●</span>
          {data.availableBooks} available
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="text-amber-600">●</span>
          {data.overdueBooks} overdue
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="text-blue-600">●</span>
          {data.activeMembers} active members
        </span>
      </motion.div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}