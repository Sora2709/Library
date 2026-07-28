"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ui/states";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  TrendingUp, 
  PieChart as PieChartIcon,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface CatData {
  name: string;
  value: number;
  color: string;
}

// Premium color palette matching the theme
const defaultColors = [
  "#2563eb", // Blue
  "#3b82f6", // Light Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316", // Orange
  "#8b5cf6", // Violet
];

// Hover colors (slightly lighter)
const hoverColors = [
  "#3b82f6", // Blue hover
  "#60a5fa", // Light Blue hover
  "#818cf8", // Indigo hover
  "#a78bfa", // Purple hover
  "#22d3ee", // Cyan hover
  "#34d399", // Emerald hover
  "#fbbf24", // Amber hover
  "#f87171", // Red hover
  "#f472b6", // Pink hover
  "#2dd4bf", // Teal hover
  "#fb923c", // Orange hover
  "#a78bfa", // Violet hover
];

export function CategoryChart() {
  const { data, loading } = useApi<{ categoryDistribution: CatData[] }>("/api/dashboard");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const categoryDistribution = data?.categoryDistribution ?? [];
  const total = categoryDistribution.reduce((sum, c) => sum + c.value, 0);

  // Assign colors if not provided
  const dataWithColors = useMemo(() => {
    return categoryDistribution.map((item, index) => ({
      ...item,
      color: item.color || defaultColors[index % defaultColors.length],
      hoverColor: hoverColors[index % hoverColors.length],
    }));
  }, [categoryDistribution]);

  // Sort by value descending
  const sortedData = useMemo(() => {
    return [...dataWithColors].sort((a, b) => b.value - a.value);
  }, [dataWithColors]);

  // Get top 5 categories for display
  const displayData = useMemo(() => {
    return showAll ? sortedData : sortedData.slice(0, 5);
  }, [sortedData, showAll]);

  const remainingCount = sortedData.length - 5;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 p-4 min-w-[180px]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <p className="font-semibold text-slate-900 text-sm">
              {data.name}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Books</span>
              <span className="text-xs font-semibold text-slate-900">
                {data.value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Share</span>
              <span className="text-xs font-semibold text-blue-600">
                {percentage}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: data.color }}
              />
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[300px] w-full flex flex-col items-center justify-center gap-3"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <div className="relative h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Loading categories...</p>
      </motion.div>
    );
  }

  if (categoryDistribution.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[300px] w-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl border border-slate-200/50"
      >
        <div className="p-4 bg-blue-50 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No book categories yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Start adding books to different categories to see distribution insights.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full w-full space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-50 rounded-lg">
            <PieChartIcon className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              Category Distribution
            </p>
            <p className="text-xs text-slate-400">
              {sortedData.length} categories • {total.toLocaleString()} books total
            </p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span className="text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            {total > 0 ? `${((sortedData[0]?.value / total) * 100).toFixed(0)}% largest` : 'N/A'}
          </span>
        </motion.div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
        {/* Pie Chart */}
        <div className="relative w-full lg:w-[220px] h-[220px] flex-shrink-0 mx-auto lg:mx-0">
          {isClient && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                  onMouseEnter={(_, index) => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                >
                  {displayData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={hoveredIndex === index ? entry.hoverColor : entry.color}
                      style={{
                        transition: "fill 0.3s ease",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "transparent" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2 
              }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-slate-900">
                {total.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Total Books
              </p>
            </motion.div>
          </div>
        </div>

        {/* Category List */}
        <div className="flex-1 w-full min-w-0">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {displayData.map((cat, index) => {
                const percentage = total > 0 ? ((cat.value / total) * 100).toFixed(1) : 0;
                const isTop = index < 3;
                
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ 
                      duration: 0.3,
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "rgba(37, 99, 235, 0.05)",
                      transition: { duration: 0.2 }
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg transition-all duration-200 group cursor-default"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0 transition-all duration-300 group-hover:scale-125"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-slate-600 flex-1 truncate font-medium">
                        {cat.name}
                        {isTop && (
                          <span className="ml-1.5 text-[10px] text-amber-500">★</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-slate-900 tabular-nums">
                        {cat.value.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 min-w-[36px] text-right">
                        {percentage}%
                      </span>
                      <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ 
                            duration: 0.8, 
                            delay: 0.2 + index * 0.05,
                            ease: "easeOut"
                          }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Show More / Less Button */}
            {sortedData.length > 5 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onClick={() => setShowAll(!showAll)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 mt-1 text-xs font-medium text-slate-600 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    Show {remainingCount} more categories
                  </>
                )}
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-200/50"
      >
        <div className="flex items-center gap-4">
          <span>Most popular: <span className="font-medium text-slate-600">{sortedData[0]?.name || 'N/A'}</span></span>
          <span>•</span>
          <span>{sortedData.length} total categories</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-600">
            {total > 0 ? `${sortedData[0]?.value || 0} books in top category` : 'No data'}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}