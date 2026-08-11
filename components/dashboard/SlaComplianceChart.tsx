"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Ticket {
  createdAt: string;
  status: string;
  slaTarget: string;
}

export default function SlaComplianceChart() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => res.json())
      .then(setTickets);
  }, []);

  function getSlaHours(sla: string) {
    const value = Number(sla);

    return value;
  }

  function getAgeHours(createdAt: string) {
    const [date, time] = createdAt.split(" ");

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    const created = new Date(year, month - 1, day, hour, minute);

    return (Date.now() - created.getTime()) / (1000 * 60 * 60);
  }

  const chartData = useMemo(() => {
    const months: Record<
      string,
      {
        total: number;
        compliant: number;
      }
    > = {};

    tickets.forEach((ticket) => {
      const month = new Date(ticket.createdAt).toLocaleString("default", {
        month: "short",
      });

      if (!months[month]) {
        months[month] = {
          total: 0,
          compliant: 0,
        };
      }

      months[month].total++;

      if (getAgeHours(ticket.createdAt) <= getSlaHours(ticket.slaTarget)) {
        months[month].compliant++;
      }
    });

    return Object.entries(months).map(([month, value]) => ({
      month,
      compliance: Math.round((value.compliant / value.total) * 100),
    }));
  }, [tickets]);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="month" />

        <YAxis domain={[0, 100]} />

        <Tooltip formatter={(value) => `${value ?? 0}%`} />

        <Line
          type="monotone"
          dataKey="compliance"
          stroke="#10b981"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
