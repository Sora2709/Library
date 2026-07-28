"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Bar,
  BarChart,
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ui/states";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

type TimeRange = "12M" | "6M" | "30D";
type ChartType = "area" | "bar";

export function BorrowingTrendChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("12M");
  const [chartType, setChartType] = useState<ChartType>("area");
  const [isClient, setIsClient] = useState(false);
  const { data, loading } = useApi<{ chartData: { name: string; borrows: number; returns: number }[] }>("/api/dashboard");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredData = useMemo(() => {
    const allData = data?.chartData ?? [];
    if (allData.length === 0) return [];

    const now = new Date();
    const currentMonth = now.getMonth();

    const dataWithIndex = allData.map((item) => ({
      ...item,
      monthIndex: monthNames.indexOf(item.name),
    }));

    const sorted = [...dataWithIndex].sort((a, b) => a.monthIndex - b.monthIndex);

    if (timeRange === "6M") {
      return sorted.filter((item) => {
        if (item.monthIndex === -1) return false;
        let diff = currentMonth - item.monthIndex;
        if (diff < 0) diff += 12;
        return diff < 6;
      });
    }

    if (timeRange === "30D") {
      return sorted.filter((item) => {
        if (item.monthIndex === -1) return false;
        let diff = currentMonth - item.monthIndex;
        if (diff < 0) diff += 12;
        return diff < 2;
      });
    }

    return sorted;
  }, [data, timeRange, monthNames]);

  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    return [...filteredData].sort((a, b) => {
      const aIndex = monthNames.indexOf(a.name);
      const bIndex = monthNames.indexOf(b.name);
      return aIndex - bIndex;
    });
  }, [filteredData, monthNames]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const totalBorrows = chartData.reduce((sum, item) => sum + item.borrows, 0);
    const totalReturns = chartData.reduce((sum, item) => sum + item.returns, 0);
    const avgBorrows = Math.round(totalBorrows / chartData.length);
    const avgReturns = Math.round(totalReturns / chartData.length);
    const maxBorrows = Math.max(...chartData.map(item => item.borrows));
    const maxReturns = Math.max(...chartData.map(item => item.returns));
    
    // Calculate trend
    const lastMonth = chartData[chartData.length - 1];
    const previousMonth = chartData[chartData.length - 2] || lastMonth;
    const trend = lastMonth.borrows - previousMonth.borrows;
    const trendPercent = previousMonth.borrows > 0 
      ? ((trend / previousMonth.borrows) * 100).toFixed(1) 
      : "0";
    
    return {
      totalBorrows,
      totalReturns,
      avgBorrows,
      avgReturns,
      maxBorrows,
      maxReturns,
      trend,
      trendPercent: parseFloat(trendPercent),
      isPositive: trend >= 0,
    };
  }, [chartData]);

  const TimeRangeButton = ({ range, label }: { range: TimeRange; label: string }) => (
    <motion.button
      onClick={() => setTimeRange(range)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`text-xs font-medium rounded-lg px-3 py-1.5 transition-all duration-200 ${
        timeRange === range
          ? "text-blue-600 bg-blue-50 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/20"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {label}
    </motion.button>
  );

  const ChartTypeButton = ({ type, icon: Icon, label }: { type: ChartType; icon: any; label: string }) => (
    <motion.button
      onClick={() => setChartType(type)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-1.5 rounded-lg transition-all duration-200 ${
        chartType === type
          ? "text-blue-600 bg-blue-50 shadow-sm shadow-blue-500/10"
          : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
      }`}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-[380px] w-full flex flex-col items-center justify-center gap-3"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
          <div className="relative h-8 w-8 animate-spin rounded-full border-2 border-blue-500/30 border-t-blue-500" />
        </div>
        <p className="text-sm text-slate-400 animate-pulse">Loading chart data...</p>
      </motion.div>
    );
  }

  if (chartData.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[350px] w-full flex flex-col items-center justify-center text-center bg-gradient-to-br from-slate-50/50 to-blue-50/30 rounded-xl border border-slate-200/50"
      >
        <div className="p-4 bg-blue-50 rounded-full mb-4">
          <Activity className="h-8 w-8 text-blue-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No borrowing data available</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Start issuing books to your patrons and the chart will populate with valuable insights.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full space-y-4"
    >
      {/* Title and filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">
              Borrowing & Returns
            </p>
            <p className="text-xs text-slate-400">
              Monthly activity overview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-0.5 bg-slate-50/80 rounded-lg p-0.5 ring-1 ring-slate-200/50">
            <TimeRangeButton range="12M" label="12M" />
            <TimeRangeButton range="6M" label="6M" />
            <TimeRangeButton range="30D" label="30D" />
          </div>
          <div className="flex items-center gap-0.5 bg-slate-50/80 rounded-lg p-0.5 ring-1 ring-slate-200/50 ml-2">
            <ChartTypeButton type="area" icon={LineChartIcon} label="Area chart" />
            <ChartTypeButton type="bar" icon={BarChart3} label="Bar chart" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <div className="bg-gradient-to-br from-blue-50/80 to-blue-100/30 rounded-xl p-3 border border-blue-100/50">
            <p className="text-xs text-blue-600 font-medium">Total Borrows</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalBorrows}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-600">+{stats.avgBorrows} avg</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 rounded-xl p-3 border border-emerald-100/50">
            <p className="text-xs text-emerald-600 font-medium">Total Returns</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalReturns}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingDown className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-600">+{stats.avgReturns} avg</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50/80 to-purple-100/30 rounded-xl p-3 border border-purple-100/50">
            <p className="text-xs text-purple-600 font-medium">Peak Borrows</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stats.maxBorrows}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Activity className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-purple-600">Highest month</span>
            </div>
          </div>
          
          <div className={`bg-gradient-to-br from-${stats.isPositive ? 'green' : 'red'}-50/80 to-${stats.isPositive ? 'green' : 'red'}-100/30 rounded-xl p-3 border border-${stats.isPositive ? 'green' : 'red'}-100/50`}>
            <p className={`text-xs text-${stats.isPositive ? 'green' : 'red'}-600 font-medium`}>Trend</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {stats.isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xl font-bold ${stats.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {stats.trendPercent}%
              </span>
            </div>
            <p className={`text-xs ${stats.isPositive ? 'text-green-600' : 'text-red-600'} mt-0.5`}>
              {stats.isPositive ? '↑ Upward trend' : '↓ Downward trend'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="h-[280px] w-full bg-gradient-to-br from-white to-slate-50/50 rounded-xl p-2 ring-1 ring-slate-200/50"
      >
        {isClient && (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "area" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
                  itemStyle={{ padding: "2px 0" }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/50 p-4 min-w-[180px]">
                          <p className="font-semibold text-slate-900 text-sm mb-2">{label}</p>
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-6 py-1">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-xs text-slate-600">{entry.name}</span>
                              </div>
                              <span className="text-xs font-semibold text-slate-900">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ 
                    fontSize: "12px", 
                    paddingTop: 8,
                    fontWeight: 500,
                    color: "#64748b"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="borrows"
                  name="Borrows"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBorrows)"
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
                <Area
                  type="monotone"
                  dataKey="returns"
                  name="Returns"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorReturns)"
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="barReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={5}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ 
                    fontSize: "12px", 
                    paddingTop: 8,
                    fontWeight: 500,
                    color: "#64748b"
                  }}
                />
                <Bar
                  dataKey="borrows"
                  name="Borrows"
                  fill="url(#barBorrows)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
                <Bar
                  dataKey="returns"
                  name="Returns"
                  fill="url(#barReturns)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between text-xs text-slate-400 pt-1"
      >
        <span>Data updated in real-time</span>
        <span>Last 12 months • {chartData.length} months shown</span>
      </motion.div>
    </motion.div>
  );
}