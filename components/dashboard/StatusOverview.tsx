import { FolderOpen, Clock3, CheckCircle2, Layers3, Info } from "lucide-react";

import StatusCard from "./StatusCard";
import { ticketOverview } from "./dashboard-data";

export default function StatusOverview() {
  const total = ticketOverview.total;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-semibold text-white text-lg">
          Ticket Status Overview
        </h2>

        <Info size={16} className="text-slate-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatusCard
          title="Open"
          value={ticketOverview.open}
          percentage={Math.round((ticketOverview.open / total) * 100)}
          icon={<FolderOpen className="text-red-400" />}
        />

        <StatusCard
          title="In Progress"
          value={ticketOverview.inProgress}
          percentage={Math.round((ticketOverview.inProgress / total) * 100)}
          icon={<Clock3 className="text-amber-400" />}
        />

        <StatusCard
          title="Closed"
          value={ticketOverview.closed}
          percentage={Math.round((ticketOverview.closed / total) * 100)}
          icon={<CheckCircle2 className="text-green-400" />}
        />

        <StatusCard
          title="Total Tickets"
          value={ticketOverview.total}
          percentage={100}
          icon={<Layers3 className="text-blue-400" />}
        />
      </div>
    </section>
  );
}
