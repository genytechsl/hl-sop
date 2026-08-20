"use client";

import { useEffect, useState } from "react";

import {
  FolderOpen,
  Clock3,
  CheckCircle2,
  Layers3,
  Info,
  CircleCheck,
  ListCheck,
} from "lucide-react";

import StatusCard from "../StatusCard";

interface TicketOverview {
  open: number;
  openComplaints: number;
  openInquiries: number;

  inProgress: number;
  inProgressComplaints: number;
  inProgressInquiries: number;

  resolved: number;
  resolvedComplaints: number;
  resolvedInquiries: number;

  closed: number;
  closedComplaints: number;
  closedInquiries: number;

  total: number;
  totalComplaints: number;
  totalInquiries: number;
}

const initialOverview: TicketOverview = {
  open: 0,
  openComplaints: 0,
  openInquiries: 0,

  inProgress: 0,
  inProgressComplaints: 0,
  inProgressInquiries: 0,

  resolved: 0,
  resolvedComplaints: 0,
  resolvedInquiries: 0,

  closed: 0,
  closedComplaints: 0,
  closedInquiries: 0,

  total: 0,
  totalComplaints: 0,
  totalInquiries: 0,
};

export default function StatusOverview() {
  const [overview, setOverview] = useState<TicketOverview>(initialOverview);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError(false);

        const res = await fetch("/api/tickets?overview=true");

        if (!res.ok) {
          throw new Error(`Failed to load ticket overview: ${res.status}`);
        }

        const data = await res.json();

        setOverview({
          open: Number(data.open) || 0,
          openComplaints: Number(data.openComplaints) || 0,
          openInquiries: Number(data.openInquiries) || 0,

          inProgress: Number(data.inProgress) || 0,
          inProgressComplaints: Number(data.inProgressComplaints) || 0,
          inProgressInquiries: Number(data.inProgressInquiries) || 0,

          resolved: Number(data.resolved) || 0,
          resolvedComplaints: Number(data.resolvedComplaints) || 0,
          resolvedInquiries: Number(data.resolvedInquiries) || 0,

          closed: Number(data.closed) || 0,
          closedComplaints: Number(data.closedComplaints) || 0,
          closedInquiries: Number(data.closedInquiries) || 0,

          total: Number(data.total) || 0,
          totalComplaints: Number(data.totalComplaints) || 0,
          totalInquiries: Number(data.totalInquiries) || 0,
        });
      } catch (err) {
        console.error("Failed to load ticket overview:", err);

        setOverview(initialOverview);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const total = overview.total;

  const getPercentage = (value: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <section className="space-y-4">
      {/* Section Heading */}
      <div className="flex items-center gap-2">
        <h2 className="section-heading">Ticket Status Overview</h2>

        <Info size={16} className="text-slate-500" />
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
          <p className="text-sm text-slate-500">Loading ticket status...</p>
        </div>
      ) : error ? (
        /* Error */
        <div className="flex min-h-[180px] items-center justify-center rounded-3xl border border-slate-200 bg-white px-6 text-center shadow-sm">
          <div>
            <p className="text-base font-medium text-slate-700">
              Data unavailable at the moment
            </p>

            <p className="mt-1 text-sm text-slate-500">
              We couldn't load the ticket status overview. Please try again
              later.
            </p>
          </div>
        </div>
      ) : (
        /* Cards */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {/* OPEN */}
          <StatusCard
            title="Open"
            value={overview.open}
            percentage={getPercentage(overview.open)}
            complaints={overview.openComplaints}
            inquiries={overview.openInquiries}
            icon={<FolderOpen className="text-red-400" />}
            accentColor="#ff6467"
          />

          {/* IN PROGRESS */}
          <StatusCard
            title="In Progress"
            value={overview.inProgress}
            percentage={getPercentage(overview.inProgress)}
            complaints={overview.inProgressComplaints}
            inquiries={overview.inProgressInquiries}
            icon={<Clock3 className="text-amber-400" />}
            accentColor="#ffb900"
          />

          {/* RESOLVED */}
          <StatusCard
            title="Resolved"
            value={overview.resolved}
            percentage={getPercentage(overview.resolved)}
            complaints={overview.resolvedComplaints}
            inquiries={overview.resolvedInquiries}
            icon={<CircleCheck className="text-emerald-400" />}
            accentColor="#10b981"
          />

          {/* CLOSED */}
          <StatusCard
            title="Closed"
            value={overview.closed}
            percentage={getPercentage(overview.closed)}
            complaints={overview.closedComplaints}
            inquiries={overview.closedInquiries}
            icon={<ListCheck className="text-purple-500" />}
            accentColor="#9B4DCA"
          />

          {/* TOTAL */}
          <StatusCard
            title="Total Tickets"
            value={overview.total}
            percentage={100}
            complaints={overview.totalComplaints}
            inquiries={overview.totalInquiries}
            icon={<Layers3 className="text-blue-400" />}
            accentColor="#51a2ff"
          />
        </div>
      )}
    </section>
  );
}
