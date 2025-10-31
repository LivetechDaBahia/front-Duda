import { UIOrderStatus, ORDER_STATUS } from "@/types/order";

/**
 * Maps UI status filter to API types parameter (comma-separated status codes)
 */
export const mapUIStatusToAPITypes = (
  status: UIOrderStatus | "all",
): string => {
  if (status === "all") {
    return "01,02,03,05,06,07"; // Removed 04 (BLOCKED)
  }

  switch (status) {
    case "pending":
      return `${ORDER_STATUS.WAITING_PREVIOUS_LEVEL},${ORDER_STATUS.PENDING}`;
    case "approved":
      return `${ORDER_STATUS.APPROVED},${ORDER_STATUS.APPROVED_OTHER_APPROVER}`;
    case "declined":
      return `${ORDER_STATUS.REJECTED},${ORDER_STATUS.REJECTED_BLOCKED_OTHER_APPROVER}`;
    default:
      return "01,02,03,05,06,07";
  }
};

/**
 * Formats Date to YYYY-MM-DD string for API
 */
export const formatDateForAPI = (
  date: Date | undefined,
): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split("T")[0];
};
