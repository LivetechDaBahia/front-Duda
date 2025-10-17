import { PurchaseOrder, OrderStatus } from "@/types/order";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const orderService = {
  // Fetch all orders
  async getOrders(
    email: string,
    dateBegin: string,
    dateEnd: string,
    status: string,
    branch: string,
  ): Promise<PurchaseOrder[]> {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      userEmail: email,
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      types: status,
      tenantId: branch,
    });
    const response = await fetch(`${API_BASE_URL}/purchaseOrders?$?${params}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }
    return response.json();
  },

  // Fetch a single order by ID
  async getOrderById(orderId: string): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/purchaseOrders/${orderId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch order ${orderId}`);
    }
    return response.json();
  },

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<PurchaseOrder> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error(`Failed to update order ${orderId} status`);
    }
    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      throw new Error("Failed to create order");
    }
    return response.json();
  },

  // Delete order
  async deleteOrder(orderId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete order ${orderId}`);
    }
  },
};
