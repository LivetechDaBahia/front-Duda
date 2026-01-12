import type {
  CreditElementItem,
  CreditStatus,
  UICreditStatus,
} from "@/types/credit";

const DEFAULT_BORDER_COLOR = "hsl(120, 100%, 80%)"; // Default green color

/**
 * Parse YYYYMMDD date string to Date object
 */
export const parseYYYYMMDD = (dateStr: string): Date | null => {
  if (!dateStr || dateStr.length !== 8) return null;

  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1; // 0-indexed
  const day = parseInt(dateStr.substring(6, 8));

  const date = new Date(year, month, day);

  // Validate the date is valid
  if (isNaN(date.getTime())) return null;

  return date;
};

/**
 * Parse credit details date coming from the API.
 * We see multiple formats across environments: Date, ISO strings, and YYYYMMDD.
 */
const parseCreditDetailsDate = (raw: unknown): Date | null => {
  if (!raw) return null;

  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }

  if (typeof raw === "number") {
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(raw).trim();
  if (!str) return null;

  // YYYYMMDD (common in some legacy APIs)
  if (/^\d{8}$/.test(str)) {
    return parseYYYYMMDD(str);
  }

  // ISO-ish strings: strip trailing "Z" so it's interpreted as local time (keeps UI consistent)
  const normalized = str.endsWith("Z") ? str.slice(0, -1) : str;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Transform credit elements from API to UI format
 */
export const transformCreditElementsToUI = (
  elements: CreditElementItem[],
): CreditElementItem[] => {
  return elements.map((element) => ({
    ...element,
    details: {
      ...element.details,
      date: parseCreditDetailsDate(element.details?.date),
    },
    // Provide fallbacks if borders are empty
    borders: {
      left: element.borders?.left || DEFAULT_BORDER_COLOR,
      right: element.borders?.right || DEFAULT_BORDER_COLOR,
    },
  }));
};

/**
 * Map UI status filter to API status IDs
 */
export const mapUICreditStatusToAPI = (
  status: UICreditStatus,
  availableStatuses: CreditStatus[],
): string[] => {
  if (status === "all") {
    return availableStatuses.map((s) => s.id);
  }
  return [status];
};

/**
 * Get status by ID
 */
export const getCreditStatusById = (
  statusId: string,
  statuses: CreditStatus[],
): CreditStatus | undefined => {
  return statuses.find((s) => s.id === statusId);
};

/**
 * Sort statuses by sequence
 */
export const sortCreditStatuses = (
  statuses: CreditStatus[],
): CreditStatus[] => {
  return [...statuses].sort((a, b) => a.sequence - b.sequence);
};
