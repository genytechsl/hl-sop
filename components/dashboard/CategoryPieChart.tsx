"use client";

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

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    category,
  }: any) => {
    if (!percent || percent === 0) return null;

    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 22;

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
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {category} {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center">
        <div className="text-sm text-slate-500">Loading ticket volume...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center px-6 text-center">
        <div>
          <p className="text-base font-medium text-slate-700">
            Data unavailable at the moment
          </p>

          <p className="mt-1 text-sm text-slate-500">
            We couldn't load the ticket volume data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={115}
              paddingAngle={3}
              cornerRadius={10}
              stroke="white"
              strokeWidth={2}
              label={renderLabel}
              labelLine
            >
              {chartData.map((entry) => (
                <Cell key={entry.category} fill={entry.fill} />
              ))}
            </Pie>

            <text
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-900 text-3xl font-bold"
            >
              {totalTickets}
            </text>

            <text
              x="50%"
              y="58%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-500 text-sm"
            >
              Tickets
            </text>

            <Tooltip
              formatter={(value) => [`${Number(value ?? 0)} Tickets`, "Volume"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chartData.map((item) => (
          <div
            key={item.category}
            className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1"
          >
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: item.fill }}
            />

            <span className="text-xs font-medium text-slate-700">
              {item.category} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
