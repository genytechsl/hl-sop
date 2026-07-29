"use client";

import { useEffect, useState } from "react";

import { FolderOpen, Clock3, CheckCircle2, Layers3, Info } from "lucide-react";

import StatusCard from "../StatusCard";
// import { overview } from "./dashboard-data";

export default function StatusOverview() {
  const [overview, setOverview] = useState({
    open: 0,
    inProgress: 0,
    closed: 0,
    total: 0,
  });

  useEffect(() => {
    fetch("/api/tickets?overview=true")
      .then((res) => res.json())
      .then(setOverview)
      .catch(console.error);
  }, []);
  const total = overview.total;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="section-heading">Ticket Status Overview</h2>

        <Info size={16} className="text-slate-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusCard
          title="Open"
          value={overview.open}
          percentage={Math.round((overview.open / total) * 100)}
          icon={<FolderOpen className="text-red-400" />}
          accentColor="#ff6467"
        />

        <StatusCard
          title="In Progress"
          value={overview.inProgress}
          percentage={Math.round((overview.inProgress / total) * 100)}
          icon={<Clock3 className="text-amber-400" />}
          accentColor="#ffb900"
        />

        <StatusCard
          title="Closed"
          value={overview.closed}
          percentage={Math.round((overview.closed / total) * 100)}
          icon={<CheckCircle2 className="text-green-400" />}
          accentColor="#06df72"
        />

        <StatusCard
          title="Total Tickets"
          value={overview.total}
          percentage={100}
          icon={<Layers3 className="text-blue-400" />}
          accentColor="#51a2ff"
        />
      </div>
    </section>
  );
}
