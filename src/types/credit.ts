export interface CreditItemDetails {
  date: Date;
  sellerGroup: string;
  operation: string;
  financial: string;
  offer: string;
  client: string;
  clientBranch: string;
  clientCpfCnpj: string;
  currency: string;
  value: number;
  sellerName: string;
  paymentConditions: string;
  type: string;
}

export interface CreditElementItem {
  id: number;
  flowId: string;
  name: string;
  statusId: string;
  group: string;
  user: string | null;
  key: string;
  entity: string;
  background: string;
  borders: {
    left: string;
    right: string;
  };
  details: CreditItemDetails;
  badges?: CreditBadge[];
}

export interface CreditStatus {
  id: string;
  flowId: string;
  description: string;
  sequence: number;
  destructive: boolean;
}

export interface CreditElementDetails {
  branch: string;
  id: string;
  emissionDate: Date | null;
  value: number;
  message1: string;
  message2: string;
  standardMessage: string;
  shippingType: string;
  shippingCost: number;
}

export interface CreditDocument {
  branch: string;
  entity: string;
  entityId: string;
  docTitle: string;
  docDescription: string;
  docObject: string;
  path: string;
}

export type CreditQuoteDocuments = CreditDocument;
export type CreditClientDocument = CreditDocument;

export interface CreditClientDetails {
  name: string;
  cpfCnpj: string;
  risk: string;
  creditLimit: number;
  dueDate: Date | null;
  secondaryCreditLimit: number;
  billingAddress: string;
  billingAddress2: string;
  district: string;
  state: string;
  zipCode: string;
  foundationDate: Date | null;
  lastPurchase: Date | null;
  firstPurchase: Date | null;
  biggestPurchase: number;
  isSN: boolean;
  comments: string;
}

export interface FinancialHistory {
  status: string;
  branch: string;
  prefix: string;
  number: string;
  parcel: string;
  type: string;
  emission: Date | null;
  dueDate: Date | null;
  realDueDate: Date | null;
  lastPaymentDate: Date | null;
  currency: string;
  value: number;
  balance: number;
  renegotiation: string;
}

export interface CreditLinkedClient {
  id: string;
  branch: string;
  lc: number;
  dueDate: Date | null;
  risk: string;
  currency: number;
}

export interface CreditBadge {
  id: string;
  label: string;
  color?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export interface CreditLog {
  id: string;
  creditId: number;
  action: string;
  description: string;
  detail: string;
  user: string;
  timestamp: Date;
  oldStatus?: string;
  newStatus?: string;
}

export type UICreditStatus = "all" | string;

export interface CreditFilters {
  search: string;
  status: UICreditStatus;
  group: string;
  user: string;
  currency: string;
  type: string;
  dateBegin?: Date;
  dateEnd?: Date;
  valueRange?: [number, number];
  badges?: string[];
  financial?: string;
  operation?: string;
}

export interface UpdateCreditStatusDto {
  status: string;
  oldStatus: string;
  email: string;
  branch: string;
  item: {
    id: string;
    clientId: string;
    sellerName: string;
    sellerId: string;
  };
}

export interface CreditLimit {
  creditLimit: number;
  pendingValue: number;
  approvedItemsValue: number;
  raBalance: number;
  nccBalance: number;
  availableBalance: number;
}
