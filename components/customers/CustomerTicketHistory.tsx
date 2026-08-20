"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Search,
  Ticket,
} from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  ticketType: string;
  category: string;
  scope: string;
  categoryLabel: string;
  status: string;
  priority: string;
  propertyId: number;
  createdAt: string;
  resolvedAt: string | null;
}

interface CustomerTicketHistoryProps {
  customerId: string;
}

export default function CustomerTicketHistory({
  customerId,
}: CustomerTicketHistoryProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ticketTypeFilter, setTicketTypeFilter] = useState("ALL");

  useEffect(() => {
    async function loadTickets() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/tickets?customerId=${encodeURIComponent(customerId)}`,
        );

        if (!response.ok) {
          throw new Error("Failed to load tickets");
        }

        const data = await response.json();

        setTickets(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, [customerId]);

  const filteredTickets = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return tickets.filter((ticket) => {
      const matchesType =
        ticketTypeFilter === "ALL" ||
        ticket.ticketType.toUpperCase() === ticketTypeFilter;

      const matchesSearch =
        !keyword ||
        ticket.id.toLowerCase().includes(keyword) ||
        ticket.title.toLowerCase().includes(keyword) ||
        ticket.categoryLabel.toLowerCase().includes(keyword);

      return matchesType && matchesSearch;
    });
  }, [tickets, search, ticketTypeFilter]);

  const statistics = useMemo(() => {
    return {
      total: tickets.length,

      inquiries: tickets.filter(
        (ticket) => ticket.ticketType?.toUpperCase() === "INQ",
      ).length,

      complaints: tickets.filter(
        (ticket) => ticket.ticketType?.toUpperCase() === "COM",
      ).length,

      open: tickets.filter((ticket) => ticket.status === "OPEN").length,

      inProgress: tickets.filter((ticket) => ticket.status === "IN_PROGRESS")
        .length,

      closed: tickets.filter((ticket) => ticket.status === "CLOSED").length,
    };
  }, [tickets]);

  if (loading) {
    return (
      <div className="card flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <Clock3 size={20} className="animate-spin" />
          Loading ticket history...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="min-h-[190px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
              <Ticket size={18} />
            </div>

            <span className="text-2xl font-bold text-slate-800">
              {statistics.total}
            </span>
          </div>

          <p className="mt-4 text-sm font-medium text-slate-500">
            Total Tickets
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 px-3 py-2.5">
              <p className="text-[11px] font-medium text-blue-500">Inquiries</p>

              <p className="mt-0.5 text-lg font-bold text-blue-700">
                {statistics.inquiries}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 px-3 py-2.5">
              <p className="text-[11px] font-medium text-red-500">Complaints</p>

              <p className="mt-0.5 text-lg font-bold text-red-700">
                {statistics.complaints}
              </p>
            </div>
          </div>
        </div>

        <SummaryCard
          label="Open"
          value={statistics.open}
          icon={<AlertCircle size={18} />}
        />

        <SummaryCard
          label="In Progress"
          value={statistics.inProgress}
          icon={<Clock3 size={18} />}
        />

        <SummaryCard
          label="Closed"
          value={statistics.closed}
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      {/* Ticket list */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Ticket History</h2>

            <p className="card-description">
              All service requests associated with this customer.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            {/* Ticket Type Filter */}
            <select
              value={ticketTypeFilter}
              onChange={(e) => setTicketTypeFilter(e.target.value)}
              className="input h-11 w-full sm:w-36"
            >
              <option value="ALL">All</option>
              <option value="INQ">Inquiries</option>
              <option value="COM">Complaints</option>
            </select>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tickets..."
                className="input h-11 pl-10"
              />
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {filteredTickets.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
              <div className="rounded-2xl bg-slate-100 p-4 text-slate-400">
                <Ticket size={24} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-700">
                No tickets found
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                This customer has no matching ticket history.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="px-5 py-4 text-left">Ticket</th>
                    <th className="px-5 py-4 text-left">Issue</th>
                    <th className="px-5 py-4 text-left">Scope</th>
                    <th className="px-5 py-4 text-left">Category</th>
                    {/* <th className="px-5 py-4 text-left">Priority</th> */}
                    <th className="px-5 py-4 text-left">Status</th>
                    <th className="px-5 py-4 text-left">Created</th>
                    <th className="px-5 py-4 text-left">Resolved</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <a
                          href={`/tickets/view?id=${ticket.id}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          {ticket.id}
                        </a>
                      </td>

                      <td className="max-w-[300px] px-5 py-4">
                        <p className="truncate font-medium text-slate-700">
                          {ticket.title}
                        </p>
                      </td>

                      <td className="max-w-[300px] px-5 py-4">
                        <p className="truncate font-medium text-slate-700">
                          {ticket.scope}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {ticket.categoryLabel}
                      </td>

                      {/* <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {ticket.priority}
                        </span>
                      </td> */}

                      <td className="px-5 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {ticket.resolvedAt
                          ? new Date(ticket.resolvedAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="h-full min-h-[190px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
            {icon}
          </div>

          <span className="text-2xl font-bold text-slate-800">{value}</span>
        </div>

        <p className="mt-auto pt-4 text-sm font-medium text-slate-500">
          {label}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    OPEN: "bg-red-50 text-red-600",
    IN_PROGRESS: "bg-amber-50 text-amber-600",
    CLOSED: "bg-emerald-50 text-emerald-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
