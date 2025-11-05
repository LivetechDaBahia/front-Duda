// API OrderStatus (from backend)
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS = {
  WAITING_PREVIOUS_LEVEL: "01",
  PENDING: "02",
  APPROVED: "03",
  // BLOCKED: "04", // Removed - no longer used in UI
  APPROVED_OTHER_APPROVER: "05",
  REJECTED: "06",
  REJECTED_BLOCKED_OTHER_APPROVER: "07",
} as const;

// UI OrderStatus (for components) - Simplified to 3 statuses
export type UIOrderStatus = "pending" | "approved" | "declined";

export const isPendingStatus = (status: OrderStatus | string): boolean => {
  // Handle string status values from Order.status
  if (status === "pending") {
    return true;
  }
  // Handle ApprovalStatusType values
  return (
    status === ORDER_STATUS.WAITING_PREVIOUS_LEVEL ||
    status === ORDER_STATUS.PENDING
  );
};

// Backend PurchaseOrder structure (from API)
export interface PurchaseOrderAPI {
  branch: string;
  branchName: string;
  userEmail: string;
  userCode: string;
  approverCode: string;
  name: string;
  count: number;
  interval: {
    start: string | Date;
    end: string | Date;
  };
  status: string;
  items: Issue[];
}

// Approve/Reject DTOs
export interface ApprovePurchaseOrderDto {
  orderId: string;
  type: string;
  approvalUserCode: string;
  systemUserCode: string;
  email: string;
  reversion?: boolean;
}

export interface RejectPurchaseOrderDto {
  orderId: string;
  type: string;
  approvalUserCode: string;
  systemUserCode: string;
  email: string;
  reason: string;
}

export interface ApprovalActionResponse {
  code: number;
  status: string;
  message: string;
  detail: string;
  date: Date;
}

// Branch structure
export interface Branch {
  id: string;
  name: string;
  code: string;
  country: string;
}

// UI PurchaseOrder structure (for components and mock data)
export interface PurchaseOrder {
  id: string;
  supplierName: string;
  supplierEmail: string;
  value: number;
  coinSymbol: string;
  status: UIOrderStatus;
  statusCode?: string; // Original API status code
  items: number;
  createdAt: string;
  dueDate: string;
  description: string;
  branch: string;
  needsApproval?: boolean;
}

// Unified type for pending items (can be purchase order or credit)
export type PendingItemType = "purchase_order" | "credit";

export interface PendingItem {
  id: string;
  type: PendingItemType;
  title: string;
  supplierOrClient: string;
  value: number;
  coinSymbol: string;
  createdAt: string;
  description: string;
  status: string;
  branch?: string;
  needsApproval: boolean;
  // Store original data for detail panel
  originalData: PurchaseOrder | any; // 'any' for credit items
}

export interface Issue {
  Document: string;
  Type: string;
  Supplier: string;
  Emission: string;
  Level: string;
  StatusCode: string;
  StatusDescription: string;
  Coin: number;
  CoinName: string;
  Amount: number;
  UserLiberation: string;
  UserLibName: string;
  CurrencyRate: number;
  CoinSymbol: string;
  CoinValue: number;
  ReleaseValue: number;
  CodeGroup: string;
  NameGroup: string;
  Observation: string;
}

// Extended PurchaseOrderItem for UI (matches Issue structure)
export interface PurchaseOrderItem extends Issue {
  id: string;
  status: UIOrderStatus;
  dueDate: string;
  items: number;
}

// API Response for GET /purchaseOrders/:id
export interface ApiDetailedOrder {
  branch: string;
  orderNumber: string;
  dateOfCreate: string;
  supplierCode: string;
  supplierBranch: string;
  supplierName: string;
  shortenedName: string;
  paymentCode: string;
  paymentDescription: string;
  totalValue: number;
  coinSymbol: string;
  buyerCode: string;
  buyerName: string;
  itens: ApiProduct[];
}

export interface ApiProduct {
  item: string;
  productCode: string;
  productDescription: string;
  partNumber: string;
  unit: string;
  amount: number;
  unitPrice: number;
  totalPrice: number;
  costCenter: string;
  Accounting: string;
}

// API Response for GET /purchaseOrders/approvalLevels/:id/:branch
export interface ApiApprovalLevelsResponse {
  levels: ApiApprovalLevel[];
}

export interface ApiApprovalLevel {
  role: string;
  date: string | null;
  level: number;
  status: string;
}

// API Response for GET /purchaseOrders/costCenter/:id
export interface ApiCostCenterResponse {
  costCenters: ApiCostCenter[];
}

export interface ApiCostCenter {
  id: string;
  description: string;
  totalValue: number;
  percentage: number;
}

export interface DetailedPurchaseOrder {
  id: string;
  branch: string;
  createdAt: Date;
  supplierCode: string;
  supplierBranch: string;
  supplierName: string;
  shortenedSupplierName: string;
  paymentCode: string;
  paymentDescription: string;
  totalValue: number;
  coinSymbol: string;
  buyerCode: string;
  buyerName: string;
  items: Product[];
}

export interface Product {
  item: string;
  id: string;
  description: string;
  partNumber: string;
  unit: string;
  amount: number;
  unitValue: number;
  totalValue: number;
  costCenter: string;
  accountingCode: string;
}

export interface ApprovalLevel {
  role: string;
  date: Date | null;
  level: number;
  status: string;
  statusDescription?: string;
}

export interface CostCenter {
  id: string;
  description: string;
  totalValue: number;
  percentage: number;
}

// Helper function to check if order is locked (waiting previous level)
export const isOrderLocked = (order: PurchaseOrder): boolean => {
  return order.statusCode === ORDER_STATUS.WAITING_PREVIOUS_LEVEL;
};
