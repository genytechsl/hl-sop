"use client";

import {
  Download,
  TagPlus,
  ArrowLeft,
  UserRoundPlus,
  ClockPlus,
  FileText,
  FileSpreadsheet,
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

  const getDescription = () => {
    switch (page) {
      case 1:
        return "Monitor ticket volumes, SLA performance and operational metrics";

      case 41:
        return "View & update system user information";

      case 51:
        return "View & update customer information";

      case 6:
        return "Manage automated dashboard report deliveries";

      case 61:
        return "Configure automated dashboard report delivery";

      default:
        return null;
    }
  };

  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{header}</h1>

        {getDescription() && (
          <p className="page-description">{getDescription()}</p>
        )}
      </div>

      <div className="page-actions">
        {page === 1 && (
          <button onClick={onExport} className="btn-primary">
            <Download size={17} />
            Export
          </button>
        )}

        {page === 2 && (
          <>
            <Link href="/tickets/new" className="btn-primary">
              <TagPlus size={17} />
              Open New Ticket
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((value) => !value)}
                className="btn-outline"
              >
                <Download size={17} />
                Export
              </button>

              {showExportMenu && (
                <div className="dropdown absolute right-0 top-full z-50 mt-2 w-52">
                  <button
                    type="button"
                    onClick={() => {
                      onExport?.();
                      setShowExportMenu(false);
                    }}
                    className="dropdown-item w-full"
                  >
                    <FileText size={17} className="text-red-500" />
                    Export as PDF
                  </button>

                  <div className="divider" />

                  <button
                    type="button"
                    onClick={() => {
                      onExportCsv?.();
                      setShowExportMenu(false);
                    }}
                    className="dropdown-item w-full"
                  >
                    <FileSpreadsheet size={17} className="text-emerald-600" />
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {page === 23 && (
          <>
            <Link href="/tickets/new" className="btn-primary">
              <TagPlus size={17} />
              Open New Ticket
            </Link>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((value) => !value)}
                className="btn-outline"
              >
                <Download size={17} />
                Export
              </button>

              {showExportMenu && (
                <div className="dropdown absolute right-0 top-full z-50 mt-2 w-52">
                  <button
                    type="button"
                    onClick={() => {
                      onExport?.();
                      setShowExportMenu(false);
                    }}
                    className="dropdown-item w-full"
                  >
                    <FileText size={17} className="text-red-500" />
                    Export as PDF
                  </button>

                  <div className="divider" />

                  <button
                    type="button"
                    onClick={() => {
                      onExportCsv?.();
                      setShowExportMenu(false);
                    }}
                    className="dropdown-item w-full"
                  >
                    <FileSpreadsheet size={17} className="text-emerald-600" />
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {page === 41 && (
          <Link href="../settings/user/new" className="btn-primary">
            <UserRoundPlus size={17} />
            Add New User
          </Link>
        )}

        {page === 51 && (
          <Link href="../settings/customers/new" className="btn-primary">
            <UserRoundPlus size={17} />
            Add New Customer
          </Link>
        )}

        {/* {page === 51 && (
          <Link href="../settings/customers/new" className="btn-primary">
            <UserRoundPlus size={17} />
            Add
          </Link>
        )} */}

        {page === 6 && (
          <Link href="../settings/report-schedular/new" className="btn-primary">
            <ClockPlus size={17} />
            New Scheduler
          </Link>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline"
        >
          <ArrowLeft size={17} />
          Back
        </button>
      </div>
    </div>
  );
}
