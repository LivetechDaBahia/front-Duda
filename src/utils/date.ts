/**
 * Date/locale utility helpers shared across the app.
 */

export type DateInput = Date | string | number | null;

/**
 * Normalize locale strings like "pt-br" or "en-us" to BCP 47 format
 * expected by Intl APIs (e.g., "pt-BR", "en-US").
 */
export function normalizeLocale(loc?: string): string | undefined {
  if (!loc) return undefined;
  const parts = loc.split("-");
  if (parts.length === 1) return parts[0].toLowerCase();
  return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
}

/**
 * Parse a value into a Date without introducing timezone shifts for date-only strings.
 * - Treats ISO date-only strings (YYYY-MM-DD) and values starting with that pattern
 *   (e.g., YYYY-MM-DDT00:00:00.000Z) as local calendar dates (midnight local time).
 * - Returns null for invalid inputs.
 */
export function toDateNoTZShift(value: DateInput): Date | null {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string") {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
      const [_, y, m, d] = dateOnlyMatch;
      const local = new Date(Number(y), Number(m) - 1, Number(d));
      return isNaN(local.getTime()) ? null : local;
    }
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/**
 * Format a date value using the provided UI locale.
 * - Defaults to navigator.language when locale is not provided (in browser environments).
 * - Uses Intl.DateTimeFormat with { dateStyle: "medium" } by default.
 * - Falls back to Date#toLocaleDateString, then to ISO YYYY-MM-DD slice.
 */
export function formatDate(
  value: DateInput,
  loc?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const d = toDateNoTZShift(value);
  if (!d) return "-";
  // Treat sentinel default date 1900-01-01 as empty
  if (d.getFullYear() === 1900 && d.getMonth() === 0 && d.getDate() === 1) {
    return "-";
  }
  // Prefer provided locale, otherwise browser locale (when available)
  const resolvedLocale = normalizeLocale(
    loc || (typeof navigator !== "undefined" ? navigator.language : undefined)
  );
  try {
    return new Intl.DateTimeFormat(resolvedLocale, options).format(d);
  } catch {
    try {
      return d.toLocaleDateString(resolvedLocale);
    } catch {
      return d.toISOString().slice(0, 10);
    }
  }
}
