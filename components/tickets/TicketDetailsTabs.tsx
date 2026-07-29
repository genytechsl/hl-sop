"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";

interface Props {
  ticket: any;
}

export default function TicketDetailsTabs({ ticket }: Props) {
  const [activeTab, setActiveTab] = useState("details");
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loadingRemarks, setLoadingRemarks] = useState(false);

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

  const getHoursFromSla = (sla: string) => {
    const value = parseInt(sla);

    if (sla.includes("wd")) return value * 24 * 5;
    if (sla.includes("d")) return value * 24;
    if (sla.includes("h")) return value;

    return 24;
  };

  const createdAt = new Date(ticket.createdAt);
  const now = new Date();

  const elapsedHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  const targetHours = getHoursFromSla(ticket.slaTarget);

  const progressPercentage = Math.round((elapsedHours / targetHours) * 100);

  const remainingHours = targetHours - elapsedHours;

  const breached = remainingHours < 0;

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

              <div className="grid md:grid-cols-2 gap-4">
                <InfoField label="Customer Name" value={ticket.customerName} />

                <InfoField label="Property" value={ticket.property} />

                <InfoField label="Mobile" value="+94 77 123 4567" />

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
                  label="Scope of the Issue"
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
              <div className="flex items-center gap-2 mb-4 section-title">
                <Paperclip size={18} />
                <h3 className="font-semibold">Attachments</h3>
              </div>

              <div className="space-y-2">
                <AttachmentItem name="water-leak-photo-01.jpg" />

                <AttachmentItem name="inspection-report.pdf" />
              </div>
            </section>

            {/* CC List */}

            <div className="flex flex-wrap gap-2">
              {ticket.selectedEmails?.length ? (
                ticket.selectedEmails.map((email: string) => (
                  <EmailChip key={email} email={email} />
                ))
              ) : (
                <span className="text-sm text-slate-500">No CC recipients</span>
              )}
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}

        {activeTab === "activity" && (
          <div className="timeline-scroll max-h-[500px] overflow-y-auto pr-2">
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
            <MetricRow
              label="Elapsed Time"
              value={`${Math.floor(elapsedHours)} h`}
            />

            <MetricRow label="Target SLA" value={`${targetHours} h`} />

            <MetricRow
              label={breached ? "Time Passed" : "Time Remaining"}
              value={`${Math.abs(Math.floor(remainingHours))} h`}
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
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="font-medium">{value}</p>
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
          badge: "bg-red-100 text-red-700",
          icon: Circle,
        }
      : remark.statusChangedTo === "IN_PROGRESS"
        ? {
            color: "bg-amber-500",
            badge: "bg-amber-100 text-amber-700",
            icon: LoaderCircle,
          }
        : remark.statusChangedTo === "RESOLVED"
          ? {
              color: "bg-blue-500",
              badge: "bg-blue-100 text-blue-700",
              icon: Clock3,
            }
          : {
              color: "bg-green-500",
              badge: "bg-green-100 text-green-700",
              icon: CheckCircle2,
            };

  const Icon = config.icon;

  return (
    <div className="relative flex gap-5 pb-8">
      {/* Timeline */}

      <div className="relative flex flex-col items-center">
        <div
          className={`
            z-10
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            shadow-md
            ${config.color}
          `}
        >
          <Icon size={18} className="text-white" />
        </div>

        {!last && <div className="absolute top-10 w-px h-full bg-slate-200" />}
      </div>

      {/* Card */}

      <div
        className="
          flex-1
          rounded-2xl
          border
          border-slate-200
          bg-white
          px-5 py-1
          shadow-sm
          transition-all
          hover:border-blue-200
          hover:shadow-md
        "
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-800">{remark.remarkType}</p>

            <p className="mt-2 text-sm text-slate-500">
              Updated by{" "}
              <span className="font-medium text-slate-700">
                {remark.updatedBy}
              </span>
            </p>
          </div>

          <span
            className={`
              rounded-full
              px-3
              py-1
              text-xs
              font-semibold
              whitespace-nowrap
              ${config.badge}
            `}
          >
            {remark.statusChangedTo.replace("_", " ")}
          </span>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-400">
            Activity
          </span>

          <span className="text-xs text-slate-500">
            {new Date(remark.createdDate).toLocaleString()}
          </span>
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

        <p className="text-xs text-slate-400">{date}</p>
      </div>
    </div>
  );
}
