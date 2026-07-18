"use client";

import { Download, Calendar } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">
          CMU Issue Tracking Dashboard
        </h1>

        <p className="mt-1 text-slate-400">
          Monitor ticket volumes, SLA performance and operational metrics.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="h-11 px-4 rounded-xl bg-slate-800 border border-white/10 flex items-center gap-2 hover:bg-slate-700 transition">
          <Calendar size={16} />
          Last 30 Days
        </button>

        <select className="h-11 px-4 rounded-xl bg-slate-800 border border-white/10 text-sm">
          <option>All Categories</option>
          <option>Critical</option>
          <option>Technical</option>
          <option>Facility</option>
        </select>

        <button className="h-11 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center gap-2 hover:scale-[1.02] transition">
          <Download size={16} />
          Export
        </button>
      </div>
    </div>
  );
}
