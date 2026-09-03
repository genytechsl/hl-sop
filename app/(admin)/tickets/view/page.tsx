import DashboardHeader from "@/components/DashboardHeader";
import TicketHeader from "@/components/tickets/TicketHeader";
import { getTicketById } from "@/lib/ticket-service";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{
    id?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  /*
   * =====================================================
   * AUTHENTICATION
   * =====================================================
   */

  const user = await getSession();

  if (!user) {
    redirect("/");
  }

  /*
   * =====================================================
   * GET TICKET ID
   * =====================================================
   */

  const { id } = await searchParams;

  if (!id) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-7 w-7 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.1 12.3A1.75 1.75 0 004.7 18.75h14.6a1.75 1.75 0 001.515-2.59l-7.1-12.3a1.75 1.75 0 00-3.03 0z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Ticket Unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            This ticket may not exist, or you may not have permission to view
            it. If you believe you should have access, please contact your
            administrator.
          </p>

          <div className="mt-6 inline-flex items-center rounded-lg bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
            Ticket ID: {id}
          </div>

          <div className="mt-7">
            <Link
              href="/assigned"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              ← Back to My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * GET TICKET
   * =====================================================
   */

  const ticket = await getTicketById(id);

  if (!ticket) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-7 w-7 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.1 12.3A1.75 1.75 0 004.7 18.75h14.6a1.75 1.75 0 001.515-2.59l-7.1-12.3a1.75 1.75 0 00-3.03 0z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Ticket Unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            This ticket may not exist, or you may not have permission to view
            it. If you believe you should have access, please contact your
            administrator.
          </p>

          <div className="mt-6 inline-flex items-center rounded-lg bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
            Ticket ID: {id}
          </div>

          <div className="mt-7">
            <Link
              href="/assigned"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              ← Back to My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * ACTION OWNER SECURITY
   * =====================================================
   *
   * Admin:
   *   Can view any ticket.
   *
   * Data Entry:
   *   Can view any ticket.
   *
   * Action Owner:
   *   Can ONLY view tickets assigned to themselves.
   */

  if (user.role === "actionOwner" && ticket.assignedToId !== user.id) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-7 w-7 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0 3.75h.008M10.29 3.86l-7.1 12.3A1.75 1.75 0 004.7 18.75h14.6a1.75 1.75 0 001.515-2.59l-7.1-12.3a1.75 1.75 0 00-3.03 0z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-slate-900">
            Ticket Unavailable
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            This ticket may not exist, or you may not have permission to view
            it. If you believe you should have access, please contact your
            administrator.
          </p>

          <div className="mt-6 inline-flex items-center rounded-lg bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
            Ticket ID: {id}
          </div>

          <div className="mt-7">
            <Link
              href="/assigned"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              ← Back to My Tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * AUTHORIZED
   * =====================================================
   */

  return (
    <div className="space-y-6">
      <DashboardHeader header="Ticket Details" page={22} />

      <TicketHeader ticket={ticket} user={user} />
    </div>
  );
}
