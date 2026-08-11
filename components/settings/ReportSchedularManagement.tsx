"use client";

import { useEffect, useState } from "react";
import {
  LoaderCircle,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowUpDown,
  Filter,
  CalendarClock,
} from "lucide-react";

interface Scheduler {
  id: string;
  email: string;
  report: string;
  frequency: string;
  day: number;
  time: string;
  active: boolean;
  createdDate: string;
}

export default function ReportSchedulerTable() {
  const [schedules, setSchedules] = useState<Scheduler[]>([]);
  const [loading, setLoading] = useState(true);

  const ITEMS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [sortBy, setSortBy] = useState<"email" | "frequency" | "createdDate">(
    "email",
  );

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    try {
      setLoading(true);

      const response = await fetch("/api/settings/report-schedular");

      const data = await response.json();

      setSchedules(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSchedules = schedules
    .filter((schedule) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        schedule.id.toLowerCase().includes(keyword) ||
        schedule.email.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? schedule.active
            : !schedule.active;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "email") {
        comparison = a.email.localeCompare(b.email);
      }

      if (sortBy === "frequency") {
        comparison = a.frequency.localeCompare(b.frequency);
      }

      if (sortBy === "createdDate") {
        comparison =
          new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const totalPages = Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE);

  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (loading) {
    return (
      <div className="white-section flex justify-center py-20">
        <LoaderCircle className="animate-spin text-blue-600" size={30} />
      </div>
    );
  }

  return (
    <div className="white-section mt-6">
      <div className="flex items-center gap-3 mb-6"></div>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by email or schedule ID..."
            className="
            w-full
            rounded-xl
            border
            border-slate-200
            py-2.5
            pl-10
            pr-4
            outline-none
            focus:border-blue-500
            "
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="
              rounded-xl
              border
              border-slate-200
              px-3
              py-2
              "
            >
              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown size={16} className="text-slate-500" />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="
              rounded-xl
              border
              border-slate-200
              px-3
              py-2
              "
            >
              <option value="email">Email</option>

              <option value="frequency">Frequency</option>

              <option value="createdDate">Created Date</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="
              rounded-xl
              border
              border-slate-200
              px-3
              py-2
              "
            >
              <option value="asc">Asc</option>

              <option value="desc">Desc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1200px] w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-4 py-4 text-left">#</th>

              <th className="px-4 py-4 text-left">Schedule ID</th>

              <th className="px-4 py-4 text-left">Recipient</th>

              <th className="px-4 py-4 text-left">Report</th>

              <th className="px-4 py-4 text-left">Frequency</th>

              <th className="px-4 py-4 text-left">Schedule</th>

              <th className="px-4 py-4 text-left">Status</th>

              <th className="px-4 py-4 text-left">Created</th>
            </tr>
          </thead>

          <tbody>
            {paginatedSchedules.map((schedule, index) => (
              <tr
                key={schedule.id}
                className="
              border-b
              border-slate-100
              hover:bg-slate-50
              transition
              "
              >
                <td className="px-4 py-3">
                  {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                </td>

                <td className="px-4 py-3 font-semibold text-blue-600">
                  {schedule.id}
                </td>

                <td className="px-4 py-3">
                  <div className="font-medium text-slate-700">
                    {schedule.email}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className="
                rounded-full
                bg-blue-50
                text-blue-700
                px-3
                py-1
                text-xs
                font-semibold
                "
                  >
                    Dashboard
                  </span>
                </td>

                <td className="px-4 py-3">
                  <span
                    className="
                rounded-full
                bg-purple-50
                text-purple-700
                px-3
                py-1
                text-xs
                font-semibold
                "
                  >
                    {schedule.frequency}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {schedule.frequency === "MONTHLY"
                    ? `Day ${schedule.day} at ${schedule.time}`
                    : `Every ${schedule.frequency.toLowerCase()} at ${schedule.time}`}
                </td>

                <td className="px-4 py-3">
                  <span
                    className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold

                ${
                  schedule.active
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-200 text-slate-600"
                }
                `}
                  >
                    {schedule.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>

                <td className="px-4 py-3 text-slate-500">
                  {schedule.createdDate}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <b>
            {filteredSchedules.length === 0
              ? 0
              : (currentPage - 1) * ITEMS_PER_PAGE + 1}
          </b>
          {" - "}
          <b>
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredSchedules.length)}
          </b>{" "}
          of <b>{filteredSchedules.length}</b> schedules
        </p>

        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="
          rounded-lg
          border
          px-3
          py-2
          disabled:opacity-50
          "
          >
            Previous
          </button>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="
          rounded-lg
          border
          px-3
          py-2
          disabled:opacity-50
          "
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
