"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface OwnerPerformance {
  name: string;
  tickets: number;
}

export default function ActionOwnerPerformanceChart() {
  const [owners, setOwners] = useState<OwnerPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadOwnerPerformance = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await fetch("/api/tickets?ownerWorkload=true");

        if (!res.ok) {
          throw new Error(`Failed to load owner performance: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid owner performance data");
        }

        setOwners(data);
      } catch (err) {
        console.error("Failed to load owner performance:", err);
        setOwners([]);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadOwnerPerformance();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[260px] w-full items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading action owner performance...
        </div>
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
            We couldn't load the action owner performance data. Please try again
            later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={owners} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis type="number" />

        <YAxis type="category" dataKey="name" width={120} />

        <Tooltip />

        <Bar dataKey="tickets" fill="#3b82f6" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
