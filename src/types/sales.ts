export interface SalesElementItem {
  groupName: string;
  clientName: string;
  id: number;
  flowId: string;
  stageId: string;
  group: string;
  user: string | null;
  key: string;
  entity: string;
  name: string;
  background: string;
  borders: {
    left: string;
    right: string;
  };
  offer: string;
  date: Date | null;
  client: string;
  clientBranch: string;
  sellerGroup: string;
  sellerName: string;
  currency: string;
  value: number;
  paymentCondition: string;
  contract: string;
  additive: string;
  vip: string;
  type: string;
  oper: string;
  cnpj: string;
  partial: string;
  reinvoice: string;
  tid: string;
  purchaseOrderId: string;
  purchaseOrderBranch: string;
  processId: string;
}

export interface SalesGroupedItem {
  id: number;
  key: string;
  items: SalesElementItem[];
}

export interface ItemTrackingStatus {
  date: string;
  time: string;
  description: string;
}

export interface Stage {
  id: string;
  flowId: string;
  name: string;
  stageSequence: number;
  final: boolean;
}

export interface SalesElementItemDetails {
  branch: string;
  order: string;
  offer: string;
  review: string;
  contract: string;
  additional: string;
  item: string;
  product: string;
  description: string;
  local: string;
  numSold: number;
  numAvailable: number;
  numReserved: number;
  productOrder: string;
  numOp: number;
  purchaseOrder: string;
  numPo: number;
  purchaseRequest: string;
  numSc: number;
  batch: string;
  sequence: string;
  include: string;
  pa1: string;
  pa2: string;
}

export interface SalesFilters {
  search: string;
  status: string;
  type: string;
  seller: string;
  name: string;
  sellerGroup: string;
  salesGroup: string;
}

export interface SalesAssignPayload {
  itemId: string;
  assigneeEmail?: string;
  flowId?: string;
  key?: string;
}

export interface SalesOrderItem {
  item: string;
  product: string;
  description: string;
  qtdVend: number;
  qtdEnt: number;
  process: string;
  statusAss: string;
  modFrete: string;
}

export interface SalesOrderDetails {
  branch: string;
  order: string;
  emissionDate: Date | null;
  totalValue: number;
  shippingType: string;
  shippingValue: number;
  TID: string;
  clientId: string;
  clientBranch: string;
  contractId: string;
  addictive: string;
  type: string;
  oper: string;
  isPartial: boolean;
  isReinvoice: boolean;
  minimumDate: Date | null;
  obsNF: string;
  obsPacking: string;
  obsLogistics: string;
  obsProposal: string;
  items: SalesOrderItem[];
}

export interface DeallocateItemPayload {
  branch: string;
  order: string;
  product: string;
  sequence: string;
  batch: string;
  proposal: string;
}

export interface ItemStock {
  branch: string;
  id: string;
  warehouse: string;
  available: number;
  "30": number;
  "31-60": number;
  "61-90": number;
  "90+": number;
}

export interface ChangeObservationsPayload {
  branch: string;
  order: string;
  obsNF: string;
  obsPacking: string;
  obsLogistics: string;
  obsProposal: string;
  minimumDate: string;
}

export interface ProductAllocationInfo {
  branch: string;
  order: string;
  proposal: string;
  review: string;
  contract: string;
  additional: string;
  item: string;
  local: string;
  amountAvailable: number;
  amountReserved: number;
  amountOp: number;
  amountPo: number;
  amountSc: number;
  productSequence: string;
  purchaseOrder: string;
  batch: string;
  sequence: string;
  include: string;
  PA1: string;
  PA2: string;
}
