export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS = {
  WAITING_PREVIOUS_LEVEL: "01",
  PENDING: "02",
  APPROVED: "03",
  BLOCKED: "04",
  APPROVED_OTHER_APPROVER: "05",
  REJECTED: "06",
  REJECTED_BLOCKED_OTHER_APPROVER: "07",
} as const;

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

export interface PurchaseOrder {
  branch: string;
  branchName: string;
  userEmail: string;
  userCode: string;
  approverCode: string;
  name: string;
  count: number;
  interval: {
    start: Date;
    end: Date;
  };
  status: string;
  items: Issue[];
}

export interface Issue {
  document: string;
  type: string;
  supplier: string;
  emission: string;
  level: string;
  statusCode: string;
  statusDescription: string;
  coin: number;
  coinName: string;
  amount: number;
  userLiberation: string;
  userLibName: string;
  currencyRate: number;
  coinSymbol: string;
  coinValue: number;
  releaseValue: number;
  codeGroup: string;
  nameGroup: string;
  observation: string;
}

export interface PurchaseOrderItem {
  id: string;
  orderId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface DetailedPurchaseOrder {
  id: string;
  branch: string;
  createdAt: Date;
  supplierCode: string;
  supplierName: string;
  shortenedSupplierName: string;
  paymentCode: string;
  paymentDescription: string;
  totalValue: number;
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
