import { PurchaseOrder, OrderStatus } from "@/types/order";
import { createApiClient } from "@/lib/apiClient";

// This will be initialized with the getToken function from AuthContext
let apiClient: ReturnType<typeof createApiClient>;

export const initializeOrderService = (getToken: () => string | null) => {
  apiClient = createApiClient(getToken);
};

export const orderService = {
  // Fetch all orders
  async getOrders(
    email: string,
    dateBegin: string,
    dateEnd: string,
    status: string,
    branch: string,
  ): Promise<PurchaseOrder[]> {
    const params = new URLSearchParams({
      userEmail: email,
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      types: status,
      tenantId: branch,
    });
    return apiClient.get(`/purchaseOrders?${params}`);
  },

  // Fetch a single order by ID
  async getOrderById(orderId: string): Promise<PurchaseOrder> {
    return apiClient.get(`/purchaseOrders/${orderId}`);
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<PurchaseOrder> {
    return apiClient.patch(`/orders/${orderId}/status`, { status });
  },

  // Approve order
  async approveOrder(orderId: string): Promise<PurchaseOrder> {
    return this.updateOrderStatus(orderId, "approved");
  },

  // Decline order
  async declineOrder(orderId: string): Promise<PurchaseOrder> {
    return this.updateOrderStatus(orderId, "declined");
  },

  // Create new order
  async createOrder(order: Omit<PurchaseOrder, "id">): Promise<PurchaseOrder> {
    return apiClient.post("/orders", order);
  },

  // Delete order
  async deleteOrder(orderId: string): Promise<void> {
    return apiClient.delete(`/orders/${orderId}`);
  },
};
