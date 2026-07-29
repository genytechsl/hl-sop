"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";

import { Download, Calendar, AlertTriangle, Clock3 } from "lucide-react";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
interface Ticket {
  id: string;
  scope: string;
  createdAt: string;
}

interface ChartData {
  scope: string;
  total: number;
  percentage: number;
}

const COLORS = [
  "#004737",
  "#0f9983",
  "#19e334",
  "#4fb67c",
  "#7ccf98",
  "#b8efd0",
];

export default function ScopeDistributionChart() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    const res = await fetch("/api/tickets");
    const data = await res.json();

    setTickets(data);

    if (data.length > 0) {
      const latest = data[0].createdAt.substring(0, 7);
      setSelectedMonth(latest);
    }
  }

  const months = useMemo(() => {
    return [...new Set(tickets.map((t) => t.createdAt.substring(0, 7)))];
  }, [tickets]);

  const chartData = useMemo(() => {
    const filtered = tickets.filter((ticket) =>
      ticket.createdAt.startsWith(selectedMonth),
    );

    const total = filtered.length;

    const grouped: Record<string, number> = {};

    filtered.forEach((ticket) => {
      grouped[ticket.scope] = (grouped[ticket.scope] || 0) + 1;
    });

    return Object.entries(grouped)
      .map(([scope, value]) => ({
        scope,
        total: value,
        percentage: Number(((value / total) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [tickets, selectedMonth]);

  const totalTickets = chartData.reduce((sum, item) => sum + item.total, 0);

  async function downloadPdf() {
    if (!cardRef.current) return;

    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      backgroundColor: "#fff",
    });

    const pdf = new jsPDF();

    const width = pdf.internal.pageSize.getWidth();
    const height =
      (cardRef.current.offsetHeight * width) / cardRef.current.offsetWidth;

    pdf.addImage(dataUrl, "PNG", 0, 10, width, height);
    pdf.save("sla-breach-rate-report.pdf");
  }

  return (
    <div ref={cardRef} className="white-card-graph">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Monthly Volume & Data Profile
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Resource deployment based on historical ticket distribution.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-2 text-sm font-medium text-slate-700 transition-all hover:border-[#004737] hover:bg-[#004737] hover:text-white"
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-[#004737] hover:bg-[#004737] hover:text-white"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Chart */}

      <div className="mt-8 h-[450px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{
              left: 40,
              right: 30,
            }}
          >
            <XAxis type="number" hide />

            <YAxis
              type="category"
              dataKey="scope"
              width={120}
              tick={{
                fill: "#334155",
                fontSize: 13,
              }}
            />

            <Tooltip cursor={false} formatter={(value: any) => `${value}%`} />

            <Bar
              dataKey="percentage"
              radius={[0, 12, 12, 0]}
              animationDuration={1200}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}

              <LabelList
                dataKey="percentage"
                position="right"
                // format={(value: number) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex justify-between border-t pt-5">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Total Tickets
          </p>

          <h3 className="mt-1 text-3xl font-bold text-[#004737]">
            {totalTickets}
          </h3>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Resource Distribution
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Historical scope allocation
          </p>
        </div>
      </div>
    </div>
  );
}
