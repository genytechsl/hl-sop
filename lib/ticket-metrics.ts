import { parseTicketDate } from "./date-time";

export interface SlaTicket {
  createdAt: string;
  slaTarget: string;
  status: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export function getTicketSlaMetrics(ticket: SlaTicket, now = new Date()) {
  const created = parseTicketDate(ticket.createdAt);
  const finished = ["RESOLVED", "CLOSED"].includes(ticket.status);
  // const completion = ticket.resolvedAt || (ticket.status === "CLOSED" ? ticket.closedAt : null);
  const completion =
    ticket.status === "CLOSED"
      ? ticket.closedAt || ticket.resolvedAt
      : ticket.resolvedAt;
  // Old completed records without history must not continue ageing or imply compliance.
  const end = finished
    ? completion
      ? parseTicketDate(completion)
      : null
    : now;
  const match = ticket.slaTarget
    ?.trim()
    .toLowerCase()
    .match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  const amount = match ? Number(match[1]) : 0;
  const unit = match?.[2] ?? "";
  const working = unit.startsWith("wd") || unit.startsWith("working");
  const targetHours = amount * (working || unit.startsWith("d") ? 24 : 1);
  if (
    !end ||
    !Number.isFinite(created.getTime()) ||
    !Number.isFinite(end.getTime()) ||
    targetHours <= 0
  ) {
    return { ageHours: null, percent: null, breached: false, known: false };
  }
  let elapsed = 0;
  if (working) {
    const offset = 330 * 60000; // Asia/Colombo has no daylight-saving changes.
    const cursor = new Date(created.getTime() + offset);
    const localEnd = new Date(end.getTime() + offset);
    while (cursor < localEnd) {
      const next = new Date(cursor);
      next.setUTCDate(next.getUTCDate() + 1);
      next.setUTCHours(0, 0, 0, 0);
      const segmentEnd = next < localEnd ? next : localEnd;
      if (cursor.getUTCDay() !== 0 && cursor.getUTCDay() !== 6)
        elapsed += segmentEnd.getTime() - cursor.getTime();
      cursor.setTime(next.getTime());
    }
  } else elapsed = end.getTime() - created.getTime();
  const ageHours = Math.max(0, elapsed / 3600000);
  return {
    ageHours,
    percent: Math.round((ageHours / targetHours) * 100),
    breached: ageHours > targetHours,
    known: true,
  };
}
