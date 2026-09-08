import { prisma } from "@/lib/prisma";

type SlaUnit = "hours" | "days" | "workingDays";

interface Category {
  code: string;
  label: string;
  color: string;
  sla: number;
  slaTarget: string;
  accentColor: string;
  unit: SlaUnit;
}

export type Ticket = {
  id: string;
  title: string;
  description: string;
  ticketType: string;
  category: string;
  categoryLabel: string;
  property: string;
  status: string;
  priority: string;
  assignedToId: string;
  createdAt: string;
  customerName: string;
  customerEmail?: string;
  customerMobile?: number;
  customerNic?: string;
  actionOwnerEmail?: string;
  actionOwnerName?: string;
  slaTarget: string;
  scope: string;
  cctoList: string[];
  complaintSource: string;
  ticketNumber?: string;
  sendEmail?: boolean;
  propertyId?: number;
  customerId?: string;
};

export type CreateTicketInput = {
  id: string;
  title: string;
  description: string;
  ticketType: string;
  category: string;
  categoryLabel: string;
  status: string;
  priority: string;
  customerId: string;
  propertyId: number;
  assignedToId?: string;
  slaTarget: string;
  complaintSource: string;
  scope: string;
  cctoList: string[];
  sendEmail: boolean;
  createdAt: string;
};

function formatTicket(ticket: any): Ticket {
  return {
    id: ticket.id,
    title: ticket.title,
    description: ticket.description,
    ticketType: ticket.ticketType,
    category: ticket.category,
    categoryLabel: ticket.categoryLabel,
    property: ticket.property
      ? `${ticket.property.propertyName}, ${ticket.property.address}`
      : "",
    status: ticket.status,
    priority: ticket.priority,
    assignedToId: ticket.assignedToId ?? "",
    createdAt: formatDateTime(ticket.createdAt),

    customerName: ticket.customer?.name ?? "",
    customerEmail: ticket.customer?.email ?? "",
    customerMobile: ticket.customer?.mobile ?? "",
    customerNic: ticket.customer?.nic ?? "",

    actionOwnerEmail: ticket.assignedTo?.email ?? "",
    actionOwnerName: ticket.assignedTo?.name ?? "",
    slaTarget: ticket.slaTarget,
    scope: ticket.scope,
    cctoList: Array.isArray(ticket.cctoList) ? ticket.cctoList : [],
    complaintSource: ticket.complaintSource,
    ticketNumber: ticket.id,
    sendEmail: ticket.sendEmail,
    customerId: ticket.customerId,
    propertyId: ticket.propertyId,
  };
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

const ticketInclude = {
  customer: true,
  property: true,
  assignedTo: true,
  remarks: {
    include: {
      updatedBy: true,
    },
  },
  // slaNotification: true,
} as const;

export async function getTickets(): Promise<Ticket[]> {
  const tickets = await prisma.ticket.findMany({
    include: ticketInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return tickets.map(formatTicket);
}

export async function getTicketById(id: string): Promise<Ticket | undefined> {
  const ticket = await prisma.ticket.findUnique({
    where: {
      id,
    },
    include: ticketInclude,
  });

  if (!ticket) {
    return undefined;
  }

  return formatTicket(ticket);
}

export async function getTicketByIdForUser(
  ticketId: string,
  userId: string,
  role: "admin" | "actionOwner" | "dataEntry",
): Promise<Ticket | undefined> {
  const ticket = await prisma.ticket.findFirst({
    where: {
      id: ticketId,

      // Action owners can ONLY access their own tickets.
      ...(role === "actionOwner"
        ? {
            assignedToId: userId,
          }
        : {}),
    },

    include: ticketInclude,
  });

  if (!ticket) {
    return undefined;
  }

  return formatTicket(ticket);
}

export async function getTicketsByAssignedTo(
  assignedTo: string,
): Promise<Ticket[]> {
  const tickets = await prisma.ticket.findMany({
    where: {
      assignedToId: assignedTo,
    },
    include: ticketInclude,
    orderBy: {
      createdAt: "desc",
    },
  });

  return tickets.map(formatTicket);
}

export async function getTicketsByCustomerId(customerId: string) {
  const tickets = await prisma.ticket.findMany({
    where: {
      customerId,
    },

    select: {
      id: true,
      title: true,
      ticketType: true,
      category: true,
      categoryLabel: true,
      scope: true,
      status: true,
      priority: true,
      propertyId: true,
      createdAt: true,

      remarks: {
        where: {
          statusChangedTo: "RESOLVED",
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    title: ticket.title,
    ticketType: ticket.ticketType,
    category: ticket.category,
    categoryLabel: ticket.categoryLabel,
    scope: ticket.scope,
    status: ticket.status,
    priority: ticket.priority,
    propertyId: ticket.propertyId,
    createdAt: ticket.createdAt,
    resolvedAt: ticket.remarks[0]?.createdAt ?? null,
  }));
}

export async function createTicket(ticket: CreateTicketInput): Promise<Ticket> {
  if (!ticket.customerId) {
    throw new Error("Customer ID is required");
  }

  if (!ticket.propertyId) {
    throw new Error("Property ID is required");
  }

  const createdTicket = await prisma.ticket.create({
    data: {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      ticketType: ticket.ticketType,
      category: ticket.category,
      categoryLabel: ticket.categoryLabel,
      status: ticket.status,
      priority: ticket.priority,
      customerId: ticket.customerId,
      propertyId: ticket.propertyId,
      assignedToId: ticket.assignedToId || null,
      slaTarget: ticket.slaTarget,
      complaintSource: ticket.complaintSource,
      scope: ticket.scope,
      cctoList: ticket.cctoList ?? [],
      sendEmail: ticket.sendEmail ?? false,
      // createdAt: new Date(ticket.createdAt),
      slaNotification: {
        create: {
          warning80Sent: false,
        },
      },
    },
    include: ticketInclude,
  });

  return formatTicket(createdTicket);
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
): Promise<Ticket | null> {
  const existing = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  if (!existing) {
    return null;
  }

  const updatedTicket = await prisma.ticket.update({
    where: {
      id: ticketId,
    },
    data: {
      status,
    },
    include: ticketInclude,
  });

  return formatTicket(updatedTicket);
}

export async function updateTicket(
  updatedTicket: Ticket,
): Promise<Ticket | null> {
  const existing = await prisma.ticket.findUnique({
    where: {
      id: updatedTicket.id,
    },
  });

  if (!existing) {
    return null;
  }

  const ticket = await prisma.ticket.update({
    where: {
      id: updatedTicket.id,
    },
    data: {
      title: updatedTicket.title,
      description: updatedTicket.description,
      ticketType: updatedTicket.ticketType,
      category: updatedTicket.category,
      categoryLabel: updatedTicket.categoryLabel,
      status: updatedTicket.status,
      priority: updatedTicket.priority,
      customerId: updatedTicket.customerId,
      propertyId: updatedTicket.propertyId,
      assignedToId: updatedTicket.assignedToId || null,
      slaTarget: updatedTicket.slaTarget,
      complaintSource: updatedTicket.complaintSource,
      scope: updatedTicket.scope,
      cctoList: updatedTicket.cctoList ?? [],
      sendEmail: updatedTicket.sendEmail ?? false,
    },
    include: ticketInclude,
  });

  return formatTicket(ticket);
}

export async function getTicketOverview() {
  const grouped = await prisma.ticket.groupBy({
    by: ["status", "ticketType"],
    _count: {
      _all: true,
    },
  });

  const getCount = (status: string, ticketType?: string) => {
    return grouped
      .filter(
        (item) =>
          item.status === status &&
          (!ticketType || item.ticketType === ticketType),
      )
      .reduce((total, item) => total + item._count._all, 0);
  };

  const getTypeCount = (ticketType: string) => {
    return grouped
      .filter((item) => item.ticketType === ticketType)
      .reduce((total, item) => total + item._count._all, 0);
  };

  const total = grouped.reduce((sum, item) => sum + item._count._all, 0);

  return {
    open: getCount("OPEN"),
    openComplaints: getCount("OPEN", "COM"),
    openInquiries: getCount("OPEN", "INQ"),

    inProgress: getCount("IN_PROGRESS"),
    inProgressComplaints: getCount("IN_PROGRESS", "COM"),
    inProgressInquiries: getCount("IN_PROGRESS", "INQ"),

    resolved: getCount("RESOLVED"),
    resolvedComplaints: getCount("RESOLVED", "COM"),
    resolvedInquiries: getCount("RESOLVED", "INQ"),

    closed: getCount("CLOSED"),
    closedComplaints: getCount("CLOSED", "COM"),
    closedInquiries: getCount("CLOSED", "INQ"),

    total,
    totalComplaints: getTypeCount("COM"),
    totalInquiries: getTypeCount("INQ"),
  };
}

function getWorkingDays(start: Date, end: Date) {
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();

    if (day !== 0 && day !== 6) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

function getAgeHours(createdAt: string) {
  const created = parseDate(createdAt);
  return (Date.now() - created.getTime()) / 3600000;
}

function getAgeDays(createdAt: string) {
  const created = parseDate(createdAt);
  return (Date.now() - created.getTime()) / 86400000;
}

function getAgeWorkingDays(createdAt: string) {
  const created = parseDate(createdAt);
  return getWorkingDays(created, new Date());
}

function getAge(createdAt: string, unit: "hours" | "days" | "workingDays") {
  switch (unit) {
    case "hours":
      return getAgeHours(createdAt);

    case "days":
      return getAgeDays(createdAt);

    case "workingDays":
      return getAgeWorkingDays(createdAt);
  }
}

function parseDate(dateTime: string): Date {
  const [date, time] = dateTime.split(" ");

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute);
}

const categories: Category[] = [
  {
    code: "CAT-A",
    label: "CRITICAL",
    color: "bg-red-500",
    slaTarget: "24 h",
    accentColor: "oklch(63.7% 0.237 25.331)",
    sla: 24,
    unit: "hours",
  },
  {
    code: "CAT-B",
    label: "TECHNICAL",
    color: "bg-blue-500",
    slaTarget: "7 Working Days",
    accentColor: "oklch(62.3% 0.214 259.815)",
    sla: 7,
    unit: "workingDays",
  },
  {
    code: "CAT-B2",
    label: "SFM FACILITY",
    color: "bg-cyan-600",
    slaTarget: "7 Days",
    accentColor: "oklch(60.9% 0.126 221.723)",
    sla: 7,
    unit: "days",
  },
  {
    code: "CAT-C",
    label: "ADMIN/PAY",
    color: "bg-slate-500",
    slaTarget: "5 Working Days",
    accentColor: "oklch(55.4% 0.046 257.417)",
    sla: 5,
    unit: "workingDays",
  },
  {
    code: "CAT-D",
    label: "LEGAL",
    color: "bg-purple-500",
    slaTarget: "10 Working Days",
    accentColor: "oklch(62.7% 0.265 303.9)",
    sla: 10,
    unit: "workingDays",
  },
];

export async function getAgingOverview() {
  const tickets = await prisma.ticket.findMany({
    select: {
      category: true,
      createdAt: true,
      slaTarget: true,
    },
  });

  return categories.map((category) => {
    const rows = tickets.filter((ticket) => ticket.category === category.code);

    if (!rows.length) {
      return {
        ...category,
        slaTarget: "-",
        averageAge: "-",
        compliance: 100,
      };
    }

    const totalAge = rows.reduce(
      (sum, ticket) =>
        sum + getAge(formatDateTime(ticket.createdAt), category.unit),
      0,
    );

    const avg = Math.round(totalAge / rows.length);

    let averageAge = "";

    switch (category.code) {
      case "CAT-A":
        averageAge = `${avg} h`;
        break;

      case "CAT-B2":
        averageAge = `${avg} Days`;
        break;

      default:
        averageAge = `${avg} Working Days`;
    }

    const breached = rows.filter(
      (ticket) =>
        getAge(formatDateTime(ticket.createdAt), category.unit) > category.sla,
    ).length;

    const compliance = Math.round(
      ((rows.length - breached) / rows.length) * 100,
    );

    return {
      ...category,
      slaTarget: rows[0].slaTarget,
      averageAge,
      compliance,
    };
  });
}

export async function getTicketVolume(): Promise<TicketVolumeItem[]> {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);

  const result: TicketVolumeItem[] = [];

  for (let i = 0; i < 12; i++) {
    const date = new Date(start.getFullYear(), start.getMonth() + i, 1);

    result.push({
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      month: monthNames[date.getMonth()],
      open: 0,
      inProgress: 0,
      closed: 0,
    });
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: start,
      },
    },
    select: {
      createdAt: true,
      status: true,
    },
  });

  for (const ticket of tickets) {
    const createdAt = ticket.createdAt;

    const month = result.find(
      (item) =>
        item.year === createdAt.getFullYear() &&
        item.monthIndex === createdAt.getMonth(),
    );

    if (!month) {
      continue;
    }

    switch (ticket.status) {
      case "OPEN":
        month.open++;
        break;

      case "IN_PROGRESS":
      case "BEING_PROCESSED":
        month.inProgress++;
        break;

      case "RESOLVED":
      case "CLOSED":
        month.closed++;
        break;
    }
  }

  return result;
}

export async function getCategoryVolume() {
  const grouped = await prisma.ticket.groupBy({
    by: ["category"],
    _count: {
      _all: true,
    },
  });

  const counts: Record<string, number> = {
    "CAT-A": 0,
    "CAT-B": 0,
    "CAT-B2": 0,
    "CAT-C": 0,
    "CAT-D": 0,
  };

  grouped.forEach((item) => {
    if (counts[item.category] !== undefined) {
      counts[item.category] = item._count._all;
    }
  });

  return Object.entries(counts).map(([category, value]) => ({
    category,
    value,
  }));
}

export async function getActionOwnerWorkload() {
  const grouped = await prisma.ticket.groupBy({
    by: ["assignedToId"],
    _count: {
      _all: true,
    },
  });

  const employeeIds = grouped
    .map((item) => item.assignedToId)
    .filter((id): id is string => Boolean(id));

  const employees =
    employeeIds.length > 0
      ? await prisma.employee.findMany({
          where: {
            id: {
              in: employeeIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const employeeMap = new Map(
    employees.map((employee) => [employee.id, employee.name]),
  );

  return grouped
    .map((item) => ({
      name: item.assignedToId
        ? (employeeMap.get(item.assignedToId) ?? "Unknown")
        : "Unassigned",
      tickets: item._count._all,
    }))
    .sort((a, b) => b.tickets - a.tickets);
}

interface TicketVolumeItem {
  year: number;
  monthIndex: number;
  month: string;
  open: number;
  inProgress: number;
  closed: number;
}

interface SlaComplianceItem {
  month: string;
  year: number;
  monthIndex: number;
  compliance: number;
}

function getSlaLimit(category: string) {
  const categoryConfig = categories.find((item) => item.code === category);

  return categoryConfig ?? null;
}

export async function getSlaCompliance(): Promise<SlaComplianceItem[]> {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1, 0, 0, 0, 0);

  const tickets = await prisma.ticket.findMany({
    where: {
      createdAt: {
        gte: start,
      },
    },
    select: {
      createdAt: true,
      category: true,
      status: true,
    },
  });

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const result = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);

    return {
      year: date.getFullYear(),
      monthIndex: date.getMonth(),
      month: monthNames[date.getMonth()],
      total: 0,
      compliant: 0,
    };
  });

  for (const ticket of tickets) {
    const category = getSlaLimit(ticket.category);

    if (!category) {
      continue;
    }

    const month = result.find(
      (item) =>
        item.year === ticket.createdAt.getFullYear() &&
        item.monthIndex === ticket.createdAt.getMonth(),
    );

    if (!month) {
      continue;
    }

    month.total++;

    const age = getAge(formatDateTime(ticket.createdAt), category.unit);

    if (age <= category.sla) {
      month.compliant++;
    }
  }

  return result.map((item) => ({
    year: item.year,
    monthIndex: item.monthIndex,
    month: item.month,
    compliance:
      item.total > 0 ? Math.round((item.compliant / item.total) * 100) : 0,
  }));
}

export async function getScopeDistribution(month?: string) {
  const now = new Date();

  let year = now.getFullYear();
  let monthIndex = now.getMonth();

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [selectedYear, selectedMonth] = month.split("-").map(Number);

    year = selectedYear;
    monthIndex = selectedMonth - 1;
  }

  const startDate = new Date(year, monthIndex, 1);

  const endDate = new Date(year, monthIndex + 1, 1);

  const grouped = await prisma.ticket.groupBy({
    by: ["scope", "ticketType"],
    where: {
      createdAt: {
        gte: startDate,
        lt: endDate,
      },
    },
    _count: {
      _all: true,
    },
  });

  const scopes: Record<
    string,
    {
      complaints: number;
      inquiries: number;
    }
  > = {};

  for (const item of grouped) {
    const scope = item.scope?.trim() || "Unspecified";

    if (!scopes[scope]) {
      scopes[scope] = {
        complaints: 0,
        inquiries: 0,
      };
    }

    if (item.ticketType === "COM") {
      scopes[scope].complaints += item._count._all;
    }

    if (item.ticketType === "INQ") {
      scopes[scope].inquiries += item._count._all;
    }
  }

  return Object.entries(scopes)
    .map(([scope, values]) => {
      const total = values.complaints + values.inquiries;

      return {
        scope,
        complaints: values.complaints,
        inquiries: values.inquiries,
        total,
        complaintPercentage:
          total > 0
            ? Number(((values.complaints / total) * 100).toFixed(1))
            : 0,
        inquiryPercentage:
          total > 0 ? Number(((values.inquiries / total) * 100).toFixed(1)) : 0,
      };
    })
    .sort((a, b) => b.total - a.total);
}

export async function getTicketMonths() {
  const tickets = await prisma.ticket.findMany({
    select: {
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const months = new Set<string>();

  for (const ticket of tickets) {
    const year = ticket.createdAt.getFullYear();

    const month = String(ticket.createdAt.getMonth() + 1).padStart(2, "0");

    months.add(`${year}-${month}`);
  }

  return Array.from(months).sort((a, b) => b.localeCompare(a));
}
