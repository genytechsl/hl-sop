"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

import { AlertTriangle, Clock3, Info } from "lucide-react";

import jsPDF from "jspdf";
import { toPng } from "html-to-image";

interface Ticket {
  status: string;
  slaTarget: string;
  createdAt: string;
  ticketType: string;
}

interface TicketTypeBreakdownProps {
  complaints: number;
  inquiries: number;
  total: number;

  complaintsTotal: number;
  inquiriesTotal: number;

  compact?: boolean;
}

export default function SlaBreachRateCard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

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
    } catch (error) {
      console.error("Failed to load tickets:", error);
    }
  }

  function getHoursFromSla(sla: string) {
    const value = parseInt(sla);

    if (sla.includes("wd")) return value * 24 * 5;
    if (sla.includes("d")) return value * 24;

    return value;
  }

  const metrics = useMemo(() => {
    const now = new Date();

    let breached = 0;

    let closedTickets = 0;
    let breachedClosed = 0;

    let openedTickets = 0;
    let breachedOpened = 0;

    // =====================================================
    // TOTAL COUNTS BY TYPE
    // =====================================================

    let totalComplaints = 0;
    let totalInquiries = 0;

    // =====================================================
    // ACTIVE BREACHED COUNTS BY TYPE
    // =====================================================

    let breachedComplaints = 0;
    let breachedInquiries = 0;

    // =====================================================
    // CLOSED TOTAL + BREACHED COUNTS BY TYPE
    // =====================================================

    let closedComplaints = 0;
    let closedInquiries = 0;

    let closedBreachedComplaints = 0;
    let closedBreachedInquiries = 0;

    // =====================================================
    // OPEN / IN PROGRESS TOTAL + BREACHED COUNTS BY TYPE
    // =====================================================

    let openedComplaints = 0;
    let openedInquiries = 0;

    let openedBreachedComplaints = 0;
    let openedBreachedInquiries = 0;

    tickets.forEach((ticket) => {
      const created = new Date(ticket.createdAt.replace(" ", "T"));

      const age = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

      const isBreached = age > getHoursFromSla(ticket.slaTarget);

      // IMPORTANT:
      // Database values are COM and INQ
      const type = ticket.ticketType?.trim().toUpperCase();

      const isComplaint = type === "COM";
      const isInquiry = type === "INQ";

      const isClosed = ticket.status === "CLOSED";

      const isOpen =
        ticket.status === "OPEN" || ticket.status === "IN_PROGRESS";

      // =====================================================
      // OVERALL TOTAL BY TYPE
      // =====================================================

      if (isComplaint) {
        totalComplaints++;
      }

      if (isInquiry) {
        totalInquiries++;
      }

      // =====================================================
      // CLOSED
      // =====================================================

      if (isClosed) {
        closedTickets++;

        if (isComplaint) {
          closedComplaints++;
        }

        if (isInquiry) {
          closedInquiries++;
        }

        if (isBreached) {
          breachedClosed++;

          if (isComplaint) {
            closedBreachedComplaints++;
          }

          if (isInquiry) {
            closedBreachedInquiries++;
          }
        }
      }

      // =====================================================
      // OPEN / IN PROGRESS
      // =====================================================

      if (isOpen) {
        openedTickets++;

        if (isComplaint) {
          openedComplaints++;
        }

        if (isInquiry) {
          openedInquiries++;
        }

        if (isBreached) {
          breachedOpened++;

          if (isComplaint) {
            openedBreachedComplaints++;
          }

          if (isInquiry) {
            openedBreachedInquiries++;
          }
        }
      }

      // =====================================================
      // ACTIVE BREACHED
      // =====================================================

      if (isOpen && isBreached) {
        breached++;

        if (isComplaint) {
          breachedComplaints++;
        }

        if (isInquiry) {
          breachedInquiries++;
        }
      }
    });

    return {
      breached,
      total: tickets.length,

      percentage:
        tickets.length === 0
          ? 0
          : Number(((breached / tickets.length) * 100).toFixed(1)),

      closedBreachRate:
        closedTickets === 0
          ? 0
          : Number(((breachedClosed / closedTickets) * 100).toFixed(1)),

      openedBreachRate:
        openedTickets === 0
          ? 0
          : Number(((breachedOpened / openedTickets) * 100).toFixed(1)),

      // =====================================================
      // OVERALL
      // =====================================================

      totalComplaints,
      totalInquiries,

      breachedComplaints,
      breachedInquiries,

      // =====================================================
      // CLOSED
      // =====================================================

      closedComplaints,
      closedInquiries,

      closedBreachedComplaints,
      closedBreachedInquiries,

      // =====================================================
      // OPEN
      // =====================================================

      openedComplaints,
      openedInquiries,

      openedBreachedComplaints,
      openedBreachedInquiries,
    };
  }, [tickets]);

  // =====================================================
  // MAIN CHART
  // =====================================================

  const chartData = [
    {
      value: metrics.percentage,
    },
  ];

  const color =
    metrics.percentage < 25
      ? "#19e334"
      : metrics.percentage < 50
        ? "#c1e319"
        : metrics.percentage < 575
          ? "#f59e0b"
          : "#ef4444";

  // =====================================================
  // PDF
  // =====================================================

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
    <div ref={cardRef} className="white-card-graph relative overflow-visible">
      {/* Premium gradient top border */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          {/* <div className="rounded-xl bg-red-50 p-3">
            <AlertTriangle size={20} className="text-red-600" />
          </div> */}

          <div className="flex">
            <h2 className="section-heading">SLA Breach Rate</h2>
            <div className="group relative ml-4 mt-1">
              <Info
                size={18}
                className="cursor-help text-slate-400 transition hover:text-emerald-600"
              />

              <div
                className="
      absolute
      left-1/2
      top-7
      z-50
      hidden
      w-72
      -translate-x-1/2
      rounded-xl
      bg-slate-800
      px-4
      py-3
      text-sm
      text-white
      shadow-xl
      group-hover:block
    "
              >
                gufu
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MAIN CHART + BREAKDOWN */}
      {/* ================================================= */}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* MAIN RADIAL CHART */}

        <div className="flex min-w-0 items-center">
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="78%"
                outerRadius="100%"
                startAngle={90}
                endAngle={-270}
                data={chartData}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

                <RadialBar
                  dataKey="value"
                  cornerRadius={20}
                  fill={color}
                  background
                />

                <text
                  x="50%"
                  y="48%"
                  textAnchor="middle"
                  className="fill-slate-800 text-4xl font-bold"
                >
                  {metrics.percentage}%
                </text>

                <text
                  x="50%"
                  y="58%"
                  textAnchor="middle"
                  className="fill-slate-500 text-sm"
                >
                  Overall Breach
                </text>
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAIN BREAKDOWN */}

        <TicketTypeBreakdown
          complaints={metrics.breachedComplaints}
          inquiries={metrics.breachedInquiries}
          total={metrics.breachedComplaints + metrics.breachedInquiries}
          complaintsTotal={metrics.totalComplaints}
          inquiriesTotal={metrics.totalInquiries}
        />
      </div>

      {/* ================================================= */}
      {/* SMALL SLA CHARTS */}
      {/* ================================================= */}

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* CLOSED */}

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Closed Tickets
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              SLA breach rate and ticket type breakdown
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Radial chart */}

            <div className="h-[130px] w-[130px] shrink-0">
              <ResponsiveContainer>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  data={[
                    {
                      value: metrics.closedBreachRate,
                    },
                  ]}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />

                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={getBreachColor(metrics.closedBreachRate)}
                    background
                  />

                  <text
                    x="50%"
                    y="52%"
                    textAnchor="middle"
                    className="fill-slate-800 text-sm font-bold"
                  >
                    {metrics.closedBreachRate}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown */}

            <div className="min-w-0 flex-1">
              <TicketTypeBreakdown
                complaints={metrics.closedBreachedComplaints}
                inquiries={metrics.closedBreachedInquiries}
                total={
                  metrics.closedBreachedComplaints +
                  metrics.closedBreachedInquiries
                }
                complaintsTotal={metrics.closedComplaints}
                inquiriesTotal={metrics.closedInquiries}
                compact
              />
            </div>
          </div>
        </div>

        {/* OPEN */}

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800">
              Open Tickets
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              SLA breach rate and ticket type breakdown
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Radial chart */}

            <div className="h-[130px] w-[130px] shrink-0">
              <ResponsiveContainer>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  startAngle={90}
                  endAngle={-270}
                  data={[
                    {
                      value: metrics.openedBreachRate,
                    },
                  ]}
                >
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />

                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={getBreachColor(metrics.openedBreachRate)}
                    background
                  />

                  <text
                    x="50%"
                    y="52%"
                    textAnchor="middle"
                    className="fill-slate-800 text-sm font-bold"
                  >
                    {metrics.openedBreachRate}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown */}

            <div className="min-w-0 flex-1">
              <TicketTypeBreakdown
                complaints={metrics.openedBreachedComplaints}
                inquiries={metrics.openedBreachedInquiries}
                total={
                  metrics.openedBreachedComplaints +
                  metrics.openedBreachedInquiries
                }
                complaintsTotal={metrics.openedComplaints}
                inquiriesTotal={metrics.openedInquiries}
                compact
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Clock3 size={18} className="text-red-600" />

            <span className="text-sm text-slate-500">Breached</span>
          </div>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {metrics.breached}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-sm text-slate-500">Total Tickets</div>

          <p className="mt-2 text-3xl font-bold text-[#004737]">
            {metrics.total}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* TICKET TYPE BREAKDOWN                                     */
/* ========================================================= */

function TicketTypeBreakdown({
  complaints,
  inquiries,
  total,
  complaintsTotal,
  inquiriesTotal,
  compact = false,
}: TicketTypeBreakdownProps) {
  // const complaintsTotal = arguments[0].complaintsTotal ?? 0;
  // const inquiriesTotal = arguments[0].inquiriesTotal ?? 0;

  const data = [
    {
      name: "Complaints",
      value: complaints,
      color: "#ef4444",
    },
    {
      name: "Inquiries",
      value: inquiries,
      color: "#3b82f6",
    },
  ];

  const complaintRate =
    complaintsTotal === 0
      ? 0
      : Math.round((complaints / complaintsTotal) * 100);

  const inquiryRate =
    inquiriesTotal === 0 ? 0 : Math.round((inquiries / inquiriesTotal) * 100);

  return (
    <div
      className={`rounded-2xl border border-slate-100 bg-slate-50/70 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      {!compact && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-slate-800">
            Breach Breakdown
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Breached vs total tickets by type
          </p>
        </div>
      )}

      <div className={`flex items-center ${compact ? "gap-3" : "gap-4"}`}>
        {/* DONUT */}

        <div
          className={`shrink-0 ${
            compact ? "h-[95px] w-[95px]" : "h-[140px] w-[140px]"
          }`}
        >
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={compact ? "62%" : "65%"}
                outerRadius={compact ? "88%" : "90%"}
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>

              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* DETAILS */}

        <div className="min-w-0 flex-1">
          <div className="mb-3">
            <p
              className={
                compact
                  ? "text-lg font-bold text-slate-800"
                  : "text-2xl font-bold text-slate-800"
              }
            >
              {total}
            </p>

            <p className="text-xs text-slate-500">Breached tickets</p>
          </div>

          {/* COMPLAINTS */}

          <div className="mb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />

                <span className="truncate text-xs font-medium text-slate-600">
                  Complaints
                </span>
              </div>

              <span className="text-sm font-bold text-slate-800">
                {complaints}/{complaintsTotal}
              </span>
            </div>

            <div className="mt-1 flex justify-end">
              <span className="text-[11px] text-red-500">
                {complaintRate}% breached
              </span>
            </div>
          </div>

          {/* INQUIRIES */}

          <div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />

                <span className="truncate text-xs font-medium text-slate-600">
                  Inquiries
                </span>
              </div>

              <span className="text-sm font-bold text-slate-800">
                {inquiries}/{inquiriesTotal}
              </span>
            </div>

            <div className="mt-1 flex justify-end">
              <span className="text-[11px] text-blue-500">
                {inquiryRate}% breached
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================= */
/* BREACH COLOR                                              */
/* ========================================================= */

function getBreachColor(value: number) {
  if (value < 25) {
    return "#19e334";
  }

  if (value < 50) {
    return "#c1e319";
  }

  if (value < 75) {
    return "#f59e0b";
  }

  return "#ef4444";
}
