"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import { categoryVolumeData } from "./dashboard-chart-data";

export default function CategoryPieChart() {
  const totalTickets = categoryVolumeData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    category,
  }: any) => {
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
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryVolumeData}
          dataKey="value"
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
          {categoryVolumeData.map((entry) => (
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

        <Tooltip />
        <div className="mt-4 flex justify-center gap-2">
          {categoryVolumeData.map((item) => (
            <div
              key={item.category}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-xs font-medium">{item.category}</span>
            </div>
          ))}
        </div>
      </PieChart>
    </ResponsiveContainer>
  );
}
