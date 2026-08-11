"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface TicketVolume {
  month: string;
  year: number;
  monthIndex: number;
  open: number;
  inProgress: number;
  closed: number;
}

export default function TicketVolumeChart() {
  const [ticketVolumeData, setTicketVolumeData] = useState<TicketVolume[]>([]);
  useEffect(() => {
    fetch("/api/tickets?volume=true")
      .then((res) => res.json())
      .then(setTicketVolumeData);
  }, []);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={ticketVolumeData}>
        <XAxis
          tickMargin={10}
          dataKey="month"
          tick={({ x, y, payload }) => {
            const item = ticketVolumeData.find(
              (m: any) => m.month === payload.value,
            );

            return (
              <g transform={`translate(${x},${y})`}>
                <text textAnchor="middle" fontSize="11" fill="#64748b">
                  <tspan x="0" dy="0">
                    {item?.month}
                  </tspan>
                  <tspan x="0" dy="14">
                    {item?.year}
                  </tspan>
                </text>
              </g>
            );
          }}
        />
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
