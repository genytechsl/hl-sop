"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Monitor,
  MapPin,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

interface LoginAuditLog {
  id: string;
  identifier: string | null;
  event: string;
  success: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;

  employee: {
    id: string;
    name: string;
    username: string;
    email: string;
    designation: string;
    department: string | null;
    role: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type PageItem = number | "ellipsis";

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginAuditLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [eventFilter, setEventFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  });

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", String(page));
      params.set("limit", String(limit));

      if (search) {
        params.set("search", search);
      }

      if (eventFilter !== "ALL") {
        params.set("event", eventFilter);
      }

      if (statusFilter === "SUCCESS") {
        params.set("success", "true");
      }

      if (statusFilter === "FAILED") {
        params.set("success", "false");
      }

      const response = await fetch(
        `/api/settings/login-logs?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load login logs");
      }

      const data = await response.json();

      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);

      setError("Unable to retrieve login logs.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, eventFilter, statusFilter]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearch("");
    setSearchInput("");
    setEventFilter("ALL");
    setStatusFilter("ALL");
    setPage(1);
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-LK", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(date));
  }

  function getBrowserInfo(userAgent: string | null) {
    if (!userAgent) {
      return "Unknown device";
    }

    if (userAgent.includes("Edg/")) {
      return "Microsoft Edge";
    }

    if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) {
      return "Google Chrome";
    }

    if (userAgent.includes("Firefox/")) {
      return "Mozilla Firefox";
    }

    if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
      return "Safari";
    }

    return "Other browser";
  }

  const pageItems = useMemo<PageItem[]>(() => {
    const totalPages = pagination.totalPages;

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "ellipsis", totalPages];
    }

    if (page >= totalPages - 3) {
      return [
        1,
        "ellipsis",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
  }, [page, pagination.totalPages]);

  const startResult =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;

  const endResult = Math.min(
    pagination.page * pagination.limit,
    pagination.total,
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Login Audit Logs
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Review user authentication activity and access history.
            </p>
          </div>

          <button
            type="button"
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* =====================================================
            FILTERS
        ====================================================== */}

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />

            <p className="text-sm font-semibold text-slate-800">Filters</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search user, email, username or IP..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </form>

            <select
              value={eventFilter}
              onChange={(event) => {
                setEventFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Events</option>

              <option value="LOGIN">Login</option>

              <option value="LOGOUT">Logout</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="ALL">All Statuses</option>

              <option value="SUCCESS">Successful</option>

              <option value="FAILED">Failed</option>
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setSearch(searchInput.trim());
                }}
                className="h-10 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Apply
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            TABLE
        ====================================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    IP Address
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Device
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center text-sm text-slate-500"
                    >
                      Loading login logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No login activity found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing or clearing your filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {log.employee?.name || "Unknown user"}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {log.employee?.username || log.identifier || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {log.event === "LOGIN" ? (
                            <LogIn size={16} className="text-blue-600" />
                          ) : (
                            <LogOut size={16} className="text-slate-500" />
                          )}

                          <span className="text-sm font-medium text-slate-700">
                            {log.event}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {log.success ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Successful
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            <XCircle size={14} />
                            Failed
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin size={15} className="text-slate-400" />

                          {log.ipAddress || "Unknown"}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Monitor
                            size={15}
                            className="shrink-0 text-slate-400"
                          />

                          <div className="min-w-0">
                            <p className="text-sm text-slate-700">
                              {getBrowserInfo(log.userAgent)}
                            </p>

                            {log.userAgent && (
                              <p
                                title={log.userAgent}
                                className="max-w-[220px] truncate text-xs text-slate-400"
                              >
                                {log.userAgent}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDate(log.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===================================================
              PAGINATION
          ==================================================== */}

          <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {startResult}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">{endResult}</span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                  {pagination.total}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Rows</span>

                <select
                  value={limit}
                  onChange={(event) => {
                    setLimit(Number(event.target.value));

                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value={10}>10</option>

                  <option value={25}>25</option>

                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="mx-1 flex items-center gap-1">
                {pageItems.map((item, index) => {
                  if (item === "ellipsis") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="flex h-9 min-w-9 items-center justify-center px-1 text-sm text-slate-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const active = item === page;

                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setPage(item)}
                      disabled={loading}
                      className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition ${
                        active
                          ? "bg-slate-900 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={page >= pagination.totalPages || loading}
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, pagination.totalPages),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
