"use client";

import { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { getTicketSlaMetrics, type SlaTicket } from "@/lib/ticket-metrics";

interface Ticket extends SlaTicket { ticketType: string }

export default function SlaBreachRateCard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let cancelled = false;
    fetch("/api/tickets")
      .then(async res => {
        if (!res.ok) throw new Error("Unable to load SLA data");
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid SLA data");
        if (!cancelled) setTickets(data);
      })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => { cancelled = true; clearInterval(timer); };
  }, []);
  const rows = useMemo(() => tickets.map(ticket => ({...ticket, metrics: getTicketSlaMetrics(ticket, now)})), [tickets, now]);
  return (
    <section className="white-card-graph relative min-w-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
      <div className="p-3 sm:p-5">
        <h2 className="section-heading">SLA Breach Rate</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">Each chart compares breached tickets with tickets within SLA in the same group. Finished tickets are measured at resolution, or closure if no resolution was recorded. Working-day SLAs exclude Saturdays and Sundays.</p>
        {loading ? <p className="py-12 text-center">Loading SLA data...</p> : error ? <p role="alert" className="py-12 text-center text-red-600">SLA data could not be loaded. Refresh to retry.</p> : (
          <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-3">
            <BreachGroup title="All Tickets" rows={rows} />
            <BreachGroup title="Closed Tickets" rows={rows.filter(t => t.status === "CLOSED")} />
            <BreachGroup title="Open / In Progress Tickets" rows={rows.filter(t => ["OPEN", "IN_PROGRESS"].includes(t.status))} />
          </div>
        )}
      </div>
    </section>
  );
}

type Row = Ticket & { metrics: ReturnType<typeof getTicketSlaMetrics> };
function BreachGroup({title, rows}: {title: string; rows: Row[]}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <BreachDonut title="Overall" rows={rows} />
      <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 xl:grid-cols-1">
        <BreachDonut title="Complaints" rows={rows.filter(t => t.ticketType === "COM")} compact />
        <BreachDonut title="Inquiries" rows={rows.filter(t => t.ticketType === "INQ")} compact />
      </div>
    </div>
  );
}
function BreachDonut({title, rows, compact = false}: {title: string; rows: Row[]; compact?: boolean}) {
  const assessed = rows.filter(t => t.metrics.known);
  const breached = assessed.filter(t => t.metrics.breached).length;
  const within = assessed.length - breached;
  const unknown = rows.length - assessed.length;
  const rate = assessed.length ? Number((breached / assessed.length * 100).toFixed(1)) : null;
  const slices = assessed.length ? [
    {name: "Breached", value: breached, color: "#f87171"},
    {name: "Within SLA", value: within, color: "#34d399"},
  ] : [{name: "No assessed tickets", value: 1, color: "#64748b"}];
  return (
    <div className={compact ? "flex min-w-0 items-center gap-3" : "mt-3"}>
      <div role="img" aria-label={`${title}: ${breached} breached, ${within} within SLA, ${unknown} unknown`} className={compact ? "h-24 w-24 shrink-0" : "h-48 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="94%" strokeWidth={0} isAnimationActive={false}>
              {slices.map(slice => <Cell key={slice.name} fill={slice.color} />)}
            </Pie>
            {assessed.length > 0 && <Tooltip formatter={(value, name) => [`${value} tickets`, name]} />}
            <text x="50%" y="52%" textAnchor="middle" className={compact ? "fill-slate-800 text-sm font-bold" : "fill-slate-800 text-3xl font-bold"}>{rate === null ? "—" : `${rate}%`}</text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0 text-xs leading-5 text-slate-600">
        <p className="font-semibold text-slate-800">{title}</p>
        <p><span className="text-red-500">●</span> Breached: {breached} / {assessed.length}</p>
        <p><span className="text-emerald-500">●</span> Within SLA: {within} / {assessed.length}</p>
        {unknown > 0 && <p className="mt-1 text-amber-600">Unknown: {unknown} (missing dates/SLA; excluded from rate)</p>}
        {rows.length === 0 && <p>No tickets</p>}
      </div>
    </div>
  );
}
