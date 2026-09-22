export const SRI_LANKA_TIME_ZONE = "Asia/Colombo";

export function parseTicketDate(value: string | Date): Date {
  if (!value) {
    return new Date();
  }

  // Already a JavaScript Date
  if (value instanceof Date) {
    return value;
  }

  const normalizedValue = String(value).trim();

  // ISO timestamp already containing timezone information
  if (
    normalizedValue.endsWith("Z") ||
    /[+-]\d{2}:\d{2}$/.test(normalizedValue)
  ) {
    return new Date(normalizedValue);
  }

  // Legacy DB/API timestamp without timezone.
  // Database timestamps represent UTC.
  const normalized = normalizedValue.includes("T")
    ? normalizedValue
    : normalizedValue.replace(" ", "T");

  return new Date(`${normalized}Z`);
}

export function formatSriLankaDateTime(
  value: string | Date,
  includeSeconds = true,
): string {
  const date = parseTicketDate(value);

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: SRI_LANKA_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(includeSeconds
      ? {
          second: "2-digit",
        }
      : {}),
    hour12: true,
  }).format(date);
}
