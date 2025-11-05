import {
  PurchaseOrderAPI,
  ApiDetailedOrder,
  ApiApprovalLevelsResponse,
  ApiCostCenter,
  ApprovePurchaseOrderDto,
  RejectPurchaseOrderDto,
  ApprovalActionResponse,
  Branch,
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
    branch: string,
  ): Promise<ApiApprovalLevelsResponse> {
    const res: any = await apiClient.get(
      `/purchaseOrders/approvalLevels/${orderId}/${branch}`,
    );

    // Handle both possible API shapes:
    // 1) New shape (array)
    // 2) Legacy shape ({ levels: [...] })
    if (Array.isArray(res)) {
      return { levels: res };
    }
    if (res && Array.isArray((res as any).levels)) {
      return res as ApiApprovalLevelsResponse;
    }

    // Fallback: ensure a consistent return type
    return { levels: [] };
  },

  // Fetch cost center details for an order
  async getCostCenterDetails(orderId: string, branch: string): Promise<ApiCostCenter[]> {
    return apiClient.get(`/purchaseOrders/costCenter/${orderId}/${branch}`);
  },

  // Approve order
  async approveOrder(
    dto: ApprovePurchaseOrderDto,
  ): Promise<ApprovalActionResponse> {
    return apiClient.post("/purchaseOrders/approve", dto);
  },

  // Reject order
  async rejectOrder(
    dto: RejectPurchaseOrderDto,
  ): Promise<ApprovalActionResponse> {
    return apiClient.post("/purchaseOrders/reject", dto);
  },

  // Revert order (undo approval/rejection)
  async revertOrder(
    dto: ApprovePurchaseOrderDto,
  ): Promise<ApprovalActionResponse> {
    return apiClient.post("/purchaseOrders/approve", {
      ...dto,
      reversion: true, // Flag to indicate reversion
    });
  },


  // Fetch branches
  async getBranches(): Promise<Branch[]> {
    return apiClient.get("/purchaseOrders/branches");
  },
};
