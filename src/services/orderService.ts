import { 
  PurchaseOrderAPI, 
  DetailedPurchaseOrder,
  ApprovePurchaseOrderDto,
  RejectPurchaseOrderDto,
  ApprovalActionResponse
} from "@/types/order";
import { apiClient } from "@/lib/apiClient";

export const orderService = {
  // Fetch all orders - seeds approval cache for approve/reject
  async getOrders(
    email: string,
    dateBegin: string,
    dateEnd: string,
    types: string = "01,02,03,04,05,06,07",
    tenantId: string = "01",
  ): Promise<PurchaseOrderAPI> {
    const params = new URLSearchParams({
      userEmail: email,
      dateBegin: dateBegin,
      dateEnd: dateEnd,
      types: types,
      tenantId: tenantId,
    });
    return apiClient.get(`/purchaseOrders?${params}`);
  },

  // Fetch a single order by ID
  async getOrderById(orderId: string): Promise<DetailedPurchaseOrder> {
    return apiClient.get(`/purchaseOrders/${orderId}`);
  },

  // Approve order
  async approveOrder(dto: ApprovePurchaseOrderDto): Promise<ApprovalActionResponse> {
    return apiClient.post("/purchaseOrders/approve", dto);
  },

  // Reject order
  async rejectOrder(dto: RejectPurchaseOrderDto): Promise<ApprovalActionResponse> {
    return apiClient.post("/purchaseOrders/reject", dto);
  },

  // Create new order
  async createOrder(order: any): Promise<any> {
    return apiClient.post("/purchaseOrders", order);
  },
};
