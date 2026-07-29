import DashboardHeader from "@/components/DashboardHeader";
import TicketTable from "@/components/tickets/TicketTable";

export default function TicketsPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="Assigned Tickets" page={23} />

      <TicketTable />

      <section className="white-card">
        <h4 className="font-semibold text-slate-500">Last Updated</h4>

        <p className="mt-2 text-slate-500">19 July 2026 • 02:45 PM</p>
      </section>
    </div>
  );
}
