"use client";

import { Download, Calendar, TagPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  header: string;
  page: number;
}

export default function DashboardHeader({ header, page }: Props) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-(--text-heading)">{header}</h1>

        <p className="mt-1 text-slate-400">
          Monitor ticket volumes, SLA performance and operational metrics.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        {page && page === 1 && (
          <>
            <button className="button-heading flex items-center gap-2 transition">
              <Calendar size={16} />
              Last 30 Days
            </button>

            <select className="button-heading">
              <option>All Categories</option>
              <option>Critical</option>
              <option>Technical</option>
              <option>Facility</option>
            </select>

            <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
              <Download size={16} />
              Export
            </button>
          </>
        )}

        {page && page === 2 && (
          <Link href="/tickets/new">
            <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
              <TagPlus size={16} />
              Open New Ticket
            </button>
          </Link>
        )}

        {page && page === 41 && (
          <Link href="../settings/user/new">
            <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
              <TagPlus size={16} />
              Add New User
            </button>
          </Link>
        )}

        <button
          onClick={() => router.back()}
          className="button-heading flex items-center gap-2 hover:scale-[1.02] transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>
    </div>
  );
}
