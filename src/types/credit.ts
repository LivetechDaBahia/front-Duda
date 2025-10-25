export interface CreditItemDetails {
  offer: string;
  client: string;
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
  legalEntityType: string;
  cgc: string;
  susbcription: string;
  name: string;
  simplification: string;
  billingAddress: string;
  billingAddress2: string;
  district: string;
  state: string;
  zipCode: string;
  risk: string;
  currency: string;
  lc: number;
  lcExpiry: Date | null;
  group: string;
  marketCode: string;
}

export interface FinancialHistory {
  branch: string;
  prefix: string;
  number: string;
  parcel: string;
  type: string;
  emission: Date | null;
  value: number;
  expiration: Date | null;
  posted: Date | null;
}

export interface CreditLinkedClient {
  id: string;
  branch: string;
  lc: number;
  dueDate: Date | null;
  risk: string;
  currency: number;
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
  minValue?: number;
  maxValue?: number;
}
