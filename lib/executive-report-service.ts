import { prisma } from "@/lib/prisma";

import {
  getActionOwnerWorkload,
  getAgingOverview,
  getCategoryVolume,
  getTicketOverview,
  getTicketVolume,
} from "@/lib/ticket-service";

import { getSlaDueDate } from "@/lib/sla";

const REPORT_TIME_ZONE = "Asia/Colombo";

/* =========================================================
   REPORT DATE / TIME
========================================================= */

function formatReportDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: REPORT_TIME_ZONE,
  }).format(date);
}

function formatReportTime(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: REPORT_TIME_ZONE,
  }).format(date);
}

/* =========================================================
   SLA BREACH SUMMARY
========================================================= */

async function getExecutiveSlaBreachSummary() {
  const tickets = await prisma.ticket.findMany({
    select: {
      status: true,
      slaTarget: true,
      createdAt: true,
      ticketType: true,
    },
  });

  const now = new Date();

  let breached = 0;

  let closedTickets = 0;
  let breachedClosed = 0;

  let openedTickets = 0;
  let breachedOpened = 0;

  /* =======================================================
     TOTAL COUNTS BY TYPE
  ======================================================= */

  let totalComplaints = 0;
  let totalInquiries = 0;

  /* =======================================================
     ACTIVE BREACHED COUNTS BY TYPE
  ======================================================= */

  let breachedComplaints = 0;
  let breachedInquiries = 0;

  /* =======================================================
     CLOSED TOTAL + BREACHED COUNTS BY TYPE
  ======================================================= */

  let closedComplaints = 0;
  let closedInquiries = 0;

  let closedBreachedComplaints = 0;
  let closedBreachedInquiries = 0;

  /* =======================================================
     OPEN / IN PROGRESS TOTAL + BREACHED COUNTS BY TYPE
  ======================================================= */

  let openedComplaints = 0;
  let openedInquiries = 0;

  let openedBreachedComplaints = 0;
  let openedBreachedInquiries = 0;

  /* =======================================================
     CALCULATE
  ======================================================= */

  tickets.forEach((ticket) => {
    const dueDate = getSlaDueDate(
      ticket.createdAt,
      ticket.slaTarget ?? undefined,
    );

    const isBreached = now.getTime() > dueDate.getTime();

    const type = ticket.ticketType?.trim().toUpperCase();

    const isComplaint = type === "COM";
    const isInquiry = type === "INQ";

    const isClosed = ticket.status === "CLOSED";

    const isOpen = ticket.status === "OPEN" || ticket.status === "IN_PROGRESS";

    /* =====================================================
       OVERALL TOTAL BY TYPE
    ===================================================== */

    if (isComplaint) {
      totalComplaints++;
    }

    if (isInquiry) {
      totalInquiries++;
    }

    /* =====================================================
       CLOSED
    ===================================================== */

    if (isClosed) {
      closedTickets++;

      if (isComplaint) {
        closedComplaints++;
      }

      if (isInquiry) {
        closedInquiries++;
      }

      if (isBreached) {
        breachedClosed++;

        if (isComplaint) {
          closedBreachedComplaints++;
        }

        if (isInquiry) {
          closedBreachedInquiries++;
        }
      }
    }

    /* =====================================================
       OPEN / IN PROGRESS
    ===================================================== */

    if (isOpen) {
      openedTickets++;

      if (isComplaint) {
        openedComplaints++;
      }

      if (isInquiry) {
        openedInquiries++;
      }

      if (isBreached) {
        breachedOpened++;

        if (isComplaint) {
          openedBreachedComplaints++;
        }

        if (isInquiry) {
          openedBreachedInquiries++;
        }
      }
    }

    /* =====================================================
       ACTIVE BREACHED
    ===================================================== */

    if (isOpen && isBreached) {
      breached++;

      if (isComplaint) {
        breachedComplaints++;
      }

      if (isInquiry) {
        breachedInquiries++;
      }
    }
  });

  /* =======================================================
     RESPONSE
  ======================================================= */

  return {
    breached,

    total: tickets.length,

    percentage:
      tickets.length === 0
        ? 0
        : Number(((breached / tickets.length) * 100).toFixed(1)),

    closedBreachRate:
      closedTickets === 0
        ? 0
        : Number(((breachedClosed / closedTickets) * 100).toFixed(1)),

    openedBreachRate:
      openedTickets === 0
        ? 0
        : Number(((breachedOpened / openedTickets) * 100).toFixed(1)),

    /* =====================================================
       OVERALL
    ===================================================== */

    totalComplaints,
    totalInquiries,

    breachedComplaints,
    breachedInquiries,

    /* =====================================================
       CLOSED
    ===================================================== */

    closedTickets,
    breachedClosed,

    closedComplaints,
    closedInquiries,

    closedBreachedComplaints,
    closedBreachedInquiries,

    /* =====================================================
       OPEN / IN PROGRESS
    ===================================================== */

    openedTickets,
    breachedOpened,

    openedComplaints,
    openedInquiries,

    openedBreachedComplaints,
    openedBreachedInquiries,
  };
}

/* =========================================================
   EXECUTIVE SUMMARY
========================================================= */

export async function getExecutiveSummaryReport() {
  const generatedAt = new Date();

  const [
    overview,
    aging,
    categoryVolume,
    ticketVolume,
    ownerWorkload,
    slaBreach,
  ] = await Promise.all([
    getTicketOverview(),
    getAgingOverview(),
    getCategoryVolume(),
    getTicketVolume(),
    getActionOwnerWorkload(),
    getExecutiveSlaBreachSummary(),
  ]);

  return {
    report: {
      type: "EXECUTIVE_SUMMARY",

      title: "Executive Summary Report",

      platform: "Case Intelligence Platform",

      generatedAt: generatedAt.toISOString(),

      generatedDate: formatReportDate(generatedAt),

      generatedTime: formatReportTime(generatedAt),

      timeZone: REPORT_TIME_ZONE,

      branding: {
        clientLogo: "/hl_logo.png",

        footerLeft: "SolvY360 · GenY Tech © 2026",

        footerCenter: "Case Intelligence Platform",
      },

      dataScope: {
        overview: "All-time",
        aging: "All-time",
        categoryVolume: "All-time",
        ticketVolume: "Rolling 12 months",
        ownerWorkload: "All-time",
        slaBreach: "Current snapshot",
      },
    },

    overview,

    aging,

    categoryVolume,

    ticketVolume,

    ownerWorkload,

    slaBreach,
  };
}

export type ExecutiveSummaryReport = Awaited<
  ReturnType<typeof getExecutiveSummaryReport>
>;
