// lib/sla.ts

/**
 * ---------------------------------------------------------
 * SLA UTILITIES
 * ---------------------------------------------------------
 *
 * Supported SLA formats:
 *
 * 24 Minutes
 * 24 Hours
 * 7 Days
 * 5 Working Days
 * 10 Working Days
 *
 * Working days = Monday to Friday.
 * Saturday and Sunday are skipped.
 */

/**
 * Parse database datetime.
 *
 * Database example:
 * 2026-08-19 16:19
 *
 * JavaScript Date expects:
 * 2026-08-19T16:19
 *
 * We treat the database value as local browser/server time.
 */
export function parseTicketDate(value: string | Date): Date {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return new Date(value);
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  return new Date(normalized);
}

/**
 * ---------------------------------------------------------
 * SLA PARSER
 * ---------------------------------------------------------
 */

export type SlaUnit = "Minutes" | "Hours" | "Days" | "Working Days";

export interface ParsedSla {
  value: number;
  unit: SlaUnit;
}

/**
 * Converts:
 *
 * "24 Hours"
 * "7 Days"
 * "5 Working Days"
 *
 * into a structured object.
 */
export function parseSla(sla?: string): ParsedSla {
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

  switch (unit) {
    case "minutes":
      return {
        value,
        unit: "Minutes",
      };

    case "hours":
      return {
        value,
        unit: "Hours",
      };

    case "days":
      return {
        value,
        unit: "Days",
      };

    case "working days":
      return {
        value,
        unit: "Working Days",
      };

    default:
      return {
        value: 24,
        unit: "Hours",
      };
  }
}

/**
 * ---------------------------------------------------------
 * WORKING DAY HELPERS
 * ---------------------------------------------------------
 */

/**
 * Monday-Friday = working days.
 *
 * Saturday = 6
 * Sunday   = 0
 */
export function isWorkingDay(date: Date): boolean {
  const day = date.getDay();

  return day !== 0 && day !== 6;
}

/**
 * Move a date forward until it reaches a working day.
 */
export function moveToNextWorkingDay(date: Date): Date {
  const result = new Date(date);

  while (!isWorkingDay(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Add calendar days.
 *
 * Example:
 *
 * Wednesday + 7 Days
 * = next Wednesday
 */
export function addCalendarDays(date: Date, days: number): Date {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

/**
 * Add working days.
 *
 * Example:
 *
 * Friday + 1 Working Day
 * = Monday
 *
 * Friday + 2 Working Days
 * = Tuesday
 *
 * Saturday + 1 Working Day
 * = Monday
 *
 * Sunday + 1 Working Day
 * = Monday
 */
export function addWorkingDays(date: Date, workingDays: number): Date {
  let result = new Date(date);

  let remaining = Math.max(0, Math.floor(workingDays));

  /**
   * If created on weekend, SLA starts from
   * the next working day.
   */
  result = moveToNextWorkingDay(result);

  while (remaining > 0) {
    result.setDate(result.getDate() + 1);

    if (isWorkingDay(result)) {
      remaining--;
    }
  }

  return result;
}

/**
 * ---------------------------------------------------------
 * SLA DUE DATE
 * ---------------------------------------------------------
 */

/**
 * Calculate actual SLA due date.
 *
 * Minutes:
 * 24 Minutes
 *
 * Hours:
 * 24 Hours
 *
 * Calendar Days:
 * 7 Days
 *
 * Working Days:
 * 7 Working Days
 */
export function getSlaDueDate(
  createdAt: string | Date,
  slaTarget?: string,
): Date {
  const createdDate = parseTicketDate(createdAt);

  const { value, unit } = parseSla(slaTarget);

  switch (unit) {
    case "Minutes":
      return new Date(createdDate.getTime() + value * 60 * 1000);

    case "Hours":
      return new Date(createdDate.getTime() + value * 60 * 60 * 1000);

    case "Days":
      return addCalendarDays(createdDate, value);

    case "Working Days":
      return addWorkingDays(createdDate, value);

    default:
      return new Date(createdDate.getTime() + 24 * 60 * 60 * 1000);
  }
}

/**
 * ---------------------------------------------------------
 * SLA DURATION
 * ---------------------------------------------------------
 */

/**
 * Returns SLA duration in hours.
 *
 * This is useful for charts/progress calculations.
 *
 * IMPORTANT:
 * Working Days are converted to 24 hours per
 * working day for approximate duration calculations.
 *
 * Actual due dates MUST use getSlaDueDate().
 */
export function getHoursFromSla(sla?: string): number {
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
}

/**
 * ---------------------------------------------------------
 * SLA PROGRESS
 * ---------------------------------------------------------
 */

/**
 * Calculate elapsed SLA percentage.
 *
 * The percentage is based on the actual due date.
 *
 * This means Working Days automatically respect
 * Saturday/Sunday.
 */
export function getSlaPercent(
  createdAt: string | Date,
  slaTarget?: string,
): number {
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
}

/**
 * ---------------------------------------------------------
 * SLA BREACH
 * ---------------------------------------------------------
 */

/**
 * Determine whether an active ticket has
 * breached its SLA.
 */
export function isTicketSlaBreached(ticket: {
  createdAt: string | Date;
  slaTarget?: string;
  status: string;
}): boolean {
  /**
   * Only active tickets can currently breach SLA.
   */
  if (!["OPEN", "IN_PROGRESS"].includes(ticket.status)) {
    return false;
  }

  const dueDate = getSlaDueDate(ticket.createdAt, ticket.slaTarget);

  return Date.now() > dueDate.getTime();
}

/**
 * ---------------------------------------------------------
 * COMPLETE SLA METRICS
 * ---------------------------------------------------------
 *
 * This is the helper I recommend using most often
 * inside TicketHeader and TicketTable.
 */
export function getTicketSlaMetrics(ticket: {
  createdAt: string | Date;
  slaTarget?: string;
  status: string;
}) {
  const createdDate = parseTicketDate(ticket.createdAt);

  const dueDate = getSlaDueDate(ticket.createdAt, ticket.slaTarget);

  const percent = getSlaPercent(ticket.createdAt, ticket.slaTarget);

  const breached = isTicketSlaBreached(ticket);

  const ageHours = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);

  const targetHours = getHoursFromSla(ticket.slaTarget);

  return {
    createdDate,
    dueDate,
    percent,
    breached,
    ageHours,
    targetHours,
  };
}
