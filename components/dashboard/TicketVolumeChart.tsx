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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadTicketVolume = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await fetch("/api/tickets?volume=true");

        if (!res.ok) {
          throw new Error(`Failed to load ticket volume: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid ticket volume data");
        }

        setTicketVolumeData(data);
      } catch (err) {
        console.error("Failed to load ticket volume:", err);
        setTicketVolumeData([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadTicketVolume();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center">
        <div className="text-sm text-slate-500">Loading ticket volume...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center px-6 text-center">
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
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={ticketVolumeData}>
        <XAxis
          tickMargin={10}
          dataKey="month"
          tick={({ x, y, payload }) => {
            const item = ticketVolumeData.find(
              (m) => m.month === payload.value,
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
