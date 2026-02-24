export interface SalesElementItem {
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
  date: string | null;
  client: string;
  clientBranch: string;
  sellerGroup: string;
  sellerName: string;
  currency: string;
  value: number;
  type: string;
  oper: string;
  cnpj: string;
  tid: string;
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
