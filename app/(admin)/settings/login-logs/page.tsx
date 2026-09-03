"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Monitor,
  MapPin,
  RefreshCw,
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

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginAuditLog[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  async function loadLogs() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/settings/login-logs?limit=200", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load login logs");
      }

      const data = await response.json();

      setLogs(data);
    } catch (error) {
      console.error(error);

      setError("Unable to retrieve login logs.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Loading login logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      No login activity found.
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
                          <Monitor size={15} className="text-slate-400" />

                          <div>
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
        </div>
      </div>
    </div>
  );
}
