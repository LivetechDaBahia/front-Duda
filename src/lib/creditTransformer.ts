import type {
  CreditElementItem,
  CreditStatus,
  UICreditStatus,
} from "@/types/credit";

const CREDIT_ELEMENT_COLOR_MAP = {
  AMARELO: "#fafa84",
  VERDE: "#98ff98",
  VERMELHO: "#ff6c6c",
} as const;

/**
 * Maps color name from API to hex color
 */
export const mapCreditColor = (colorName: string): string => {
  if (!colorName || colorName.trim() === "") {
    return "#98ff98"; // Default to VERDE color if no color provided
  }
  const normalized = colorName.trim().toUpperCase();
  return (
    CREDIT_ELEMENT_COLOR_MAP[
      normalized as keyof typeof CREDIT_ELEMENT_COLOR_MAP
    ] || colorName.trim()
  );
};

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
 * Transform credit elements from API to UI format
 */
export const transformCreditElementsToUI = (
  elements: CreditElementItem[],
): CreditElementItem[] => {
  return elements.map((element) => ({
    ...element,
    color: mapCreditColor(element.color),
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
