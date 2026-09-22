export const SRI_LANKA_TIME_ZONE = "Asia/Colombo";

export function parseTicketDate(value: string): Date {
  if (!value) {
    return new Date();
  }

  if (value.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(value)) {
    return new Date(value);
  }

  const normalized = value.includes("T") ? value : value.replace(" ", "T");

  return new Date(`${normalized}Z`);
}

export function formatSriLankaDateTime(
  value: string | Date,
  includeSeconds = true,
): string {
  const date = value instanceof Date ? value : parseTicketDate(value);

  return date.toLocaleString("en-GB", {
    timeZone: SRI_LANKA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(includeSeconds && {
      second: "2-digit",
    }),
    hour12: true,
  });
}
