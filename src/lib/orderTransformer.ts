import { PurchaseOrderAPI, PurchaseOrder, Issue, UIOrderStatus } from "@/types/order";

// Map API status codes to UI status
export const mapStatusToUI = (statusCode: string): UIOrderStatus => {
  switch (statusCode) {
    case "01": // WAITING_PREVIOUS_LEVEL
    case "02": // PENDING
      return "pending";
    case "03": // APPROVED
      return "approved";
    case "04": // BLOCKED
      return "cancelled";
    case "05": // APPROVED_OTHER_APPROVER
      return "completed";
    case "06": // REJECTED
    case "07": // REJECTED_BLOCKED_OTHER_APPROVER
      return "declined";
    default:
      return "pending";
  }
};

// Transform API Issue to UI PurchaseOrder
export const transformIssueToOrder = (issue: Issue, branch: string): PurchaseOrder => {
  const uiStatus = mapStatusToUI(issue.statusCode);
  
  return {
    id: issue.document,
    supplierName: issue.supplier,
    supplierEmail: "", // Not provided by API
    value: issue.releaseValue || issue.coinValue,
    status: uiStatus,
    items: 1, // Each issue is one item
    createdAt: issue.emission,
    dueDate: issue.emission, // Use emission as dueDate since it's not provided
    description: issue.observation || `${issue.type} - ${issue.statusDescription}`,
    branch: branch,
    needsApproval: issue.statusCode === "01" || issue.statusCode === "02",
  };
};

// Transform API PurchaseOrderAPI to array of UI PurchaseOrder
export const transformAPIToUIOrders = (apiData: PurchaseOrderAPI): PurchaseOrder[] => {
  if (!apiData || !apiData.items || apiData.items.length === 0) {
    return [];
  }

  return apiData.items.map(issue => transformIssueToOrder(issue, apiData.branch));
};
