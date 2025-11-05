import {
  PurchaseOrderAPI,
  PurchaseOrder,
  Issue,
  UIOrderStatus,
} from "@/types/order";

// Convert Brazilian date format (dd/MM/yyyy) to ISO format (yyyy-MM-dd)
const convertBrazilianDateToISO = (dateStr: string): string => {
  if (!dateStr) return new Date().toISOString().split("T")[0];

  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date().toISOString().split("T")[0];

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Map API status codes to UI status
export const mapStatusToUI = (statusCode: string): UIOrderStatus => {
  switch (statusCode) {
    case "01": // WAITING_PREVIOUS_LEVEL
    case "02": // PENDING
      return "pending";
    case "03": // APPROVED
    case "05": // APPROVED_OTHER_APPROVER
      return "approved";
    case "06": // REJECTED
    case "07": // REJECTED_BLOCKED_OTHER_APPROVER
      return "declined";
    default:
      return "pending";
  }
};

// Transform API Issue to UI PurchaseOrder
export const transformIssueToOrder = (
  issue: Issue,
  branch: string,
): PurchaseOrder => {
  const uiStatus = mapStatusToUI(issue.StatusCode);
  const emissionDate = convertBrazilianDateToISO(issue.Emission);

  return {
    id: issue.Document,
    supplierName: issue.Supplier || "Unknown Supplier",
    supplierEmail: "", // Not provided by API
    amount: issue.Amount,
    value: issue.ReleaseValue || issue.CoinValue || 0,
    coinSymbol: issue.CoinSymbol || "$",
    status: uiStatus,
    statusCode: issue.StatusCode, // Preserve original status code
    items: 1, // Each issue is one item
    createdAt: emissionDate,
    dueDate: emissionDate, // Use emission as dueDate since it's not provided
    description:
      issue.Observation ||
      `${issue.Type || "Order"} - ${issue.StatusDescription || ""}`,
    branch: branch,
    needsApproval: issue.StatusCode === "01" || issue.StatusCode === "02",
  };
};

// Transform API PurchaseOrderAPI to array of UI PurchaseOrder
export const transformAPIToUIOrders = (
  apiData: PurchaseOrderAPI,
): PurchaseOrder[] => {
  if (!apiData || !apiData.items || apiData.items.length === 0) {
    return [];
  }

  return apiData.items.map((issue) =>
    transformIssueToOrder(issue, apiData.branch),
  );
};
