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

export function BorrowingTrendChart() {
  const { data, loading } = useApi<{ chartData: { name: string; borrows: number; returns: number }[] }>("/api/dashboard");

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const chartData = data?.chartData ?? [];

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-sm text-slate-400">
        No borrowing data yet. Issue some books to see the chart.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
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
  );
}
