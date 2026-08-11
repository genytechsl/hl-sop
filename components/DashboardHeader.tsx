"use client";

import {
  Download,
  Calendar,
  TagPlus,
  ArrowLeft,
  UserRoundPlus,
  UserPlus,
  ClockPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Props {
  header: string;
  page: number;
  onExport?: () => void;
  onExportCsv?: () => void;
}

export default function DashboardHeader({
  header,
  page,
  onExport,
  onExportCsv,
}: Props) {
  const router = useRouter();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-(--text-heading)">{header}</h1>
        {page && page === 1 && (
          <p className="mt-1 text-slate-400">
            Monitor ticket volumes, SLA performance and operational metrics
          </p>
        )}
        {page && page === 41 && (
          <p className="mt-1 text-slate-400">
            View & Update System User Information
          </p>
        )}
        {page && page === 51 && (
          <p className="mt-1 text-slate-400">
            View & Update Customer Information
          </p>
        )}
        {page && page === 6 && (
          <p className="mt-1 text-slate-400">
            Manage automated dashboard report deliveries
          </p>
        )}
        {page && page === 61 && (
          <p className="mt-1 text-slate-400">
            Configure automated dashboard report delivery
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-3">
        {page && page === 1 && (
          <>
            {/* <button className="button-heading flex items-center gap-2 transition">
              <Calendar size={16} />
              Last 30 Days
            </button>

            <select className="button-heading">
              <option>All Categories</option>
              <option>Critical</option>
              <option>Technical</option>
              <option>Facility</option>
            </select> */}

            <button
              onClick={onExport}
              className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition"
            >
              <Download size={16} />
              Export
            </button>
          </>
        )}

        {page && page === 2 && (
          <>
            <Link href="/tickets/new">
              <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
                <TagPlus size={16} />
                Open New Ticket
              </button>
            </Link>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowExportMenu((v) => !v)}
                className="button-heading-special flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>

              {showExportMenu && (
                <div
                  className="
        absolute
        right-0
        top-full
        mt-2
        w-52
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-xl
        ring-1
        ring-black/5
        z-50
      "
                >
                  <button
                    onClick={() => {
                      onExport?.();
                      setShowExportMenu(false);
                    }}
                    className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-sm
          text-slate-700
          transition
          hover:bg-blue-50
          hover:text-blue-700
        "
                  >
                    📄 Export as PDF
                  </button>

                  <div className="border-t border-slate-100" />

                  <button
                    onClick={() => {
                      onExportCsv?.();
                      setShowExportMenu(false);
                    }}
                    className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3
          text-sm
          text-slate-700
          transition
          hover:bg-emerald-50
          hover:text-emerald-700
        "
                  >
                    📊 Export as CSV
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {page && page === 41 && (
          <Link href="../settings/user/new">
            <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
              <UserRoundPlus size={16} />
              Add New User
            </button>
          </Link>
        )}
        {page && page === 51 && (
          <Link href="../settings/customers/new">
            <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
              <UserPlus size={16} />
              Add New Customer
            </button>
          </Link>
        )}
        {page && page === 6 && (
          <Link href="../settings/report-schedular/new">
            <button className="button-heading-special flex items-center gap-2 hover:scale-[1.02] transition">
              <ClockPlus size={16} />
              New Schedular
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
