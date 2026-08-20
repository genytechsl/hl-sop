"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
  CartesianGrid,
} from "recharts";
import { Calendar, Info } from "lucide-react";

interface Ticket {
  id: string;
  scope: string;
  createdAt: string;
  ticketType: string;
}

interface ChartData {
  scope: string;
  complaints: number;
  inquiries: number;
  total: number;
  complaintPercentage: number;
  inquiryPercentage: number;
}

export default function ScopeDistributionChart() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  async function loadTickets() {
    try {
      const res = await fetch("/api/tickets");

      if (!res.ok) {
        throw new Error("Failed to load tickets");
      }

      const data = await res.json();

      setTickets(data);

      if (data.length > 0) {
        const latest = data
          .map((ticket: Ticket) => ticket.createdAt.substring(0, 7))
          .sort()
          .reverse()[0];

        setSelectedMonth(latest);
      }
    } catch (error) {
      console.error("Failed to load tickets:", error);
    }
  }

  // =========================================================
  // AVAILABLE MONTHS
  // =========================================================

  const months = useMemo(() => {
    return [
      ...new Set(tickets.map((ticket) => ticket.createdAt.substring(0, 7))),
    ].sort((a, b) => b.localeCompare(a));
  }, [tickets]);

  // =========================================================
  // SCOPE + TICKET TYPE BREAKDOWN
  // =========================================================

  const chartData = useMemo<ChartData[]>(() => {
    const filtered = tickets.filter((ticket) =>
      ticket.createdAt.startsWith(selectedMonth),
    );

    const grouped: Record<
      string,
      {
        complaints: number;
        inquiries: number;
      }
    > = {};

    filtered.forEach((ticket) => {
      const scope = ticket.scope?.trim() || "Unspecified";
      const type = ticket.ticketType?.trim().toUpperCase();

      if (!grouped[scope]) {
        grouped[scope] = {
          complaints: 0,
          inquiries: 0,
        };
      }

      if (type === "COM") {
        grouped[scope].complaints++;
      }

      if (type === "INQ") {
        grouped[scope].inquiries++;
      }
    });

    return Object.entries(grouped)
      .map(([scope, values]) => {
        const total = values.complaints + values.inquiries;

        return {
          scope,
          complaints: values.complaints,
          inquiries: values.inquiries,
          total,

          complaintPercentage:
            total === 0
              ? 0
              : Number(((values.complaints / total) * 100).toFixed(1)),

          inquiryPercentage:
            total === 0
              ? 0
              : Number(((values.inquiries / total) * 100).toFixed(1)),
        };
      })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [tickets, selectedMonth]);

  // =========================================================
  // OVERALL TOTALS
  // =========================================================

  const totals = useMemo(() => {
    const complaints = chartData.reduce(
      (sum, item) => sum + item.complaints,
      0,
    );

    const inquiries = chartData.reduce((sum, item) => sum + item.inquiries, 0);

    return {
      complaints,
      inquiries,
      total: complaints + inquiries,
    };
  }, [chartData]);

  // =========================================================
  // CUSTOM TOOLTIP
  // =========================================================

  function CustomTooltip({
    active,
    label,
  }: {
    active?: boolean;
    label?: string;
  }) {
    if (!active) return null;

    const row = chartData.find((item) => item.scope === label);

    if (!row) return null;

    return (
      <div className="min-w-[210px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
        <div className="mb-2 border-b border-slate-100 pb-2">
          <p className="text-sm font-semibold text-slate-800">{row.scope}</p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {row.total} total tickets
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-medium text-slate-600">
              Complaints
            </span>
          </div>

          <div>
            <span className="text-sm font-bold text-slate-800">
              {row.complaints}
            </span>

            <span className="ml-1 text-[11px] text-slate-400">
              ({row.complaintPercentage}%)
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <span className="text-xs font-medium text-slate-600">
              Inquiries
            </span>
          </div>

          <div>
            <span className="text-sm font-bold text-slate-800">
              {row.inquiries}
            </span>

            <span className="ml-1 text-[11px] text-slate-400">
              ({row.inquiryPercentage}%)
            </span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // COMPLAINT LABEL
  // =========================================================

  function ComplaintLabel(props: any) {
    const { x, y, width, height, value } = props;

    if (!value || value === 0 || width < 45 || height < 18) {
      return null;
    }

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        fontSize={10}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        COM {value}
      </text>
    );
  }

  // =========================================================
  // INQUIRY LABEL
  // =========================================================

  function InquiryLabel(props: any) {
    const { x, y, width, height, value } = props;

    if (!value || value === 0 || width < 45 || height < 18) {
      return null;
    }

    return (
      <text
        x={x + width / 2}
        y={y + height / 2}
        fill="#ffffff"
        fontSize={10}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        INQ {value}
      </text>
    );
  }

  // =========================================================
  // TOTAL LABEL
  // =========================================================

  function TotalLabel(props: any) {
    const { x, y, width, height, value } = props;

    if (!value) return null;

    return (
      <text
        x={x + width + 10}
        y={y + height / 2}
        fill="#475569"
        fontSize={11}
        fontWeight={700}
        dominantBaseline="middle"
      >
        {value}
      </text>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div ref={cardRef} className="w-full px-3 py-3">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="section-heading">Monthly Volume & Data Profile</h2>
        <Info size={16} className="text-slate-500" />
      </div>
      {/* =====================================================
          TOP SECTION
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* LEFT - COMPACT SUMMARY */}

        <div className="flex items-center gap-2">
          {/* TOTAL */}

          <div className="rounded-xl bg-slate-50 px-3 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Total
            </p>

            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-bold leading-none text-[#004737]">
                {totals.total}
              </span>

              <span className="text-[9px] text-slate-400">tickets</span>
            </div>
          </div>

          {/* COMPLAINTS */}

          <div className="rounded-xl border border-red-100 bg-red-50/50 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                COM
              </p>
            </div>

            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-bold leading-none text-slate-800">
                {totals.complaints}
              </span>

              <span className="text-[9px] text-slate-400">
                {totals.total === 0
                  ? 0
                  : ((totals.complaints / totals.total) * 100).toFixed(0)}
                %
              </span>
            </div>
          </div>

          {/* INQUIRIES */}

          <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                INQ
              </p>
            </div>

            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-lg font-bold leading-none text-slate-800">
                {totals.inquiries}
              </span>

              <span className="text-[9px] text-slate-400">
                {totals.total === 0
                  ? 0
                  : ((totals.inquiries / totals.total) * 100).toFixed(0)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT - MONTH SELECTOR */}

        <div className="relative shrink-0">
          <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="
              h-9
              rounded-xl
              border
              border-slate-200
              bg-white
              pl-8
              pr-3
              text-xs
              font-medium
              text-slate-700
              transition-all
              hover:border-[#004737]
              focus:border-[#004737]
              focus:outline-none
              focus:ring-2
              focus:ring-[#004737]/10
            "
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =====================================================
          TITLE / LEGEND
      ====================================================== */}

      <div className="mt-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Scope Distribution
          </h2>

          <p className="mt-0.5 text-[11px] text-slate-400">
            Complaints vs inquiries across operational scopes
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-[10px] font-medium text-slate-500">COM</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />

            <span className="text-[10px] font-medium text-slate-500">INQ</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CHART
      ====================================================== */}

      <div
        className="mt-2"
        style={{
          height: Math.max(260, chartData.length * 58),
        }}
      >
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500">
                No ticket data available
              </p>

              <p className="mt-1 text-xs text-slate-400">
                There are no tickets for the selected month.
              </p>
            </div>
          </div>
        ) : (
          // <ResponsiveContainer width="100%" height="100%">
          //   <BarChart
          //     data={chartData}
          //     layout="vertical"
          //     // isAnimationActive={true}
          //     margin={{
          //       top: 5,
          //       right: 30,
          //       left: 5,
          //       bottom: 5,
          //     }}
          //     barCategoryGap="28%"
          //   >
          //     <CartesianGrid
          //       horizontal={false}
          //       strokeDasharray="3 3"
          //       stroke="#e2e8f0"
          //     />

          //     <XAxis type="number" hide domain={[0, "dataMax"]} />

          //     <YAxis
          //       type="category"
          //       dataKey="scope"
          //       width={105}
          //       axisLine={false}
          //       tickLine={false}
          //       tick={{
          //         fill: "#334155",
          //         fontSize: 11,
          //         fontWeight: 500,
          //       }}
          //     />

          //     <Tooltip
          //       cursor={{
          //         fill: "rgba(15, 23, 42, 0.025)",
          //       }}
          //       content={<CustomTooltip />}
          //     />

          //     {/* COMPLAINTS */}

          //     <Bar
          //       dataKey="complaints"
          //       name="Complaints"
          //       stackId="tickets"
          //       fill="#ef4444"
          //       radius={[8, 0, 0, 8]}
          //       animationBegin={0}
          //       animationDuration={1400}
          //       animationEasing="ease-out"
          //     >
          //       <LabelList dataKey="complaints" content={<ComplaintLabel />} />
          //     </Bar>

          //     {/* INQUIRIES */}

          //     <Bar
          //       dataKey="inquiries"
          //       name="Inquiries"
          //       stackId="tickets"
          //       fill="#3b82f6"
          //       radius={[0, 8, 8, 0]}
          //       animationBegin={150}
          //       animationDuration={1600}
          //       animationEasing="ease-out"
          //     >
          //       <LabelList dataKey="inquiries" content={<InquiryLabel />} />

          //       <LabelList dataKey="total" content={<TotalLabel />} />
          //     </Bar>
          //   </BarChart>
          // </ResponsiveContainer>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 5,
                bottom: 5,
              }}
              barCategoryGap="28%"
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 3"
                stroke="#e2e8f0"
              />

              <XAxis type="number" hide domain={[0, "dataMax"]} />

              <YAxis
                type="category"
                dataKey="scope"
                width={105}
                axisLine={false}
                tickLine={false}
                tick={{
                  fill: "#334155",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              />

              <Tooltip
                cursor={{
                  fill: "rgba(15, 23, 42, 0.025)",
                }}
                content={<CustomTooltip />}
              />

              {/* COMPLAINTS */}
              <Bar
                dataKey="complaints"
                name="Complaints"
                stackId="tickets"
                fill="#ef4444"
                radius={[8, 0, 0, 8]}
                isAnimationActive={true}
                animationBegin={100}
                animationDuration={1800}
                animationEasing="ease-out"
              >
                <LabelList dataKey="complaints" content={<ComplaintLabel />} />
              </Bar>

              {/* INQUIRIES */}
              <Bar
                dataKey="inquiries"
                name="Inquiries"
                stackId="tickets"
                fill="#3b82f6"
                radius={[0, 8, 8, 0]}
                isAnimationActive={true}
                animationBegin={100}
                animationDuration={1800}
                animationEasing="ease-out"
              >
                <LabelList dataKey="inquiries" content={<InquiryLabel />} />

                <LabelList dataKey="total" content={<TotalLabel />} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Reporting Period
          </p>

          <p className="mt-0.5 text-xs font-medium text-slate-600">
            {selectedMonth || "—"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Active Scopes
          </p>

          <p className="mt-0.5 text-xs font-semibold text-slate-700">
            {chartData.length}
          </p>
        </div>
      </div>
    </div>
  );
}
