import { 
  PurchaseOrderAPI, 
  ApiDetailedOrder,
  ApiApprovalLevelsResponse,
  ApiCostCenterResponse,
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
  async getOrderById(orderId: string): Promise<ApiDetailedOrder> {
    return apiClient.get(`/purchaseOrders/${orderId}`);
  },

  // Fetch approval levels for an order
  async getApprovalLevels(
    orderId: string, 
    branch: string
  ): Promise<ApiApprovalLevelsResponse> {
    return apiClient.get(`/purchaseOrders/approvalLevels/${orderId}/${branch}`);
  },

  // Fetch cost center details for an order
  async getCostCenterDetails(orderId: string): Promise<ApiCostCenterResponse> {
    return apiClient.get(`/purchaseOrders/costCenter/${orderId}`);
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
