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
