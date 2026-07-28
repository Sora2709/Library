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
} from "recharts";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ui/states";
import { useState, useMemo } from "react";

type TimeRange = "12M" | "6M" | "30D";

export function BorrowingTrendChart() {
  const [timeRange, setTimeRange] = useState<TimeRange>("12M");
  const { data, loading } = useApi<{ chartData: { name: string; borrows: number; returns: number }[] }>("/api/dashboard");

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-sm text-slate-400">
        No borrowing data available for this period. Issue some books to see the chart.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ✅ Title and filters in the same row */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Monthly borrows and returns over the last year
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setTimeRange("12M")}
            className={`text-xs font-medium rounded-md px-2.5 py-1 transition-colors ${
              timeRange === "12M"
                ? "text-primary-600 bg-primary-50"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            12M
          </button>
          <button
            onClick={() => setTimeRange("6M")}
            className={`text-xs font-medium rounded-md px-2.5 py-1 transition-colors ${
              timeRange === "6M"
                ? "text-primary-600 bg-primary-50"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            6M
          </button>
          <button
            onClick={() => setTimeRange("30D")}
            className={`text-xs font-medium rounded-md px-2.5 py-1 transition-colors ${
              timeRange === "30D"
                ? "text-primary-600 bg-primary-50"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            30D
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
              }}
              labelStyle={{ fontWeight: 600, color: "#0f172a", marginBottom: 4 }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: 12 }}
            />
            <Area
              type="monotone"
              dataKey="borrows"
              name="Borrows"
              stroke="#4f46e5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorBorrows)"
            />
            <Area
              type="monotone"
              dataKey="returns"
              name="Returns"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorReturns)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}