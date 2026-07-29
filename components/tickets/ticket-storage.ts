import { ticketData, Ticket } from "./ticket-data";

export function getTickets(): Ticket[] {
  if (typeof window === "undefined") {
    return ticketData;
  }

  const savedTickets = JSON.parse(localStorage.getItem("tickets") || "[]");

  return [...savedTickets, ...ticketData];
}

export function saveTicket(ticket: Ticket) {
  const existing = JSON.parse(localStorage.getItem("tickets") || "[]");

  localStorage.setItem("tickets", JSON.stringify([...existing, ticket]));
}
