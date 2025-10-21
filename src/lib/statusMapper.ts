import { UIOrderStatus, ORDER_STATUS } from "@/types/order";

/**
 * Maps UI status filter to API types parameter (comma-separated status codes)
 */
export const mapUIStatusToAPITypes = (status: UIOrderStatus | "all"): string => {
  if (status === "all") {
    return "01,02,03,04,05,06,07";
  }

  switch (status) {
    case "pending":
      return `${ORDER_STATUS.WAITING_PREVIOUS_LEVEL},${ORDER_STATUS.PENDING}`;
    case "approved":
      return ORDER_STATUS.APPROVED;
    case "completed":
      return ORDER_STATUS.APPROVED_OTHER_APPROVER;
    case "declined":
      return `${ORDER_STATUS.REJECTED},${ORDER_STATUS.REJECTED_BLOCKED_OTHER_APPROVER}`;
    case "cancelled":
      return ORDER_STATUS.BLOCKED;
    case "processing":
      // Processing is a UI-only status, map to pending
      return `${ORDER_STATUS.WAITING_PREVIOUS_LEVEL},${ORDER_STATUS.PENDING}`;
    default:
      return "01,02,03,04,05,06,07";
  }
};

/**
 * Formats Date to YYYY-MM-DD string for API
 */
export const formatDateForAPI = (date: Date | undefined): string | undefined => {
  if (!date) return undefined;
  return date.toISOString().split('T')[0];
};
