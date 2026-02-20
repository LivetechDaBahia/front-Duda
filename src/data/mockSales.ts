import type { SalesItem, SalesStatus, SalesItemDetails } from "@/types/sales";

export const mockSalesStatuses: SalesStatus[] = [
  { id: "new", description: "New", sequence: 1 },
  { id: "in_progress", description: "In Progress", sequence: 2 },
  { id: "completed", description: "Completed", sequence: 3 },
  { id: "cancelled", description: "Cancelled", sequence: 4 },
];

export const mockSalesItems: SalesItem[] = [
  { id: "S001", statusId: "new", client: "100234", clientName: "Acme Corp", seller: "001", sellerName: "John Smith", value: 45000, currency: "BRL", date: "2026-02-15", type: "Standard", offer: "01-900100/01", paymentConditions: "30/60/90 days" },
  { id: "S002", statusId: "new", client: "100567", clientName: "Beta Industries", seller: "002", sellerName: "Maria Santos", value: 128000, currency: "USD", date: "2026-02-14", type: "Premium", offer: "01-900101/01", paymentConditions: "Net 30" },
  { id: "S003", statusId: "in_progress", client: "100890", clientName: "Gamma Solutions", seller: "001", sellerName: "John Smith", value: 67500, currency: "BRL", date: "2026-02-12", type: "Standard", offer: "01-900102/01", paymentConditions: "Cash" },
  { id: "S004", statusId: "in_progress", client: "101234", clientName: "Delta Tech", seller: "003", sellerName: "Carlos Oliveira", value: 230000, currency: "BRL", date: "2026-02-10", type: "Enterprise", offer: "01-900103/01", paymentConditions: "60/90/120 days" },
  { id: "S005", statusId: "in_progress", client: "101567", clientName: "Epsilon Ltd", seller: "002", sellerName: "Maria Santos", value: 89000, currency: "EUR", date: "2026-02-08", type: "Standard", offer: "01-900104/01", paymentConditions: "Net 60" },
  { id: "S006", statusId: "completed", client: "101890", clientName: "Zeta Manufacturing", seller: "001", sellerName: "John Smith", value: 156000, currency: "BRL", date: "2026-01-25", type: "Premium", offer: "01-900105/01", paymentConditions: "30/60 days" },
  { id: "S007", statusId: "completed", client: "102234", clientName: "Eta Services", seller: "003", sellerName: "Carlos Oliveira", value: 42000, currency: "BRL", date: "2026-01-20", type: "Standard", offer: "01-900106/01", paymentConditions: "Cash" },
  { id: "S008", statusId: "completed", client: "102567", clientName: "Theta Global", seller: "002", sellerName: "Maria Santos", value: 315000, currency: "USD", date: "2026-01-15", type: "Enterprise", offer: "01-900107/01", paymentConditions: "Net 90" },
  { id: "S009", statusId: "cancelled", client: "102890", clientName: "Iota Partners", seller: "001", sellerName: "John Smith", value: 78000, currency: "BRL", date: "2026-02-01", type: "Standard", offer: "01-900108/01", paymentConditions: "30 days" },
  { id: "S010", statusId: "new", client: "103234", clientName: "Kappa Retail", seller: "003", sellerName: "Carlos Oliveira", value: 195000, currency: "BRL", date: "2026-02-18", type: "Premium", offer: "01-900109/01", paymentConditions: "60/90 days" },
];

export const mockSalesDetails: Record<string, SalesItemDetails> = {
  S001: {
    overview: { client: "100234", clientName: "Acme Corp", seller: "001", sellerName: "John Smith", value: 45000, currency: "BRL", date: "2026-02-15", type: "Standard", offer: "01-900100/01", paymentConditions: "30/60/90 days", observations: "Client requested priority shipping" },
    products: [
      { id: "P1", name: "Steel Beams 10m", quantity: 50, unitPrice: 500, total: 25000 },
      { id: "P2", name: "Concrete Mix 50kg", quantity: 200, unitPrice: 100, total: 20000 },
    ],
    shipping: { address: "Rua das Flores 123", city: "São Paulo", state: "SP", zipCode: "01234-567", method: "Freight", estimatedDelivery: "2026-03-01", trackingCode: "BR123456789" },
  },
  S002: {
    overview: { client: "100567", clientName: "Beta Industries", seller: "002", sellerName: "Maria Santos", value: 128000, currency: "USD", date: "2026-02-14", type: "Premium", offer: "01-900101/01", paymentConditions: "Net 30", observations: "International shipment" },
    products: [
      { id: "P3", name: "Industrial Pump X200", quantity: 4, unitPrice: 20000, total: 80000 },
      { id: "P4", name: "Valve Assembly Kit", quantity: 16, unitPrice: 3000, total: 48000 },
    ],
    shipping: { address: "Industrial Park Lot 45", city: "Miami", state: "FL", zipCode: "33101", method: "Air Freight", estimatedDelivery: "2026-03-10", trackingCode: "US987654321" },
  },
};

// For items without specific details, generate a default
export const getSalesItemDetails = (itemId: string): SalesItemDetails => {
  if (mockSalesDetails[itemId]) return mockSalesDetails[itemId];
  const item = mockSalesItems.find((i) => i.id === itemId);
  if (!item) throw new Error(`Sales item ${itemId} not found`);
  return {
    overview: { ...item, observations: "No additional observations" },
    products: [
      { id: "P-default", name: "Sample Product", quantity: 1, unitPrice: item.value, total: item.value },
    ],
    shipping: { address: "Rua Example 456", city: "São Paulo", state: "SP", zipCode: "04567-890", method: "Standard", estimatedDelivery: "2026-03-15", trackingCode: "—" },
  };
};
