"use client";
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ui/states";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface Activity {
  id: string;
  type: string;
  book?: string;
  member: string;
  memberId?: string;
  time: string;
  status: string;
}

const iconMap: Record<string, { Icon: typeof ArrowRightLeft; color: string; bgColor: string; label: string }> = {
  borrow: { 
    Icon: ArrowRightLeft, 
    color: "text-blue-600", 
    bgColor: "bg-blue-50",
    label: "Borrowed"
  },
  return: { 
    Icon: CheckCircle2, 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-50",
    label: "Returned"
  },
  overdue: { 
    Icon: AlertTriangle, 
    color: "text-amber-600", 
    bgColor: "bg-amber-50",
    label: "Overdue"
  },
  new_member: { 
    Icon: UserPlus, 
    color: "text-indigo-600", 
    bgColor: "bg-indigo-50",
    label: "New Member"
  },
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-3 px-5 py-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-48 rounded bg-gradient-to-r from-slate-100 to-slate-200 animate-pulse" />
              <div className="h-2.5 w-24 rounded bg-gradient-to-r from-slate-50 to-slate-100 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  const activities = data?.activities ?? [];

  if (activities.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12 px-4"
      >
        <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
          <Clock className="h-8 w-8 text-slate-300" />
        </div>
        <p className="text-sm font-medium text-slate-600">No recent activities</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Issue or return a book to see activity here
        </p>
      </motion.div>
    );
  }

  return (
    <div className="divide-y divide-slate-100/60 -mx-5">
      <AnimatePresence mode="sync">
        {activities.map((activity, index) => {
          const conf = iconMap[activity.type] ?? iconMap.borrow;
          const Icon = conf.Icon;
          const isHovered = hoveredId === activity.id;
          const isExpanded = expandedId === activity.id;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.05,
                }
              }}
              exit={{ 
                opacity: 0, 
                x: -20,
                transition: { duration: 0.2 }
              }}
              whileHover={{ 
                scale: 1.01,
                transition: { 
                  type: "spring",
                  stiffness: 400,
                  damping: 15,
                }
              }}
              onHoverStart={() => setHoveredId(activity.id)}
              onHoverEnd={() => setHoveredId(null)}
              onClick={() => setExpandedId(isExpanded ? null : activity.id)}
              className={cn(
                "flex items-start gap-3 px-5 py-3 cursor-pointer transition-all duration-200 relative group",
                index === 0 && "pt-0",
                isHovered && "bg-gradient-to-r from-slate-50/80 to-transparent",
                isExpanded && "bg-slate-50/50"
              )}
            >
              {/* Animated background glow */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent pointer-events-none"
              />

              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 1, rotate: 0 }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -5, 5, 0],
                  transition: { 
                    duration: 0.3,
                    ease: "easeInOut",
                  }
                }}
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
                  conf.bgColor,
                  conf.color,
                  isHovered && "shadow-md"
                )}
              >
                <Icon className="h-4 w-4" />
              </motion.div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-900 leading-tight">
                    {activity.type === "borrow" && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="font-medium text-slate-900">{activity.member}</span>{" "}
                        <span className="text-slate-500">borrowed</span>{" "}
                        <span className="font-medium text-blue-700 hover:text-blue-800 transition-colors">
                          &ldquo;{activity.book}&rdquo;
                        </span>
                      </motion.span>
                    )}
                    {activity.type === "return" && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="font-medium text-slate-900">{activity.member}</span>{" "}
                        <span className="text-slate-500">returned</span>{" "}
                        <span className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                          &ldquo;{activity.book}&rdquo;
                        </span>
                      </motion.span>
                    )}
                    {activity.type === "overdue" && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="font-medium text-amber-700">Overdue:</span>{" "}
                        <span className="font-medium text-amber-700 hover:text-amber-800 transition-colors">
                          &ldquo;{activity.book}&rdquo;
                        </span>{" "}
                        <span className="text-slate-500">by {activity.member}</span>
                      </motion.span>
                    )}
                    {activity.type === "new_member" && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        <span className="font-medium text-indigo-700">New member:</span>{" "}
                        <span className="font-medium text-slate-900">{activity.member}</span>{" "}
                        <span className="text-slate-500">joined the library</span>
                      </motion.span>
                    )}
                  </p>

                  {/* Status badge with animation */}
                  {activity.status === "overdue" && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 300,
                        damping: 15,
                        delay: 0.1
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 shrink-0"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.7, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-amber-500"
                      />
                      Overdue
                    </motion.span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-slate-400">{timeAgo(activity.time)}</p>
                  
                  {/* Activity type label */}
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -5 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded"
                  >
                    {conf.label}
                  </motion.span>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-2 pt-2 border-t border-slate-200/50"
                    >
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>ID: {activity.id.slice(0, 8)}</span>
                        {activity.memberId && <span>Member: {activity.memberId}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(activity.time).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Chevron indicator */}
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.3 }}
                className="shrink-0 text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* View all activities link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-5 py-3 text-center border-t border-slate-100/60"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1.5 mx-auto"
        >
          View all activities
          <motion.span
            initial={{ x: 0 }}
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            →
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  );
}