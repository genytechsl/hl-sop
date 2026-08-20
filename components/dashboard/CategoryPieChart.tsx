"use client";

import { Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface CategoryVolume {
  category: string;
  value: number;
}

const COLORS: Record<string, string> = {
  "CAT-A": "#ef4444",
  "CAT-B": "#3b82f6",
  "CAT-B2": "#1685A5",
  "CAT-C": "#64748b",
  "CAT-D": "#a855f7",
};

export default function CategoryPieChart() {
  const [categoryData, setCategoryData] = useState<CategoryVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadCategoryVolume() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/tickets?categoryVolume=true");

        if (!response.ok) {
          throw new Error(`Failed to load category volume: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid category volume data");
        }

        setCategoryData(data);
      } catch (error) {
        console.error("Failed to load category volume:", error);
        setCategoryData([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadCategoryVolume();
  }, []);

  const chartData = useMemo(() => {
    return categoryData.map((item) => ({
      category: item.category,
      value: item.value,
      fill: COLORS[item.category] ?? "#94a3b8",
    }));
  }, [categoryData]);

  const totalTickets = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    if (!percent || percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;

    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#475569"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        style={{
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div className="text-xs text-slate-500">Loading ticket volume...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center px-3 text-center">
        <div>
          <p className="text-sm font-medium text-slate-700">
            Data unavailable at the moment
          </p>

          <p className="mt-1 text-xs text-slate-500">
            We couldn't load the ticket volume data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="section-heading">Volume by Category</h2>
        <Info size={16} className="text-slate-500" />
      </div>
      {/* Chart */}
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="42%"
              outerRadius="68%"
              paddingAngle={3}
              cornerRadius={8}
              stroke="white"
              strokeWidth={2}
              label={renderLabel}
              labelLine={false}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1800}
              animationEasing="ease-out"
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>

            {/* Center total */}
            <text
              x="50%"
              y="47%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-900 text-2xl font-bold"
            >
              {totalTickets}
            </text>

            <text
              x="50%"
              y="56%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-xs"
            >
              Tickets
            </text>

            <Tooltip
              formatter={(value) => [`${Number(value ?? 0)} Tickets`, "Volume"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex shrink-0 flex-wrap justify-center gap-1.5 pt-2">
        {chartData.map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1"
          >
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.fill }}
            />

            <span className="text-[10px] font-medium text-slate-700">
              {item.category} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
