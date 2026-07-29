import {
  AlertTriangle,
  Timer,
  Clock3,
  CheckCircle2,
  Layers3,
  Info,
} from "lucide-react";

import StatusCard from "@/components/StatusCard";

interface Props {
  tickets: any[];
  getTicketMetrics: (ticket: any) => {
    percent: number;
    breached: boolean;
  };
}

export default function TicketSlaOverview({
  tickets,
  getTicketMetrics,
}: Props) {
  const total = tickets.length;

  const breached = tickets.filter((ticket) => {
    const metrics = getTicketMetrics(ticket);

    return metrics.breached && ["OPEN", "IN_PROGRESS"].includes(ticket.status);
  }).length;

  const dueSoon = tickets.filter((ticket) => {
    const metrics = getTicketMetrics(ticket);

    return (
      metrics.percent >= 75 &&
      metrics.percent < 100 &&
      ["OPEN", "IN_PROGRESS"].includes(ticket.status)
    );
  }).length;

  const inProgress = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  ).length;

  const closed = tickets.filter((ticket) => ticket.status === "CLOSED").length;

  return (
    <section className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <h2 className="section-heading">SLA Overview</h2>

        <Info size={16} className="text-slate-500" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatusCard
          title="Breached"
          value={breached}
          percentage={Math.round((breached / total) * 100)}
          icon={<AlertTriangle className="text-red-400" />}
          accentColor="#ef4444"
        />

        <StatusCard
          title="Due Soon"
          value={dueSoon}
          percentage={Math.round((dueSoon / total) * 100)}
          icon={<Timer className="text-orange-400" />}
          accentColor="#f97316"
        />

        <StatusCard
          title="In Progress"
          value={inProgress}
          percentage={Math.round((inProgress / total) * 100)}
          icon={<Clock3 className="text-amber-400" />}
          accentColor="#f59e0b"
        />

        <StatusCard
          title="Closed"
          value={closed}
          percentage={Math.round((closed / total) * 100)}
          icon={<CheckCircle2 className="text-green-400" />}
          accentColor="#22c55e"
        />

        <StatusCard
          title="Total Tickets"
          value={total}
          percentage={100}
          icon={<Layers3 className="text-blue-400" />}
          accentColor="#3b82f6"
        />
      </div>
    </section>
  );
}
