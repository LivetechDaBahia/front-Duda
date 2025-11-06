import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date as DD/MM/YYYY
export function formatDateDDMMYYYY(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  // Treat sentinel default date 01/01/1900 as empty
  if (d.getFullYear() === 1900 && d.getMonth() === 0 && d.getDate() === 1) {
    return "-";
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// Locale/date helpers (shared)
export function normalizeLocale(loc?: string): string | undefined {
  if (!loc) return undefined;
  const parts = loc.split("-");
  if (parts.length === 1) return parts[0].toLowerCase();
  return `${parts[0].toLowerCase()}-${parts[1].toUpperCase()}`;
}

export function toDateNoTZShift(value: Date | string | number | null): Date | null {
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

export function formatDate(
  value: Date | string | number | null,
  loc?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const d = toDateNoTZShift(value);
  if (!d) return "-";
  // Treat sentinel default date 1900-01-01 as empty
  if (d.getFullYear() === 1900 && d.getMonth() === 0 && d.getDate() === 1) {
    return "-";
  }
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
