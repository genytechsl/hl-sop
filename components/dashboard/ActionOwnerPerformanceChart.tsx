"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    fetch("/api/tickets?ownerWorkload=true")
      .then((res) => res.json())
      .then(setOwners);
  }, []);

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
