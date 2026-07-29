"use client";

import {
  AlertTriangle,
  Calendar,
  Clock3,
  MapPin,
  User,
  Flag,
  CheckCircle2,
  LoaderCircle,
  FolderOpen,
} from "lucide-react";
import TicketDetailsTabs from "./TicketDetailsTabs";
import { useState } from "react";

interface Props {
  ticket: any;
}

export default function TicketHeader({ ticket }: Props) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "CAT-A":
        return "bg-red-100 text-red-700 border-red-200";
      case "CAT-B":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "CAT-C":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "OPEN":
        return {
          icon: FolderOpen,
          className: "text-red-600 bg-red-50",
        };

      case "IN_PROGRESS":
        return {
          icon: LoaderCircle,
          className: "text-amber-600 bg-amber-50",
        };

      default:
        return {
          icon: CheckCircle2,
          className: "text-green-600 bg-green-50",
        };
    }
  };

  const statusConfig = getStatusConfig(ticket.status);
  const StatusIcon = statusConfig.icon;

  const [status, setStatus] = useState(ticket.status);
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);

  const handleUpdateStatus = async () => {
    if (!remark.trim()) {
      alert("Please enter remarks.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/remarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          remarkType: remark,
          statusChangedTo: status,
        }),
      });

      if (!response.ok) {
        throw new Error();
      }

      const response_updateTicketStatus = await fetch(
        "/api/tickets/update-status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ticketId: ticket.id,
            status,
            remark,
          }),
        },
      );

      if (!response_updateTicketStatus.ok) {
        throw new Error("Failed to update ticket");
      }

      // Refresh the page so the latest ticket and remarks are loaded
      window.location.reload();

      // reload remarks
      // refresh ticket

      setRemark("");
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Row 1 - Left - Ticket Summary */}

        <div className="xl:col-span-2 white-section">
          <div className="flex items-start justify-between gap-6">
            <div>
              <span
                className={`
                inline-flex
                items-center
                rounded-full
                border
                px-3
                py-1
                text-xs
                font-semibold
                ${getCategoryColor(ticket.category)}
              `}
              >
                {ticket.category} • {ticket.categoryLabel}
              </span>

              <h1 className="mt-4 text-4xl font-bold text-black">
                {ticket.id}
              </h1>

              <h2 className="mt-2 text-xl font-semibold text-slate-700">
                {ticket.title}
              </h2>

              <div className="mt-3 flex items-center gap-2 text-slate-500">
                <MapPin size={16} />
                <span>{ticket.property}</span>
              </div>
            </div>

            <div className="min-w-[220px] space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Current Status
                </p>

                <div
                  className={`
                  mt-1
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  px-3
                  py-2
                  font-medium
                  ${statusConfig.className}
                `}
                >
                  <StatusIcon size={18} />
                  {ticket.status.replace("_", " ")}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  SLA Due
                </p>

                <div className="mt-1 flex items-center gap-2 text-red-600 font-semibold">
                  <Clock3 size={18} />
                  19 Jul 2026 · 09:15 AM
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1 - Right - Ticket Meta */}

        <div className="white-section">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Ticket Details
          </h3>

          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3 text-slate-500">
                <Flag size={16} className="text-red-500" />
                <span className="text-sm">Priority</span>
              </div>

              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-800">
                {ticket.priority}
              </span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3 text-slate-500">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-sm">Target SLA</span>
              </div>

              <span className="font-semibold text-slate-600">
                {ticket.slaTarget}
              </span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3 text-slate-500">
                <User size={16} className="text-blue-500" />
                <span className="text-sm">Assigned To</span>
              </div>

              <span className="font-semibold 6 text-right">
                {ticket.assignedTo}
              </span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3 text-slate-500">
                <Calendar size={16} className="text-green-500" />
                <span className="text-sm">Created Date</span>
              </div>

              <span className="font-semibold 6">{ticket.createdAt}</span>
            </div>
          </div>
        </div>
      </div>

      <TicketDetailsTabs ticket={ticket} />

      {/* ROW 3 - Update Status */}

      <div className="white-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              Update Ticket Status
            </h3>

            <p className="text-sm text-slate-500 mt-1">
              Update the current ticket status and record remarks.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
          {/* Status */}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Status
            </label>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`
                    w-full
                    h-11
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    font-medium
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-500
                    ${
                      ticket.status === "OPEN"
                        ? "text-red-600"
                        : ticket.status === "IN_PROGRESS"
                          ? "text-amber-600"
                          : ticket.status === "RESOLVED"
                            ? "text-blue-600"
                            : "text-green-600"
                    }
                  `}
              >
                <option value="OPEN" className="text-red-600">
                  Open
                </option>

                <option value="IN_PROGRESS" className="text-amber-600">
                  In Progress
                </option>

                <option value="BEING_PROCESSED" className="text-fuchsia-600">
                  Being Attended
                </option>

                <option value="RESOLVED" className="text-blue-600">
                  Resolved
                </option>

                <option value="CLOSED" className="text-green-600">
                  Closed
                </option>
              </select>
            </div>
          </div>

          {/* Remarks */}

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Remarks
            </label>

            <textarea
              rows={2}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Enter update remarks, actions taken, notes, observations, etc..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                p-4
                resize-none
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />
          </div>
        </div>

        {/* Footer */}

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="text-sm text-slate-500">
            Last updated by <span className="font-medium">Facilities Team</span>{" "}
            on 20 Jul 2026 · 10:45 AM
          </div>

          <button
            onClick={handleUpdateStatus}
            disabled={saving}
            className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-2.5
            text-white
            font-medium
            hover:bg-blue-700
            disabled:opacity-50
            disabled:cursor-not-allowed cursor-pointer
            transition
          "
          >
            {saving ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>
    </>
  );
}
