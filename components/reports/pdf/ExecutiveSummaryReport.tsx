"use client";

import { forwardRef, useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ExecutiveSummaryReport as ExecutiveSummaryReportData } from "@/types/executive-report";

interface Props {
  data: ExecutiveSummaryReportData;
}

const CATEGORY_COLORS: Record<string, string> = {
  "CAT-A": "#ef4444",
  "CAT-B": "#3b82f6",
  "CAT-B2": "#0891b2",
  "CAT-C": "#64748b",
  "CAT-D": "#a855f7",
};

const ExecutiveSummaryReport = forwardRef<HTMLDivElement, Props>(
  function ExecutiveSummaryReport({ data }, ref) {
    const {
      report,
      overview,
      aging,
      categoryVolume,
      ticketVolume,
      ownerWorkload,
      slaBreach,
    } = data;

    const activeTickets = overview.open + overview.inProgress;

    const complaintPercentage =
      overview.total === 0
        ? 0
        : Math.round((overview.totalComplaints / overview.total) * 100);

    const inquiryPercentage =
      overview.total === 0
        ? 0
        : Math.round((overview.totalInquiries / overview.total) * 100);

    const largestCategory = useMemo(() => {
      if (!categoryVolume.length) return null;

      return [...categoryVolume].sort((a, b) => b.value - a.value)[0];
    }, [categoryVolume]);

    const topOwners = useMemo(() => ownerWorkload.slice(0, 8), [ownerWorkload]);

    const volumeData = useMemo(
      () =>
        ticketVolume.map((item) => ({
          ...item,
          period: `${item.month} ${String(item.year).slice(-2)}`,
        })),
      [ticketVolume],
    );

    return (
      <div
        ref={ref}
        className="
          pointer-events-none
          fixed
          left-[-12000px]
          top-0
          flex
          flex-col
          gap-8
          bg-slate-200
        "
      >
        {/* =====================================================
            PAGE 1 — EXECUTIVE OVERVIEW
        ====================================================== */}

        <ReportPage
          report={report}
          page={1}
          totalPages={3}
          subtitle="Executive Overview"
        >
          {/* Report title */}
          <div className="mb-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Management Report
            </p>

            <h1 className="mt-1 text-[30px] font-bold tracking-tight text-slate-950">
              Executive Summary
            </h1>

            <p className="mt-2 max-w-[760px] text-[13px] leading-5 text-slate-500">
              Operational snapshot of ticket volumes, active workload,
              resolution status and SLA performance across the Case Intelligence
              Platform.
            </p>
          </div>

          {/* Main KPI cards */}
          <div className="grid grid-cols-5 gap-3">
            <KpiCard
              label="Total Tickets"
              value={overview.total}
              detail={`${overview.totalComplaints} COM · ${overview.totalInquiries} INQ`}
            />

            <KpiCard
              label="Open"
              value={overview.open}
              detail={`${overview.openComplaints} COM · ${overview.openInquiries} INQ`}
            />

            <KpiCard
              label="In Progress"
              value={overview.inProgress}
              detail={`${overview.inProgressComplaints} COM · ${overview.inProgressInquiries} INQ`}
            />

            <KpiCard
              label="Resolved"
              value={overview.resolved}
              detail={`${overview.resolvedComplaints} COM · ${overview.resolvedInquiries} INQ`}
            />

            <KpiCard
              label="Closed"
              value={overview.closed}
              detail={`${overview.closedComplaints} COM · ${overview.closedInquiries} INQ`}
            />
          </div>

          {/* SLA + executive observations */}
          <div className="mt-5 grid min-h-0 flex-1 grid-cols-[0.9fr_1.1fr] gap-4">
            {/* SLA */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  SLA Performance
                </p>

                <h2 className="mt-1 text-[19px] font-bold text-slate-900">
                  Current Breach Snapshot
                </h2>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-[46px] font-bold tracking-tight text-slate-950">
                    {slaBreach.percentage}%
                  </p>

                  <p className="text-[12px] text-slate-500">
                    Overall breach rate
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[22px] font-bold text-red-600">
                    {slaBreach.breached}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    currently breached
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MetricBox
                  label="Open / In Progress"
                  value={`${slaBreach.openedBreachRate}%`}
                  detail={`${slaBreach.breachedOpened} breached`}
                />

                <MetricBox
                  label="Closed"
                  value={`${slaBreach.closedBreachRate}%`}
                  detail={`${slaBreach.breachedClosed} breached`}
                />
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Complaints breached</span>

                  <span className="font-bold text-slate-800">
                    {slaBreach.breachedComplaints}/{slaBreach.totalComplaints}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Inquiries breached</span>

                  <span className="font-bold text-slate-800">
                    {slaBreach.breachedInquiries}/{slaBreach.totalInquiries}
                  </span>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Executive Snapshot
              </p>

              <h2 className="mt-1 text-[19px] font-bold text-slate-900">
                Key Operational Indicators
              </h2>

              <div className="mt-5 space-y-3">
                <Highlight
                  number="01"
                  title="Active workload"
                  text={`${activeTickets} tickets are currently open or in progress.`}
                />

                <Highlight
                  number="02"
                  title="Ticket composition"
                  text={`${complaintPercentage}% of recorded tickets are complaints and ${inquiryPercentage}% are inquiries.`}
                />

                <Highlight
                  number="03"
                  title="Highest-volume category"
                  text={
                    largestCategory
                      ? `${largestCategory.category} currently has the highest recorded volume with ${largestCategory.value} tickets.`
                      : "No category volume data is currently available."
                  }
                />

                <Highlight
                  number="04"
                  title="SLA exposure"
                  text={`${slaBreach.breached} active tickets are currently beyond their SLA target.`}
                />
              </div>
            </div>
          </div>
        </ReportPage>

        {/* =====================================================
            PAGE 2 — CATEGORY PERFORMANCE
        ====================================================== */}

        <ReportPage
          report={report}
          page={2}
          totalPages={3}
          subtitle="Category Performance"
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Service Performance
            </p>

            <h1 className="mt-1 text-[26px] font-bold text-slate-950">
              Category Volume & Aging
            </h1>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1.1fr_0.9fr] gap-5">
            {/* Aging table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h2 className="text-[16px] font-bold text-slate-900">
                  Average Aging by Category
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Current aging against the configured target SLA.
                </p>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Category
                    </th>

                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Target SLA
                    </th>

                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Avg. Aging
                    </th>

                    <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Compliance
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {aging.map((row) => (
                    <tr key={row.code} className="border-t border-slate-100">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-8 w-1 rounded-full"
                            style={{
                              backgroundColor:
                                CATEGORY_COLORS[row.code] ?? "#64748b",
                            }}
                          />

                          <div>
                            <p className="text-[12px] font-bold text-slate-800">
                              {row.code}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {row.label}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center text-[11px] font-medium text-slate-600">
                        {row.slaTarget}
                      </td>

                      <td className="px-4 py-4 text-center text-[11px] font-semibold text-slate-800">
                        {row.averageAge}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                          {row.compliance}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Category distribution */}
            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 p-5">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  Volume by Category
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Distribution of all recorded tickets.
                </p>
              </div>

              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryVolume}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="48%"
                      innerRadius="48%"
                      outerRadius="76%"
                      paddingAngle={3}
                      strokeWidth={0}
                      isAnimationActive={false}
                    >
                      {categoryVolume.map((entry) => (
                        <Cell
                          key={entry.category}
                          fill={CATEGORY_COLORS[entry.category] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {categoryVolume.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[item.category] ?? "#94a3b8",
                        }}
                      />

                      <span className="text-[10px] font-semibold text-slate-600">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ReportPage>

        {/* =====================================================
            PAGE 3 — VOLUME & OWNER WORKLOAD
        ====================================================== */}

        <ReportPage
          report={report}
          page={3}
          totalPages={3}
          subtitle="Operational Trends"
        >
          <div className="mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
              Operational Trends
            </p>

            <h1 className="mt-1 text-[26px] font-bold text-slate-950">
              Ticket Volume & Action Owner Workload
            </h1>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1.3fr_0.7fr] gap-5">
            {/* Ticket Volume */}
            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 p-5">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  12-Month Ticket Volume
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Monthly ticket distribution by current status.
                </p>
              </div>

              <div className="mt-4 min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={volumeData}
                    margin={{
                      top: 5,
                      right: 10,
                      bottom: 5,
                      left: -15,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                    />

                    <XAxis
                      dataKey="period"
                      tick={{
                        fontSize: 9,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fontSize: 9,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip />

                    <Legend
                      wrapperStyle={{
                        fontSize: 10,
                      }}
                    />

                    <Bar
                      dataKey="open"
                      name="Open"
                      fill="#ef4444"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />

                    <Bar
                      dataKey="inProgress"
                      name="In Progress"
                      fill="#f59e0b"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />

                    <Bar
                      dataKey="closed"
                      name="Resolved / Closed"
                      fill="#10b981"
                      radius={[3, 3, 0, 0]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Owner workload */}
            <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 p-5">
              <div>
                <h2 className="text-[16px] font-bold text-slate-900">
                  Action Owner Workload
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Highest assigned ticket volumes.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {topOwners.map((owner, index) => {
                  const max =
                    topOwners.length > 0
                      ? Math.max(...topOwners.map((item) => item.tickets))
                      : 1;

                  const width = max === 0 ? 0 : (owner.tickets / max) * 100;

                  return (
                    <div key={owner.name}>
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[9px] font-bold text-slate-500">
                            {index + 1}
                          </span>

                          <span className="truncate text-[11px] font-medium text-slate-700">
                            {owner.name}
                          </span>
                        </div>

                        <span className="shrink-0 text-[11px] font-bold text-slate-900">
                          {owner.tickets}
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-emerald-600"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {ownerWorkload.length > 8 && (
                <p className="mt-auto border-t border-slate-100 pt-3 text-[9px] leading-4 text-slate-400">
                  Showing the eight action owners with the highest assigned
                  ticket volumes.
                </p>
              )}
            </div>
          </div>
        </ReportPage>
      </div>
    );
  },
);

export default ExecutiveSummaryReport;

/* =========================================================
   PAGE
========================================================= */

function ReportPage({
  report,
  page,
  totalPages,
  subtitle,
  children,
}: {
  report: ExecutiveSummaryReportData["report"];
  page: number;
  totalPages: number;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      data-pdf-page="true"
      className="
        relative
        flex
        h-[794px]
        w-[1123px]
        flex-col
        overflow-hidden
        bg-white
        px-10
        pb-8
        pt-8
        text-slate-900
      "
    >
      {/* Green detail */}
      <div className="absolute inset-x-0 top-0 h-[5px] bg-emerald-700" />

      {/* Header */}
      <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            {report.platform}
          </p>

          <p className="mt-1 text-[13px] font-semibold text-slate-600">
            {subtitle}
          </p>
        </div>

        <div className="flex h-12 w-[190px] items-center justify-end">
          <img
            src={report.branding.clientLogo}
            alt="Client Logo"
            className="max-h-11 max-w-[180px] object-contain"
          />
        </div>
      </header>

      {/* Page content */}
      <main className="flex min-h-0 flex-1 flex-col py-5">{children}</main>

      {/* Footer */}
      <footer className="flex h-[34px] shrink-0 items-end justify-between border-t border-slate-200 pt-3 text-[9px] text-slate-400">
        <span>{report.branding.footerLeft}</span>

        <span>{report.branding.footerCenter}</span>

        <div className="flex items-center gap-4">
          <span>
            {report.generatedDate} · {report.generatedTime}
          </span>

          <span className="font-semibold text-slate-500">
            {page}/{totalPages}
          </span>
        </div>
      </footer>
    </section>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-emerald-600" />

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[28px] font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">{detail}</p>
    </div>
  );
}

/* =========================================================
   SMALL METRIC
========================================================= */

function MetricBox({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-[20px] font-bold text-slate-900">{value}</p>

      <p className="mt-0.5 text-[9px] text-slate-400">{detail}</p>
    </div>
  );
}

/* =========================================================
   HIGHLIGHT
========================================================= */

function Highlight({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-slate-50 px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-[9px] font-bold text-white">
        {number}
      </span>

      <div>
        <p className="text-[11px] font-bold text-slate-800">{title}</p>

        <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{text}</p>
      </div>
    </div>
  );
}
