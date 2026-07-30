"use client";

import { Search, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
// import { ticketData } from "./ticket-data";
import {
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
} from "react";
import TicketSlaOverview from "./TicketSlaOverview";
import Link from "next/link";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import autoTable from "jspdf-autotable";

export interface TicketTableRef {
  exportPdf: () => Promise<void>;
  exportCsv: () => void;
}

const TicketTable = forwardRef<TicketTableRef>((props, ref) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setisLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [fromDate, setFromDate] = useState("");

  const [toDate, setToDate] = useState("");

  useEffect(() => {
    setisLoading(true);
    const loadTickets = async () => {
      try {
        const response = await fetch("/api/tickets");

        const data = await response.json();

        setTickets(data);
        setisLoading(false);
      } catch (error) {
        console.error(error);
        setisLoading(false);
      }
    };

    loadTickets();
  }, []);
  const ITEMS_PER_PAGE = 15;

  const [currentPage, setCurrentPage] = useState(1);

  const getHoursFromSla = (sla?: string) => {
    if (!sla) return 24;

    const value = parseInt(sla);

    if (sla.includes("wd")) return value * 24 * 5;
    if (sla.includes("d")) return value * 24;
    if (sla.includes("h")) return value;

    return 24;
  };

  const getTicketMetrics = (ticket: any) => {
    const createdAt = new Date(ticket.createdAt);
    const now = new Date();

    const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    const targetHours = getHoursFromSla(ticket.slaTarget);

    const percent = Math.round((ageHours / targetHours) * 100);

    const breached =
      ageHours > targetHours && ["OPEN", "IN_PROGRESS"].includes(ticket.status);

    const dueDate = new Date(
      createdAt.getTime() + targetHours * 60 * 60 * 1000,
    );

    return {
      ageHours,
      targetHours,
      percent,
      breached,
      dueDate,
    };
  };

  const sortedTickets = [...tickets].sort((a, b) => {
    return getTicketMetrics(b).percent - getTicketMetrics(a).percent;
  });

  const filteredTickets = sortedTickets.filter((ticket) => {
    // Status filter

    if (statusFilter !== "ALL" && ticket.status !== statusFilter) {
      return false;
    }

    // Date range filter

    const ticketDate = new Date(ticket.createdAt);

    if (fromDate) {
      const start = new Date(fromDate);

      if (ticketDate < start) {
        return false;
      }
    }

    if (toDate) {
      const end = new Date(toDate);

      end.setHours(23, 59, 59, 999);

      if (ticketDate > end) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(filteredTickets.length / ITEMS_PER_PAGE);

  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const formatAge = (hours: number) => {
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${Math.floor(hours % 24)}h`;
    }

    return `${Math.floor(hours)}h`;
  };

  function TicketTableSkeleton() {
    return (
      <tbody>
        <tr>
          <td>
            <h1>Loading Table Data...</h1>
          </td>
        </tr>
        {Array.from({ length: 10 }).map((_, row) => (
          <tr key={row} className="border-b border-slate-100 animate-pulse">
            {/* # */}
            <td className="px-4 py-4">
              <div className="h-4 w-6 rounded bg-slate-200" />
            </td>

            {/* SLA Breach % */}
            <td className="px-4 py-4 min-w-[220px]">
              <div className="flex items-center gap-3">
                <div className="h-2 flex-1 rounded-full bg-slate-200" />
                <div className="h-4 w-10 rounded bg-slate-200" />
              </div>
            </td>

            {/* Ticket ID */}
            <td className="px-4 py-4">
              <div className="h-4 w-32 rounded bg-slate-200" />
            </td>

            {/* Category */}
            <td className="px-4 py-4">
              <div className="h-6 w-20 rounded-full bg-slate-200" />
            </td>

            {/* Subject */}
            <td className="px-4 py-4">
              <div className="h-4 w-56 rounded bg-slate-200" />
            </td>

            {/* Customer */}
            <td className="px-4 py-4">
              <div className="h-4 w-36 rounded bg-slate-200" />
            </td>

            {/* Status */}
            <td className="px-4 py-4">
              <div className="h-6 w-24 rounded-md bg-slate-200" />
            </td>

            {/* Action Owner */}
            <td className="px-4 py-4">
              <div className="h-4 w-32 rounded bg-slate-200" />
            </td>

            {/* Target SLA */}
            <td className="px-4 py-4">
              <div className="h-4 w-16 rounded bg-slate-200" />
            </td>

            {/* Age */}
            <td className="px-4 py-4">
              <div className="h-4 w-14 rounded bg-slate-200" />
            </td>

            {/* SLA Due Date */}
            <td className="px-4 py-4">
              <div className="h-4 w-24 rounded bg-slate-200" />
            </td>

            {/* Created At */}
            <td className="px-4 py-4">
              <div className="h-4 w-24 rounded bg-slate-200" />
            </td>
          </tr>
        ))}
      </tbody>
    );
  }
  const tableRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    exportPdf,
    exportCsv,
  }));

  // async function exportPdf() {
  //   if (!tableRef.current) return;

  //   const dataUrl = await toPng(tableRef.current, {
  //     cacheBust: true,
  //     pixelRatio: 2,
  //   });

  //   const pdf = new jsPDF("l", "mm", "a4");

  //   const imgProps = pdf.getImageProperties(dataUrl);

  //   const pdfWidth = pdf.internal.pageSize.getWidth();

  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //   pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);

  //   pdf.save("tickets.pdf");
  // }
  async function exportPdf() {
    const pdf = new jsPDF("l", "mm", "a4");

    autoTable(pdf, {
      head: [
        [
          "#",
          "Ticket ID",
          "Category",
          "Subject",
          "Customer",
          "Status",
          "Target SLA",
          "Age",
          "Created",
        ],
      ],
      body: filteredTickets.map((ticket, index) => {
        const metrics = getTicketMetrics(ticket);

        return [
          index + 1,
          ticket.id,
          ticket.category,
          ticket.title,
          ticket.customerName,
          ticket.status,
          ticket.slaTarget,
          formatAge(metrics.ageHours),
          new Date(ticket.createdAt).toLocaleDateString(),
        ];
      }),
    });

    pdf.save("tickets.pdf");
  }

  //csv exporter
  function exportCsv() {
    const headers = [
      "#",
      "Ticket ID",
      "Category",
      "Subject",
      "Customer",
      "Status",
      "Target SLA",
      "Age",
      "Created At",
    ];

    const rows = filteredTickets.map((ticket, index) => {
      const metrics = getTicketMetrics(ticket);

      return [
        index + 1,
        ticket.id,
        ticket.category,
        ticket.title,
        ticket.customerName,
        ticket.status,
        ticket.slaTarget,
        formatAge(metrics.ageHours),
        ticket.createdAt,
      ];
    });

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `tickets-${new Date().toISOString().slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
  return (
    <section ref={tableRef} className="white-section overflow-hidden">
      <TicketSlaOverview
        tickets={tickets}
        getTicketMetrics={getTicketMetrics}
      />
      {/* Header */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-end mb-6">
        {/* <div>
          <h2 className="text-2xl font-bold text-slate-800">Tickets</h2>

          <p className="text-slate-500">
            View and manage all customer tickets.
          </p>
        </div> */}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              placeholder="Search tickets..."
              className="
                h-11
                pl-10
                pr-4
                rounded-xl
                border
                border-slate-200
                bg-white
                text-sm
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>

          <div
            className="
                          flex
                          flex-col
                          sm:flex-row
                          gap-3
                          "
          >
            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="
                              h-11
                              rounded-xl
                              border
                              border-slate-200
                              px-4
                              bg-white
                              text-sm
                              "
            >
              <option value="ALL">All Status</option>

              <option value="OPEN">Open</option>

              <option value="IN_PROGRESS">In Progress</option>

              <option value="RESOLVED">Resolved</option>

              <option value="CLOSED">Closed</option>
            </select>

            {/* From Date */}

            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                setCurrentPage(1);
              }}
              className="
                      h-11
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      text-sm
                      "
            />

            {/* To Date */}

            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                setCurrentPage(1);
              }}
              className="
                h-11
                rounded-xl
                border
                border-slate-200
                px-4
                text-sm
                "
            />

            <button
              onClick={() => {
                setStatusFilter("ALL");
                setFromDate("");
                setToDate("");
                setCurrentPage(1);
              }}
              className="
                h-11
                px-4
                rounded-xl
                border
                border-slate-200
                hover:bg-slate-50
                text-sm
                font-medium
                "
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}

      <div className="overflow-x-auto">
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium">
              {filteredTickets.length === 0
                ? 0
                : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            {" - "}
            <span className="font-medium">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredTickets.length)}
            </span>
            {" of "}
            <span className="font-medium">{filteredTickets.length}</span>
            {" tickets"}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="
                  h-10
                  px-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-slate-50
                  transition
                "
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`
                      h-10
                      min-w-[40px]
                      rounded-xl
                      text-sm
                      font-medium
                      transition
                      ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-white hover:bg-slate-50"
                      }
                    `}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="
                  h-10
                  px-3
                  rounded-xl
                  border
                  border-slate-200
                  bg-white
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                  hover:bg-slate-50
                  transition
                "
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-4">#</th>
              <th className="px-4 py-4">SLA Breach %</th>
              <th className="px-4 py-4">Ticket ID</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Subject</th>
              <th className="px-4 py-4">Customer</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Target SLA</th>
              <th className="px-4 py-4">Age</th>
              <th className="px-4 py-4">SLA Due Date</th>
              <th className="px-4 py-4">Created At</th>
            </tr>
          </thead>

          {isLoading ? (
            <TicketTableSkeleton />
          ) : (
            <tbody>
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="
text-center
py-12
text-slate-500
"
                  >
                    No tickets found for selected filters.
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket, index) => {
                  const metrics = getTicketMetrics(ticket);

                  return (
                    <tr
                      key={ticket.id}
                      className="
                      border-b
                      border-slate-100
                      hover:bg-slate-50
                      transition-colors
                    "
                    >
                      {/* Rank */}
                      <td className="px-4 py-3 font-semibold">{index + 1}</td>

                      {/* SLA Breach % */}
                      <td className="px-4 py-3 min-w-[220px]">
                        <div className="flex items-center gap-3">
                          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                metrics.breached || ticket.status === "CLOSED"
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${Math.min(metrics.percent, 100)}%`,
                              }}
                            />
                          </div>

                          <span
                            className={`text-xs font-semibold ${
                              metrics.breached || ticket.status === "CLOSED"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {metrics.percent}%
                          </span>
                        </div>
                      </td>

                      {/* Ticket ID */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/tickets/view?id=${ticket.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {ticket.id}
                        </Link>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span
                          className={`
                        inline-block
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        font-medium
                        min-w-[75px]
                        text-center
                        text-white
                        ${
                          ticket.category === "CAT-A"
                            ? "bg-red-500"
                            : ticket.category === "CAT-B"
                              ? "bg-blue-500"
                              : ticket.category === "CAT-C"
                                ? "bg-slate-500"
                                : "bg-green-500"
                        }
                      `}
                        >
                          {ticket.category}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3">{ticket.title}</td>

                      {/* Customer */}
                      <td className="px-4 py-3">{ticket.customerName}</td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`
                        inline-block
                        px-3
                        py-1
                        rounded-md
                        text-center
                        text-xs
                        font-medium
                        min-w-[100px]
                        ${
                          ticket.status === "OPEN"
                            ? "bg-red-100 text-red-700"
                            : ticket.status === "IN_PROGRESS"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-green-100 text-green-700"
                        }
                      `}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>

                      {/* Target SLA */}
                      <td className="px-4 py-3 font-medium">
                        {ticket.slaTarget}
                      </td>

                      {/* Age */}
                      <td
                        className={`px-4 py-3 font-semibold ${
                          metrics.breached || ticket.status === "CLOSED"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {formatAge(metrics.ageHours)}
                      </td>

                      {/* SLA Due Date */}
                      <td className="px-4 py-3">
                        {metrics.dueDate.toLocaleDateString()}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          )}
        </table>
      </div>
    </section>
  );
});

export default TicketTable;
