import DashboardHeader from "@/components/DashboardHeader";
import TicketTable from "@/components/tickets/TicketTable";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function TicketsPage() {
  const user = await getSession();

  if (!user) {
    redirect("/login");
  }
  console.log("first role check: ", user);

  return (
    <div className="space-y-8">
      <DashboardHeader header="Assigned Tickets" page={23} />

      <TicketTable user={user} assignedOnly />

      <section className="white-card">
        <h4 className="font-semibold text-slate-500">Last Updated</h4>

        <p className="mt-2 text-slate-500">19 July 2026 • 02:45 PM</p>
      </section>
    </div>
  );
}
