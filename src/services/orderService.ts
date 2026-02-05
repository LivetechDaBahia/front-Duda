import {
  PurchaseOrderAPI,
  ApiDetailedOrder,
  ApiApprovalLevelsResponse,
  ApiCostCenter,
  ApprovePurchaseOrderDto,
  RejectPurchaseOrderDto,
  ApprovalActionResponse,
  Branch,
  BranchIndicators,
} from "@/types/order";
import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";

const isDev = (import.meta as any).env?.DEV;

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
    const url = `/purchaseOrders?${params}`;

    addUIBreadcrumb("getOrders", "orderService", { dateBegin, dateEnd, types });

    if (isDev) {
      console.log("[orderService] getOrders", {
        url,
        email,
        dateBegin,
        dateEnd,
        types,
        tenantId,
      });
    }
    return apiClient.get(url);
  },

  // Fetch a single order by ID
  async getOrderById(
    orderId: string,
    branch: string,
  ): Promise<ApiDetailedOrder> {
    const branchId = `01,${branch}`;
    const url = `/purchaseOrders/${orderId}/${branchId}`;

    addUIBreadcrumb("getOrderById", "orderService", { orderId, branch });

    if (isDev) {
      console.log("[orderService] getOrderById", {
        orderId,
        inputBranch: branch,
        branchId,
        url,
      });
    }
    return apiClient.get(url);
  },

  // Fetch approval levels for an order
  async getApprovalLevels(
    orderId: string,
    branch: string,
  ): Promise<ApiApprovalLevelsResponse> {
    const url = `/purchaseOrders/approvalLevels/${orderId}/${branch}`;

    addUIBreadcrumb("getApprovalLevels", "orderService", { orderId, branch });

    if (isDev) {
      console.log("[orderService] getApprovalLevels", { url, orderId, branch });
    }
    const res: any = await apiClient.get(url);

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
  async getCostCenterDetails(
    orderId: string,
    branch: string,
  ): Promise<ApiCostCenter[]> {
    const url = `/purchaseOrders/costCenter/${orderId}/${branch}`;

    addUIBreadcrumb("getCostCenterDetails", "orderService", {
      orderId,
      branch,
    });

    if (isDev) {
      console.log("[orderService] getCostCenterDetails", {
        url,
        orderId,
        branch,
      });
    }
    return apiClient.get(url);
  },

  // Approve order
  async approveOrder(
    dto: ApprovePurchaseOrderDto,
  ): Promise<ApprovalActionResponse> {
    addUIBreadcrumb("approveOrder", "orderService", {
      orderId: dto.orderId,
      branch: dto.branch,
    });

    if (isDev) {
      console.log("[orderService] approveOrder", { dto });
    }
    return apiClient.post("/purchaseOrders/approve", dto);
  },

  // Reject order
  async rejectOrder(
    dto: RejectPurchaseOrderDto,
  ): Promise<ApprovalActionResponse> {
    addUIBreadcrumb("rejectOrder", "orderService", {
      orderId: dto.orderId,
      branch: dto.branch,
    });

    if (isDev) {
      console.log("[orderService] rejectOrder", { dto });
    }
    return apiClient.post("/purchaseOrders/reject", dto);
  },

  // Revert order (undo approval/rejection)
  async revertOrder(
    dto: ApprovePurchaseOrderDto,
  ): Promise<ApprovalActionResponse> {
    const finalDto = { ...dto, reversion: true } as ApprovePurchaseOrderDto & {
      reversion: true;
    };

    addUIBreadcrumb("revertOrder", "orderService", {
      orderId: dto.orderId,
      branch: dto.branch,
    });

    if (isDev) {
      console.log("[orderService] revertOrder", { inDto: dto, finalDto });
    }
    return apiClient.post("/purchaseOrders/approve", finalDto);
  },

  // Fetch branches
  async getBranches(): Promise<Branch[]> {
    const url = "/purchaseOrders/branches";

    addUIBreadcrumb("getBranches", "orderService");

    if (isDev) {
      console.log("[orderService] getBranches", { url });
    }
    return apiClient.get(url);
  },

  // Fetch indicators for dashboard
  async getIndicators(
    userEmail: string,
    dateBegin: string,
    dateEnd: string,
    types: string = "01,02",
  ): Promise<BranchIndicators[]> {
    const params = new URLSearchParams({
      userEmail,
      dateBegin,
      dateEnd,
      types,
    });
    const url = `/purchaseOrders/indicators?${params}`;

    addUIBreadcrumb("getIndicators", "orderService", {
      dateBegin,
      dateEnd,
      types,
    });

    if (isDev) {
      console.log("[orderService] getIndicators", {
        url,
        userEmail,
        dateBegin,
        dateEnd,
        types,
      });
    }
    return apiClient.get(url);
  },
};
