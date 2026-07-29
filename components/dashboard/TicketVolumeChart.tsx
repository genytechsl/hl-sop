"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { ticketVolumeData } from "./dashboard-chart-data";

export default function TicketVolumeChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={ticketVolumeData}>
        <XAxis dataKey="month" />
        <YAxis />

        <Tooltip />

        <Line type="monotone" dataKey="open" stroke="#3b82f6" strokeWidth={3} />

        <Line
          type="monotone"
          dataKey="inProgress"
          stroke="#f59e0b"
          strokeWidth={3}
        />

        <Line
          type="monotone"
          dataKey="closed"
          stroke="#10b981"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
