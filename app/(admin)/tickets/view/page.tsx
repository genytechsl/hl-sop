import DashboardHeader from "@/components/DashboardHeader";
import TicketHeader from "@/components/tickets/TicketHeader";
import { getTicketById } from "@/lib/ticket-service";
import { cookies } from "next/headers";

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  let user = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie);
    } catch {
      user = null;
    }
  }

  const userRole = user?.role || "";

  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="white-section">
        <h1 className="text-xl font-semibold text-red-600">Ticket Not Found</h1>

        <p className="mt-2 text-slate-500">No ticket ID was provided.</p>
      </div>
    );
  }

  const ticket = await getTicketById(id);

  if (!ticket) {
    return (
      <div className="white-section">
        <h1 className="text-xl font-semibold text-red-600">Ticket Not Found</h1>

        <p className="mt-2 text-slate-500">No ticket exists with ID: {id}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader header="Ticket Details" page={22} />

      <TicketHeader ticket={ticket} user={user} />
    </div>
  );
}
