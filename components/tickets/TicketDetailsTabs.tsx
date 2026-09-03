"use client";

import { useState, useEffect } from "react";
import {
  getTicketSlaMetrics,
  parseSla,
  parseTicketDate,
  isWorkingDay,
} from "@/lib/sla";
import {
  User,
  Mail,
  Paperclip,
  AlertTriangle,
  Clock3,
  Circle,
  CheckCircle2,
  LoaderCircle,
  FileText,
  History,
  Download,
  ExternalLink,
} from "lucide-react";

interface Props {
  ticket: any;
}
interface Attachment {
  id: string;
  ticketId: string;
  originalName: string;
  storedName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  createdAt?: string;
}

/**
 * Returns the number of working days between two dates.
 *
 * The time portion is also preserved so that partial working days
 * can be displayed as:
 *
 * 2 Working Days 5 Hours
 */
function getWorkingTimeDifference(
  start: Date,
  end: Date,
): {
  workingDays: number;
  hours: number;
  minutes: number;
} {
  if (end.getTime() <= start.getTime()) {
    return {
      workingDays: 0,
      hours: 0,
      minutes: 0,
    };
  }

  let workingDays = 0;
  let cursor = new Date(start);

  // Move through complete calendar days.
  while (true) {
    const nextDay = new Date(cursor);
    nextDay.setDate(nextDay.getDate() + 1);

    if (nextDay.getTime() > end.getTime()) {
      break;
    }

    if (isWorkingDay(cursor)) {
      workingDays++;
    }

    cursor = nextDay;
  }

  // Calculate remaining time from the last complete day.
  const remainingMs = end.getTime() - cursor.getTime();

  let hours = Math.floor(remainingMs / (1000 * 60 * 60));
  let minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  // If the remaining portion falls on a weekend, don't count it
  // as working time.
  if (!isWorkingDay(cursor)) {
    hours = 0;
    minutes = 0;
  }

  return {
    workingDays,
    hours,
    minutes,
  };
}

/**
 * Format elapsed/remaining SLA time using the same unit
 * that was configured for the ticket.
 *
 * Examples:
 *
 * 24 Hours
 *   -> 18 Hours
 *
 * 7 Days
 *   -> 3 Days 6 Hours
 *
 * 5 Working Days
 *   -> 2 Working Days 6 Hours
 *
 * 24 Minutes
 *   -> 18 Minutes
 */
function formatSlaTime(
  start: Date,
  end: Date,
  unit: ReturnType<typeof parseSla>["unit"],
): string {
  const isNegative = end.getTime() < start.getTime();

  const effectiveStart = isNegative ? end : start;
  const effectiveEnd = isNegative ? start : end;

  const differenceMs = effectiveEnd.getTime() - effectiveStart.getTime();

  if (differenceMs <= 0) {
    switch (unit) {
      case "Minutes":
        return "0 Minutes";

      case "Hours":
        return "0 Hours";

      case "Days":
        return "0 Days";

      case "Working Days":
        return "0 Working Days";
    }
  }

  switch (unit) {
    case "Minutes": {
      const minutes = Math.floor(differenceMs / (1000 * 60));

      return `${minutes} Minute${minutes === 1 ? "" : "s"}`;
    }

    case "Hours": {
      const hours = Math.floor(differenceMs / (1000 * 60 * 60));

      return `${hours} Hour${hours === 1 ? "" : "s"}`;
    }

    case "Days": {
      const totalHours = differenceMs / (1000 * 60 * 60);

      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);

      const parts: string[] = [];

      if (days > 0) {
        parts.push(`${days} Day${days === 1 ? "" : "s"}`);
      }

      if (hours > 0) {
        parts.push(`${hours} Hour${hours === 1 ? "" : "s"}`);
      }

      return parts.length > 0 ? parts.join(" ") : "0 Days";
    }

    case "Working Days": {
      const { workingDays, hours, minutes } = getWorkingTimeDifference(
        effectiveStart,
        effectiveEnd,
      );

      const parts: string[] = [];

      if (workingDays > 0) {
        parts.push(`${workingDays} Working Day${workingDays === 1 ? "" : "s"}`);
      }

      if (hours > 0) {
        parts.push(`${hours} Hour${hours === 1 ? "" : "s"}`);
      }

      if (minutes > 0 && workingDays === 0) {
        parts.push(`${minutes} Minute${minutes === 1 ? "" : "s"}`);
      }

      return parts.length > 0 ? parts.join(" ") : "0 Working Days";
    }

    default:
      return "0 Hours";
  }
}

export default function TicketDetailsTabs({ ticket }: Props) {
  const [activeTab, setActiveTab] = useState("details");
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loadingRemarks, setLoadingRemarks] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  useEffect(() => {
    if (!ticket?.id) return;

    const loadAttachments = async () => {
      setLoadingAttachments(true);

      try {
        const response = await fetch(
          `/api/tickets/${encodeURIComponent(ticket.id)}/attachments`,
        );

        if (!response.ok) {
          throw new Error("Failed to load attachments");
        }

        const data = await response.json();

        setAttachments(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load attachments:", error);
        setAttachments([]);
      } finally {
        setLoadingAttachments(false);
      }
    };

    loadAttachments();
  }, [ticket?.id]);

  useEffect(() => {
    if (!ticket?.id) return;

    const loadRemarks = async () => {
      setLoadingRemarks(true);

      try {
        const response = await fetch(
          `/api/remarks?ticketId=${encodeURIComponent(ticket.id)}`,
        );

        const data = await response.json();

        setRemarks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingRemarks(false);
      }
    };

    loadRemarks();
  }, [ticket.id]);

  // const getHoursFromSla = (sla: string) => {
  //   const value = parseInt(sla);

  //   if (sla.includes("wd")) return value * 24 * 5;
  //   if (sla.includes("d")) return value * 24;
  //   if (sla.includes("h")) return value;

  //   return 24;
  // };

  // const createdAt = new Date(ticket.createdAt);
  // const now = new Date();
  // const elapsedHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  // const targetHours = getHoursFromSla(ticket.slaTarget);
  // const progressPercentage = Math.round((elapsedHours / targetHours) * 100);
  // const remainingHours = targetHours - elapsedHours;
  // const breached = remainingHours < 0;

  const {
    createdDate,
    dueDate,
    percent: progressPercentage,
    breached,
  } = getTicketSlaMetrics({
    createdAt: ticket.createdAt,
    slaTarget: ticket.slaTarget,
    status: ticket.status,
  });

  const sla = parseSla(ticket.slaTarget);

  const now = new Date();

  const elapsedTime = formatSlaTime(createdDate, now, sla.unit);

  const slaDifference = formatSlaTime(now, dueDate, sla.unit);

  const remainingTime = formatSlaTime(now, dueDate, sla.unit);

  const timeline = [...remarks]
    .sort(
      (a, b) =>
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    )
    .filter(
      (remark, index, array) =>
        index ===
        array.findIndex((r) => r.statusChangedTo === remark.statusChangedTo),
    );

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${parseFloat((bytes / Math.pow(1024, index)).toFixed(2))} ${
      units[index]
    }`;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT */}

      <div className="xl:col-span-2 white-section">
        {/* Tabs */}

        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("details")}
            className={`
                flex items-center gap-2
                px-5 py-3
                text-sm font-semibold
                border-b-2
                transition-all cursor-pointer
                ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }
              `}
          >
            <FileText size={17} />
            <span>Details</span>
          </button>

          <button
            onClick={() => setActiveTab("activity")}
            className={`
              flex items-center gap-2
              px-5 py-3
              text-sm font-semibold
              border-b-2
              transition-all cursor-pointer
              ${
                activeTab === "activity"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }
            `}
          >
            <History size={17} />
            <span>Activity</span>
          </button>
        </div>

        {/* DETAILS TAB */}

        {activeTab === "details" && (
          <div className="space-y-5">
            {/* Customer */}

            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4 section-title">
                <User size={18} />
                <h3 className="font-semibold">Customer Information</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <InfoField label="Customer Name" value={ticket.customerName} />

                <InfoField label="Property" value={ticket.property} />

                <InfoField label="Mobile" value={ticket.customerMobile} />

                <InfoField label="Email" value="customer@email.com" />
              </div>
            </section>

            {/* Ticket */}

            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4 section-title">
                <AlertTriangle size={18} />
                <h3 className="font-semibold">Ticket Information</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <InfoField label="Category" value={ticket.category} />
                <InfoField label="Scope of the Issue" value={ticket.scope} />
                <InfoField
                  label="Complaint Source"
                  value={ticket.complaintSource}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <InfoField label="Subject/Short Title" value={ticket.title} />

                <InfoField
                  label="Description/Details"
                  value={ticket.description}
                />
              </div>
            </section>

            {/* Attachments */}

            <section className="rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 section-title">
                  <Paperclip size={18} />
                  <h3 className="font-semibold">Attachments</h3>
                </div>

                {!loadingAttachments && attachments.length > 0 && (
                  <span className="text-xs font-medium text-slate-500">
                    {attachments.length}{" "}
                    {attachments.length === 1 ? "file" : "files"}
                  </span>
                )}
              </div>

              {loadingAttachments ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <LoaderCircle size={20} className="animate-spin mr-2" />
                  <span className="text-sm">Loading attachments...</span>
                </div>
              ) : attachments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                  <Paperclip size={28} className="mb-2" />
                  <p className="text-sm">No attachments available</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attachments.map((attachment) => {
                    const attachmentUrl =
                      `/api/tickets/${encodeURIComponent(ticket.id)}/attachments/` +
                      encodeURIComponent(attachment.id);

                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200">
                            {attachment.mimeType.startsWith("image/") ? (
                              <Paperclip size={18} className="text-blue-600" />
                            ) : (
                              <FileText size={18} className="text-blue-600" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="text-sm font-medium text-slate-700 truncate"
                              title={attachment.originalName}
                            >
                              {attachment.originalName}
                            </p>

                            <p className="text-xs text-slate-400 mt-0.5">
                              {formatFileSize(attachment.fileSize)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 transition"
                            title="Open attachment"
                          >
                            <ExternalLink size={16} />
                          </a>

                          <a
                            href={attachmentUrl}
                            download={attachment.originalName}
                            className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            title="Download attachment"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* CC List */}

            <div className="flex flex-wrap gap-2">
              <InfoField
                label="CC Receipients List"
                value={
                  ticket.cctoList?.length ? (
                    ticket.cctoList.map((email: string) => (
                      <EmailChip key={email} email={email} />
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">
                      No CC recipients
                    </span>
                  )
                }
              />
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}

        {activeTab === "activity" && (
          <div className="timeline-scroll max-h-full overflow-y-auto pr-2">
            {loadingRemarks ? (
              <p className="py-10 text-center text-slate-500">
                Loading activity...
              </p>
            ) : remarks.length === 0 ? (
              <p className="py-10 text-center text-slate-500">
                No activity available.
              </p>
            ) : (
              [...remarks]
                .sort(
                  (a, b) =>
                    new Date(b.createdDate).getTime() -
                    new Date(a.createdDate).getTime(),
                )
                .map((remark, index, array) => (
                  <TimelineActivityItem
                    key={remark.remarkId}
                    remark={remark}
                    last={index === array.length - 1}
                  />
                ))
            )}
          </div>
        )}
      </div>

      {/* RIGHT */}

      <div className="space-y-6">
        {/* SLA Progress */}

        <div className="white-section">
          <h3 className="font-semibold mb-5">SLA Progress</h3>

          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-500">SLA Utilization</span>

            <span className="font-semibold">{progressPercentage}%</span>
          </div>

          <div className="h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full ${
                progressPercentage >= 100
                  ? "bg-red-500"
                  : progressPercentage >= 75
                    ? "bg-amber-500"
                    : "bg-green-500"
              }`}
              style={{
                width: `${Math.min(progressPercentage, 100)}%`,
              }}
            />
          </div>

          <div className="mt-5 space-y-4">
            <MetricRow label="Elapsed Time" value={elapsedTime} />

            <MetricRow label="Target SLA" value={`${sla.value} ${sla.unit}`} />

            <MetricRow
              label={breached ? "Time Passed" : "Time Remaining"}
              value={slaDifference}
            />
          </div>
        </div>

        {/* Timeline Summary */}

        <div className="white-section">
          <h3 className="font-semibold mb-5">Timeline Summary</h3>

          <div className="space-y-5">
            {timeline.map((item, index) => (
              <TimelineItem
                key={item.remarkId}
                title={item.statusChangedTo.replace("_", " ")}
                user={item.updatedBy}
                date={new Date(item.createdDate).toLocaleString()}
                stepType={index === timeline.length - 1 ? "progress" : "normal"}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* Helpers */

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs tracking-wide text-slate-500">{label}</p>
      <p className="font-medium mt-1">{value}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function EmailChip({ email }: { email: string }) {
  return (
    <span className="section-title-light px-3 py-1 rounded-full bg-blue-50 text-sm">
      {email}
    </span>
  );
}

function AttachmentItem({ name }: { name: string }) {
  return (
    <div className="flex justify-between items-center rounded-lg border border-slate-200 px-4 py-3">
      <span>{name}</span>

      <button className="text-blue-600 text-sm font-medium">Download</button>
    </div>
  );
}

function TimelineActivityItem({
  remark,
  last,
}: {
  remark: any;
  last: boolean;
}) {
  const config =
    remark.statusChangedTo === "OPEN"
      ? {
          color: "bg-red-500",
          ring: "ring-red-100",
          badge: "bg-red-50 text-red-700 border-red-100",
          icon: Circle,
          label: "Open",
        }
      : remark.statusChangedTo === "IN_PROGRESS"
        ? {
            color: "bg-amber-500",
            ring: "ring-amber-100",
            badge: "bg-amber-50 text-amber-700 border-amber-100",
            icon: LoaderCircle,
            label: "In Progress",
          }
        : remark.statusChangedTo === "RESOLVED"
          ? {
              color: "bg-blue-500",
              ring: "ring-blue-100",
              badge: "bg-blue-50 text-blue-700 border-blue-100",
              icon: Clock3,
              label: "Resolved",
            }
          : {
              color: "bg-emerald-500",
              ring: "ring-emerald-100",
              badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
              icon: CheckCircle2,
              label: "Closed",
            };

  const Icon = config.icon;

  const formattedDate = new Date(remark.createdDate).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="relative flex gap-3 sm:gap-5">
      {/* Timeline rail */}
      <div className="relative flex w-9 shrink-0 justify-center sm:w-11">
        {/* Vertical connector */}
        {!last && (
          <div className="absolute top-10 bottom-0 w-px bg-gradient-to-b from-slate-200 to-slate-100" />
        )}

        {/* Icon */}
        <div
          className={`
            relative z-10
            flex h-9 w-9 items-center justify-center
            rounded-full
            ${config.color}
            ring-4 ${config.ring}
            shadow-sm
            sm:h-10 sm:w-10
          `}
        >
          <Icon
            size={16}
            strokeWidth={2.4}
            className="text-white sm:size-[18px]"
          />
        </div>
      </div>

      {/* Activity content */}
      <div className="min-w-0 flex-1 pb-5 sm:pb-6">
        <div
          className="
            group
            rounded-xl
            border border-slate-200/80
            bg-white
            px-4 py-3
            shadow-[0_1px_3px_rgba(15,23,42,0.04)]
            transition-all duration-200
            hover:border-slate-300
            hover:shadow-[0_6px_20px_rgba(15,23,42,0.06)]
            sm:rounded-2xl
            sm:px-5 sm:py-4
          "
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800 sm:text-[15px]">
                {remark.remarkType}
              </p>

              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                <span>Updated by</span>

                <span className="truncate font-medium text-slate-700">
                  {remark.updatedBy}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={`
                shrink-0
                rounded-full
                border
                px-2.5 py-1
                text-[10px]
                font-semibold
                uppercase
                tracking-wide
                sm:px-3 sm:py-1.5
                sm:text-[11px]
                ${config.badge}
              `}
            >
              {config.label}
            </span>
          </div>

          {/* Footer */}
          <div
            className="
              mt-3
              flex
              items-center
              justify-between
              gap-3
              border-t
              border-slate-100
              pt-2.5
              sm:mt-4
              sm:pt-3
            "
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              Activity
            </span>

            <time
              dateTime={remark.createdDate}
              className="
                whitespace-nowrap
                text-[11px]
                font-medium
                text-slate-500
                sm:text-xs
              "
            >
              {formattedDate}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  title,
  user,
  date,
  stepType,
}: {
  title: string;
  user: string;
  date: string;
  stepType: string;
}) {
  const isProgress = stepType === "progress";

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`
            w-3
            h-3
            rounded-full bg-blue-500
          `}
        />

        <div className="w-px h-10 bg-slate-200 mt-2" />
      </div>

      <div>
        <p
          className={`
            font-medium text-slate-800
          `}
        >
          {title}
        </p>

        <p className="text-sm text-slate-500">{user}</p>

        <p className="text-xs text-slate-400">
          {new Date(date).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })}
        </p>
      </div>
    </div>
  );
}
