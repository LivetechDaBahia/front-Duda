export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'approved' | 'declined';

export interface PurchaseOrder {
  id: string;
  clientName: string;
  clientEmail: string;
  value: number;
  status: OrderStatus;
  items: number;
  createdAt: string;
  dueDate: string;
  description: string;
  shippingAddress: string;
  billingAddress: string;
  needsApproval?: boolean;
}
