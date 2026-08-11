"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

interface Ticket {
  category: string;
}

const COLORS: Record<string, string> = {
  "CAT-A": "#ef4444",
  "CAT-B": "#3b82f6",
  "CAT-B2": "#22c55e",
  "CAT-C": "#64748b",
  "CAT-D": "#a855f7",
};

export default function CategoryPieChart() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then(setTickets)
      .catch(console.error);
  }, []);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {
      "CAT-A": 0,
      "CAT-B": 0,
      "CAT-B2": 0,
      "CAT-C": 0,
      "CAT-D": 0,
    };

    tickets.forEach((ticket) => {
      if (counts[ticket.category] !== undefined) {
        counts[ticket.category]++;
      }
    });

    return Object.entries(counts).map(([category, value]) => ({
      category,
      value,
      fill: COLORS[category],
    }));
  }, [tickets]);

  const totalTickets = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    category,
  }: any) => {
    if (percent === 0) return null;

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

      {/* Legend */}
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
            <span className="text-xs font-medium">
              {item.category} ({item.value})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
