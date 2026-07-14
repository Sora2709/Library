"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useApi } from "@/hooks/useApi";
import { Loading } from "@/components/ui/states";

interface CatData {
  name: string;
  value: number;
  color: string;
}

export function CategoryChart() {
  const { data, loading } = useApi<{ categoryDistribution: CatData[] }>("/api/dashboard");

  if (loading) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const categoryDistribution = data?.categoryDistribution ?? [];
  const total = categoryDistribution.reduce((sum, c) => sum + c.value, 0);

  if (categoryDistribution.length === 0) {
    return (
      <div className="h-[200px] w-full flex items-center justify-center text-sm text-slate-400">
        No book categories yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-[200px] w-full flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryDistribution}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {categoryDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: unknown) => {
                const v = Number(value);
                return [`${v} book${v !== 1 ? "s" : ""} (${total ? ((v / total) * 100).toFixed(1) : 0}%)`, "Count"];
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-bold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500">Total Books</p>
        </div>
      </div>
      <div className="space-y-2 mt-2">
        {categoryDistribution.slice(0, 5).map((cat) => (
          <div key={cat.name} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: cat.color }}
            />
            <span className="text-xs text-slate-600 flex-1 truncate">{cat.name}</span>
            <span className="text-xs font-semibold text-slate-900">
              {cat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
