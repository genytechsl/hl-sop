"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";

import { propertyTicketData } from "./dashboard-chart-data";

export default function PropertyBarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart
        layout="vertical"
        data={propertyTicketData}
        margin={{
          top: 10,
          right: 40,
          left: 20,
          bottom: 10,
        }}
        barCategoryGap={18}
      >
        <defs>
          <linearGradient id="ticketGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        <XAxis type="number" axisLine={false} tickLine={false} />

        <YAxis
          type="category"
          dataKey="property"
          width={120}
          axisLine={false}
          tickLine={false}
        />

        <Tooltip
          cursor={{
            fill: "rgba(59,130,246,0.08)",
          }}
          contentStyle={{
            borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#0f172a",
          }}
        />

        <Bar
          dataKey="tickets"
          fill="url(#ticketGradient)"
          radius={[0, 14, 14, 0]}
          barSize={24}
          background={{
            fill: "#e2e8f0",
            radius: [0, 14, 14, 0],
          }}
        >
          <LabelList
            dataKey="tickets"
            position="right"
            className="fill-slate-700 font-semibold"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
