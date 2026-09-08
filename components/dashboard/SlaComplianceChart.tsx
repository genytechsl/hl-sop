"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface SlaComplianceItem {
  month: string;
  year: number;
  monthIndex: number;
  compliance: number;
}

export default function SlaComplianceChart() {
  const [chartData, setChartData] = useState<SlaComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadSlaCompliance() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/tickets?slaCompliance=true");

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              data?.error ||
              `Failed to load SLA compliance: ${response.status}`,
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("Invalid SLA compliance data received from server.");
        }

        setChartData(data);
      } catch (error) {
        console.error("Failed to load SLA compliance:", error);
        setChartData([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadSlaCompliance();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[260px] items-center justify-center">
        <p className="text-sm text-slate-500">Loading SLA compliance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[260px] items-center justify-center px-6 text-center">
        <div>
          <p className="text-sm font-medium text-slate-700">
            SLA compliance unavailable
          </p>

          <p className="mt-1 text-xs text-slate-500">
            The compliance data could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={chartData}
        margin={{
          top: 10,
          right: 10,
          bottom: 0,
          left: -15,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />

        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />

        <YAxis
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />

        <Tooltip
          formatter={(value) => [`${Number(value ?? 0)}%`, "Compliance"]}
        />

        <Line
          type="monotone"
          dataKey="compliance"
          stroke="#10b981"
          strokeWidth={3}
          dot={{
            r: 4,
          }}
          activeDot={{
            r: 6,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
