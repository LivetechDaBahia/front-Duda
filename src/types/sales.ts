export interface SalesItem {
  id: string;
  statusId: string;
  client: string;
  clientName: string;
  seller: string;
  sellerName: string;
  value: number;
  currency: string;
  date: string;
  type: string;
  offer: string;
  paymentConditions: string;
}

export interface SalesStatus {
  id: string;
  description: string;
  sequence: number;
}

export interface SalesItemDetails {
  overview: {
    client: string;
    clientName: string;
    seller: string;
    sellerName: string;
    value: number;
    currency: string;
    date: string;
    type: string;
    offer: string;
    paymentConditions: string;
    observations: string;
  };
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  shipping: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    method: string;
    estimatedDelivery: string;
    trackingCode: string;
  };
}

export interface SalesFilters {
  search: string;
  status: string;
  type: string;
  seller: string;
}
