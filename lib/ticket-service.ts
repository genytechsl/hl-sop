import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "tickets.json");

export type Ticket = {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  property: string;
  status: string;
  priority: string;
  assignedToId: string;
  createdAt: string;
  customerName: string;
  slaTarget: string;
  scope: string;
  ccList: string[];
  complaintSource: string;
};

export async function getTickets(): Promise<Ticket[]> {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");

    const tickets = JSON.parse(fileContents);

    return Array.isArray(tickets) ? tickets : [];
  } catch (error) {
    console.error("Error reading tickets.json:", error);

    return [];
  }
}

export async function getTicketById(id: string) {
  const tickets = await getTickets();

  return tickets.find((ticket) => ticket.id === id);
}

export async function getTicketsByAssignedTo(assignedTo: string) {
  console.log("assigned to true ");
  const tickets = await getTickets();

  return tickets.filter((ticket) => ticket.assignedToId === assignedTo);
}

export async function createTicket(ticket: Ticket): Promise<Ticket> {
  try {
    const tickets = await getTickets();

    tickets.push(ticket);

    fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2), "utf8");

    return ticket;
  } catch (error) {
    console.error("Error writing ticket:", error);
    throw error;
  }
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
): Promise<Ticket | null> {
  const tickets = await getTickets();

  const index = tickets.findIndex((ticket) => ticket.id === ticketId);

  if (index === -1) {
    return null;
  }

  tickets[index].status = status;

  fs.writeFileSync(filePath, JSON.stringify(tickets, null, 2), "utf8");

  return tickets[index];
}

export async function getTicketOverview() {
  const tickets = await getTickets();

  const open = tickets.filter((t) => t.status === "OPEN").length;
  const inProgress = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const closed = tickets.filter((t) => t.status === "CLOSED").length;

  return {
    open,
    inProgress,
    closed,
    total: tickets.length,
  };
}

function getSlaHours(sla: string) {
  const value = parseInt(sla);

  if (sla.includes("wd")) return value * 24 * 5;
  if (sla.includes("d")) return value * 24;
  if (sla.includes("h")) return value;

  return 0;
}

function getAgeHours(createdAt: string) {
  const [date, time] = createdAt.split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const created = new Date(year, month - 1, day, hour, minute);

  return (Date.now() - created.getTime()) / (1000 * 60 * 60);
}

export async function getAgingOverview() {
  const tickets = await getTickets();

  const categories = [
    {
      code: "CAT-A",
      label: "CRITICAL",
      color: "bg-red-500",
      slaTarget: "24 h",
      accentColor: "oklch(63.7% 0.237 25.331)",
    },
    {
      code: "CAT-B",
      label: "TECHNICAL",
      color: "bg-blue-500",
      slaTarget: "7 Working Days",
      accentColor: "oklch(62.3% 0.214 259.815)",
    },
    {
      code: "CAT-B2",
      label: "SFM FACILITY",
      color: "bg-green-500",
      slaTarget: "7 Days",
      accentColor: "oklch(72.3% 0.219 149.579)",
    },
    {
      code: "CAT-C",
      label: "ADMIN/PAY",
      color: "bg-slate-500",
      slaTarget: "5 Working Days",
      accentColor: "oklch(55.4% 0.046 257.417)",
    },
    {
      code: "CAT-D",
      label: "LEGAL",
      color: "bg-purple-500",
      slaTarget: "10 Working Days",
      accentColor: "oklch(62.7% 0.265 303.9)",
    },
  ];

  return categories.map((category) => {
    const rows = tickets.filter((t) => t.category === category.code);

    if (!rows.length) {
      return {
        ...category,
        target: "-",
        aging: "-",
        compliance: 100,
      };
    }

    const totalAge = rows.reduce(
      (sum, ticket) => sum + getAgeHours(ticket.createdAt),
      0,
    );

    const averageAge = totalAge / rows.length;

    const breached = rows.filter(
      (ticket) => getAgeHours(ticket.createdAt) > Number(ticket.slaTarget),
    ).length;

    const compliance = Math.round(
      ((rows.length - breached) / rows.length) * 100,
    );

    let aging = "";

    if (averageAge >= 24 * 5) aging = `${Math.round(averageAge / (24 * 5))} wd`;
    else if (averageAge >= 24) aging = `${Math.round(averageAge / 24)} d`;
    else aging = `${Math.round(averageAge)} h`;

    // return {
    //   ...category,
    //   target: rows[0].slaTarget,
    //   aging,
    //   compliance,
    // };

    return {
      ...category,
      target: rows[0].slaTarget,
      averageAge,
      compliance,
    };
  });
}
