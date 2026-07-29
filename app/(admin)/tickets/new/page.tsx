import DashboardHeader from "@/components/DashboardHeader";

import TicketWizard from "@/components/tickets/TicketWizard";
import NewTicketForm from "@/components/tickets/NewTicketForm";
import TicketTipsPanel from "@/components/tickets/TicketTipsPanel";

export default function NewTicketPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader header="Create New Ticket" page={21} />

      {/* <TicketWizard /> */}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3">
          <NewTicketForm />
        </div>

        <div>
          <TicketTipsPanel />
        </div>
      </div>
    </div>
  );
}
