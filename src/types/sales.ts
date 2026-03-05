export interface SalesElementItem {
  id: number;
  offer: string;
  date: string | null;
  client: string;
  clientBranch: string;
  cnpj: string;
  currency: string;
  value: number;
  paymentCondition: string;
  contract: string;
  additive: string;
  vip: string;
  type: string;
  oper: string;
  partial: string;
  reinvoice: string;
  tid: string;
  sellerName: string;
  sellerGroup: string;
  /** Assigned at fetch time based on which endpoint returned the item */
  _stageId?: string;
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
  minDate: string;
  nf: string;
  shippingObservations: string;
  logisticsObservations: string;
  offerObservations: string;
}

export interface SalesFilters {
  search: string;
  status: string;
  type: string;
  seller: string;
}
