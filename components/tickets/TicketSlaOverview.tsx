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

  const breachedTickets = tickets.filter((ticket) => {
    const metrics = getTicketMetrics(ticket);

    return metrics.breached && ["OPEN", "IN_PROGRESS"].includes(ticket.status);
  });

  const dueSoonTickets = tickets.filter((ticket) => {
    const metrics = getTicketMetrics(ticket);

    return (
      metrics.percent >= 75 &&
      metrics.percent < 100 &&
      ["OPEN", "IN_PROGRESS"].includes(ticket.status)
    );
  });

  const inProgressTickets = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  );

  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVED",
  );

  const closedTickets = tickets.filter((ticket) => ticket.status === "CLOSED");

  const getComplaints = (ticketList: any[]) =>
    ticketList.filter((ticket) => ticket.ticketType === "COM").length;

  const getInquiries = (ticketList: any[]) =>
    ticketList.filter((ticket) => ticket.ticketType === "INQ").length;

  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const breached = breachedTickets.length;
  const dueSoon = dueSoonTickets.length;
  const inProgress = inProgressTickets.length;
  const resolved = resolvedTickets.length;
  const closed = closedTickets.length;

  return (
    <section className="mb-6 space-y-4">
      {/* Section Heading */}
      <div className="flex items-center gap-2">
        <h2 className="section-heading">SLA Overview</h2>
        <Info size={16} className="text-slate-500" />
      </div>

      {/* SLA Cards */}
      <div className="grid grid-cols-6 gap-4 xl:grid-cols-6">
        {/* BREACHED */}
        <StatusCard
          title="Breached"
          value={breached}
          percentage={getPercentage(breached)}
          complaints={getComplaints(breachedTickets)}
          inquiries={getInquiries(breachedTickets)}
          icon={<AlertTriangle className="text-red-400" />}
          accentColor="#ef4444"
        />

        {/* DUE SOON */}
        <StatusCard
          title="Due"
          value={dueSoon}
          percentage={getPercentage(dueSoon)}
          complaints={getComplaints(dueSoonTickets)}
          inquiries={getInquiries(dueSoonTickets)}
          icon={<Timer className="text-orange-400" />}
          accentColor="#f97316"
        />

        {/* IN PROGRESS */}
        <StatusCard
          title="In Pro"
          value={inProgress}
          percentage={getPercentage(inProgress)}
          complaints={getComplaints(inProgressTickets)}
          inquiries={getInquiries(inProgressTickets)}
          icon={<Clock3 className="text-amber-400" />}
          accentColor="#f59e0b"
        />

        {/* RESOLVED */}
        <StatusCard
          title="Resolved"
          value={resolved}
          percentage={getPercentage(resolved)}
          complaints={getComplaints(resolvedTickets)}
          inquiries={getInquiries(resolvedTickets)}
          icon={<CheckCircle2 className="text-purple-400" />}
          accentColor="#9B4DCA"
        />

        {/* CLOSED */}
        <StatusCard
          title="Closed"
          value={closed}
          percentage={getPercentage(closed)}
          complaints={getComplaints(closedTickets)}
          inquiries={getInquiries(closedTickets)}
          icon={<CheckCircle2 className="text-green-400" />}
          accentColor="#22c55e"
        />

        {/* TOTAL */}
        <StatusCard
          title="Total"
          value={total}
          percentage={100}
          complaints={getComplaints(tickets)}
          inquiries={getInquiries(tickets)}
          icon={<Layers3 className="text-blue-400" />}
          accentColor="#3b82f6"
        />
      </div>
    </section>
  );
}
