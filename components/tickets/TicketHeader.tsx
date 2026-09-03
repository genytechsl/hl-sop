"use client";

import {
  AlertTriangle,
  Calendar,
  Clock3,
  MapPin,
  User,
  FolderOpen,
  CheckCircle2,
  LoaderCircle,
  ChevronDown,
} from "lucide-react";

import TicketDetailsTabs from "./TicketDetailsTabs";
import { useEffect, useState } from "react";
import Toast from "../BottomRIghtToast";

interface User {
  id: string;
  name: string;
  role: string;
  designation: string;
  email: string;
}

interface Props {
  ticket: any;
  user: User;
}

/*
 * ---------------------------------------------------------
 * SLA HELPERS
 * ---------------------------------------------------------
 */

/**
 * Converts database datetime strings such as:
 *
 * 2026-08-19 16:19
 *
 * into a JavaScript Date.
 *
 * The database value does not contain a timezone, so we treat
 * it as local server/browser time.
 */
const parseTicketDate = (value: string): Date => {
  if (!value) {
    return new Date();
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  return new Date(normalized);
};

/**
 * Parse an SLA string.
 *
 * Examples:
 *
 * "24 Minutes"
 * "24 Hours"
 * "7 Days"
 * "7 Working Days"
 * "10 Working Days"
 */
const parseSla = (sla?: string) => {
  if (!sla) {
    return {
      value: 24,
      unit: "Hours",
    };
  }

  const normalized = sla.trim();

  const match = normalized.match(
    /^(\d+(?:\.\d+)?)\s*(Minutes|Hours|Days|Working Days)$/i,
  );

  if (!match) {
    return {
      value: 24,
      unit: "Hours",
    };
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();

  if (unit === "minutes") {
    return {
      value,
      unit: "Minutes",
    };
  }

  if (unit === "hours") {
    return {
      value,
      unit: "Hours",
    };
  }

  if (unit === "days") {
    return {
      value,
      unit: "Days",
    };
  }

  return {
    value,
    unit: "Working Days",
  };
};

/**
 * Add calendar days.
 */
const addCalendarDays = (date: Date, days: number): Date => {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
};

/**
 * Add working days.
 *
 * Monday-Friday are working days.
 *
 * Saturday and Sunday are skipped.
 *
 * If the ticket is created on a weekend, the calculation
 * starts from the following Monday.
 */
const addWorkingDays = (date: Date, workingDays: number): Date => {
  const result = new Date(date);

  let remaining = Math.max(0, Math.floor(workingDays));

  /*
   * If created during Saturday/Sunday, move to Monday
   * before starting the SLA count.
   */
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);

    const day = result.getDay();

    if (day !== 0 && day !== 6) {
      remaining--;
    }
  }

  return result;
};

/**
 * Calculate the actual SLA due date.
 */
const getSlaDueDate = (createdAt: string, slaTarget?: string): Date => {
  const createdDate = parseTicketDate(createdAt);

  const { value, unit } = parseSla(slaTarget);

  if (unit === "Minutes") {
    return new Date(createdDate.getTime() + value * 60 * 1000);
  }

  if (unit === "Hours") {
    return new Date(createdDate.getTime() + value * 60 * 60 * 1000);
  }

  if (unit === "Days") {
    return addCalendarDays(createdDate, value);
  }

  if (unit === "Working Days") {
    return addWorkingDays(createdDate, value);
  }

  return new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
};

/**
 * Calculate SLA duration in hours.
 *
 * This is useful for percentage calculations.
 *
 * NOTE:
 * Working days are represented as 24 working hours here.
 * This is useful for approximate progress percentages,
 * while the actual due date is calculated using calendar
 * working days.
 */
const getHoursFromSla = (sla?: string): number => {
  const { value, unit } = parseSla(sla);

  switch (unit) {
    case "Minutes":
      return value / 60;

    case "Hours":
      return value;

    case "Days":
      return value * 24;

    case "Working Days":
      return value * 24;

    default:
      return 24;
  }
};

/**
 * Calculate SLA progress percentage.
 *
 * For working-day SLAs, this is an approximate elapsed-time
 * percentage. The actual breach decision is made using the
 * calculated due date.
 */
const getSlaPercent = (createdAt: string, slaTarget?: string): number => {
  const createdDate = parseTicketDate(createdAt);
  const dueDate = getSlaDueDate(createdAt, slaTarget);

  const totalDuration = dueDate.getTime() - createdDate.getTime();

  if (totalDuration <= 0) {
    return 100;
  }

  const elapsed = Date.now() - createdDate.getTime();

  return Math.round(
    Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)),
  );
};

/**
 * Determine whether SLA has been breached.
 */
const isTicketSlaBreached = (ticket: any): boolean => {
  if (!["OPEN", "IN_PROGRESS"].includes(ticket.status)) {
    return false;
  }

  const dueDate = getSlaDueDate(ticket.createdAt, ticket.slaTarget);

  return Date.now() > dueDate.getTime();
};

/*
 * ---------------------------------------------------------
 * COMPONENT
 * ---------------------------------------------------------
 */

export default function TicketHeader({ ticket, user }: Props) {
  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });

  const [status, setStatus] = useState(ticket.status);
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [assignedToId, setAssignedToId] = useState(ticket.assignedToId || "");
  const [reassigning, setReassigning] = useState(false);

  /*
   * ---------------------------------------------------------
   * SLA
   * ---------------------------------------------------------
   */

  const slaDueDate = getSlaDueDate(ticket.createdAt, ticket.slaTarget);
  const slaBreached = isTicketSlaBreached(ticket);
  const slaPercent = getSlaPercent(ticket.createdAt, ticket.slaTarget);

  /*
   * ---------------------------------------------------------
   * TOAST AUTO CLOSE
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 7000);

    return () => clearTimeout(timer);
  }, [toast.open]);

  /*
   * ---------------------------------------------------------
   * CATEGORY COLOR
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * STATUS CONFIG
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * LOAD EMPLOYEES
   * ---------------------------------------------------------
   */

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await fetch("/api/users?active=true");

        if (!response.ok) {
          throw new Error("Failed to load employees");
        }

        const data = await response.json();

        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees:", error);
      }
    }

    loadEmployees();
  }, []);

  /*
   * ---------------------------------------------------------
   * REASSIGN
   * ---------------------------------------------------------
   */

  const handleReassign = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAssignedToId = e.target.value;

    if (!newAssignedToId || newAssignedToId === ticket.assignedToId) {
      return;
    }

    try {
      setReassigning(true);

      const response = await fetch("/api/tickets/reassign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          assignedToId: newAssignedToId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setToast({
          open: true,
          type: "error",
          title: "Reassignment Failed",
          message: result.message || "Unable to reassign ticket.",
        });

        setAssignedToId(ticket.assignedToId || "");

        return;
      }

      setToast({
        open: true,
        type: "success",
        title: "Ticket Reassigned",
        message: "The ticket has been successfully reassigned.",
      });

      setAssignedToId(newAssignedToId);

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);

      setToast({
        open: true,
        type: "error",
        title: "Reassignment Failed",
        message: "Something went wrong while reassigning the ticket.",
      });

      setAssignedToId(ticket.assignedToId || "");
    } finally {
      setReassigning(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UPDATE STATUS
   * ---------------------------------------------------------
   */

  const handleUpdateStatus = async () => {
    if (!remark.trim()) {
      setToast({
        open: true,
        type: "warning",
        title: "Remarks Required!",
        message: "Please add a comment before updating status.",
      });

      return;
    }

    try {
      setSaving(true);

      /*
       * Add remark
       */
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
        setToast({
          open: true,
          type: "error",
          title: "Failed",
          message: "Unable to add remarks. Please try again.",
        });

        return;
      }

      /*
       * Update ticket status
       */
      const responseUpdateTicketStatus = await fetch(
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
            customerEmail: ticket.customerEmail,
            customerName: ticket.customerName,
          }),
        },
      );

      if (!responseUpdateTicketStatus.ok) {
        setToast({
          open: true,
          type: "error",
          title: "Failed",
          message: "Unable to update ticket status. Please try again.",
        });

        return;
      }

      setToast({
        open: true,
        type: "success",
        title: "Success",
        message: "Status updated successfully. Remark added.",
      });

      setRemark("");

      window.location.reload();
    } catch (err) {
      console.error(err);

      setToast({
        open: true,
        type: "error",
        title: "Failed",
        message: "Unable to update ticket. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* -------------------------------------------------
            TICKET SUMMARY
        ------------------------------------------------- */}

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
              {/* CURRENT STATUS */}

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

              {/* SLA DUE */}

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  SLA Due
                </p>

                <div
                  className={`
                    mt-1
                    flex
                    items-center
                    gap-2
                    font-semibold
                    ${slaBreached ? "text-red-600" : "text-slate-700"}
                  `}
                >
                  <Clock3 size={18} />

                  {slaDueDate.toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  {slaBreached ? "SLA Breached" : `${slaPercent}% elapsed`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            TICKET DETAILS
        ------------------------------------------------- */}

        <div className="white-section">
          <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Ticket Details
          </h3>

          <div className="divide-y divide-slate-100">
            {/* TARGET SLA */}

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3 text-slate-500">
                <AlertTriangle size={16} className="text-amber-500" />

                <span className="text-sm">Target SLA</span>
              </div>

              <span className="font-semibold text-slate-600">
                {ticket.slaTarget}
              </span>
            </div>

            {/* ASSIGNED TO */}

            <div className="flex items-center justify-between my-2 gap-4">
              <div className="flex items-center gap-3 text-slate-500 shrink-0">
                <User size={16} className="text-blue-500" />

                <span className="text-sm">Assigned To</span>
              </div>

              {status === "RETURN" && user.role !== "actionOwner" ? (
                <div className="relative min-w-[190px]">
                  <select
                    value={assignedToId}
                    onChange={handleReassign}
                    disabled={reassigning}
                    className="
                      w-full
                      appearance-none
                      rounded-lg
                      border
                      border-slate-200
                      bg-white
                      px-3
                      py-2
                      pr-9
                      text-sm
                      font-semibold
                      text-slate-700
                      shadow-sm
                      outline-none
                      transition
                      hover:border-slate-300
                      focus:border-blue-500
                      focus:ring-2
                      focus:ring-blue-100
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    <option value="" disabled>
                      Select employee
                    </option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.id})
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={16}
                    className="
                      pointer-events-none
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />
                </div>
              ) : (
                <p className="font-semibold text-right text-slate-700">
                  {ticket.actionOwnerName}{" "}
                  <span className="font-normal text-sm text-slate-500">
                    ({ticket.assignedToId})
                  </span>
                </p>
              )}
            </div>

            {/* CREATED DATE */}

            <div className="flex items-center justify-between my-2 gap-4">
              <div className="flex items-center gap-3 text-slate-500">
                <Calendar size={16} className="text-green-500" />

                <span className="text-sm">Created Date & Time</span>
              </div>

              <span className="font-semibold text-slate-700 text-right">
                {parseTicketDate(ticket.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------
          TICKET TABS
      ------------------------------------------------- */}

      <TicketDetailsTabs ticket={ticket} />

      {/* -------------------------------------------------
          UPDATE STATUS
      ------------------------------------------------- */}

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
          {/* STATUS */}

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
                  rounded-xl
                  border
                  p-4
                  font-semibold
                  shadow-sm
                  transition-all
                  duration-200
                  bg-gradient-to-b
                  from-white
                  to-slate-50
                  border-slate-200
                  hover:border-slate-300
                  hover:shadow-md
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-100
                  focus:border-blue-500
                  appearance-none
                  ${
                    status === "OPEN"
                      ? "text-red-600"
                      : status === "IN_PROGRESS"
                        ? "text-amber-600"
                        : status === "BEING_PROCESSED"
                          ? "text-fuchsia-600"
                          : status === "RESOLVED"
                            ? "text-blue-600"
                            : status === "RETURN"
                              ? "text-slate-600"
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

                {user && (user.role === "admin" || status === "CLOSED") && (
                  <option value="CLOSED" className="text-green-600">
                    Closed
                  </option>
                )}

                <option value="RETURN" className="text-gray-600">
                  Return
                </option>
              </select>

              <ChevronDown
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />
            </div>
          </div>

          {/* REMARKS */}

          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Remarks
            </label>

            <textarea
              rows={1}
              value={remark}
              required={status === "RETURN" || slaBreached}
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

        {/* FOOTER */}

        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
          <div className="text-sm text-slate-500">
            {slaBreached && (
              <span className="font-semibold text-red-600">
                SLA has been breached.
              </span>
            )}
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
              disabled:cursor-not-allowed
              cursor-pointer
              transition
            "
          >
            {saving ? "Updating..." : "Update Status"}
          </button>
        </div>

        {/* DIALOG */}

        {dialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-7 animate-in fade-in zoom-in duration-200">
              <div
                className={`
                  mx-auto mb-5
                  flex h-16 w-16
                  items-center justify-center
                  rounded-full
                  ${
                    dialog.type === "success"
                      ? "bg-emerald-100"
                      : dialog.type === "error"
                        ? "bg-red-100"
                        : "bg-amber-100"
                  }
                `}
              >
                {dialog.type === "success" && (
                  <svg
                    className="h-8 w-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}

                {dialog.type === "error" && (
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}

                {dialog.type === "warning" && (
                  <svg
                    className="h-8 w-8 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 9v4m0 4h.01" />

                    <path d="M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
              </div>

              <h3 className="text-xl font-bold text-center text-slate-800">
                {dialog.title}
              </h3>

              <p className="mt-3 text-center text-slate-500">
                {dialog.message}
              </p>

              <button
                onClick={() =>
                  setDialog((prev) => ({
                    ...prev,
                    open: false,
                  }))
                }
                className="
                  mt-7
                  w-full
                  rounded-xl
                  bg-blue-600
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-700
                "
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* TOAST */}

        <Toast
          open={toast.open}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />
      </div>
    </>
  );
}
