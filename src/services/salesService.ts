import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import type {
  SalesGroupedItem,
  Stage,
  SalesElementItemDetails,
  SalesAssignPayload,
  ItemTrackingStatus,
  SalesOrderDetails,
  DeallocateItemPayload,
  ItemStock,
  ChangeObservationsPayload,
  ProductAllocationInfo,
} from "@/types/sales";

export const salesService = {
  async getAllStages(): Promise<SalesGroupedItem[]> {
    addUIBreadcrumb("getAllStages", "salesService");
    return apiClient.get("/sales/all-stages");
  },

  async getStageSequence(): Promise<Stage[]> {
    addUIBreadcrumb("getStageSequence", "salesService");
    return apiClient.get("/sales/stage-sequence");
  },

  async getItemDetails(id: string): Promise<SalesElementItemDetails[]> {
    addUIBreadcrumb("getItemDetails", "salesService", { id });
    return apiClient.get(`/sales/${id}`);
  },

  async getSalesOrderDetails(id: string): Promise<SalesOrderDetails[]> {
    addUIBreadcrumb("getSalesOrderDetails", "salesService", { id });
    return apiClient.get(`/sales/sales-orders/${id}`);
  },

  async assignItem(payload: SalesAssignPayload): Promise<void> {
    addUIBreadcrumb(
      "assignItem",
      "salesService",
      payload as unknown as Record<string, unknown>,
    );
    return apiClient.post(
      "/sales/assign",
      payload as unknown as Record<string, unknown>,
    );
  },

  async getTracking(
    orderId: string,
    orderBranch: string,
    processId: string,
  ): Promise<ItemTrackingStatus[]> {
    addUIBreadcrumb("getTracking", "salesService", {
      orderId,
      orderBranch,
      processId,
    });
    return apiClient.post("/sales/tracking", {
      orderId,
      orderBranch,
      processId,
    });
  },

  async deallocateItem(payload: DeallocateItemPayload): Promise<any> {
    addUIBreadcrumb(
      "deallocateItem",
      "salesService",
      payload as unknown as Record<string, unknown>,
    );
    return apiClient.post(
      "/sales/deallocate-item",
      payload as unknown as Record<string, unknown>,
    );
  },

  async getItemStock(productId: string): Promise<ItemStock[]> {
    addUIBreadcrumb("getItemStock", "salesService", { productId });
    return apiClient.post(`/sales/item-stock/${encodeURIComponent(productId)}`);
  },

  async changeObservations(payload: ChangeObservationsPayload): Promise<void> {
    addUIBreadcrumb(
      "changeObservations",
      "salesService",
      payload as unknown as Record<string, unknown>,
    );
    return apiClient.post(
      "/sales/change-observations",
      payload as unknown as Record<string, unknown>,
    );
  },

  async reallocateItem(payload: DeallocateItemPayload): Promise<any> {
    addUIBreadcrumb(
      "reallocateItem",
      "salesService",
      payload as unknown as Record<string, unknown>,
    );
    return apiClient.post(
      "/sales/reallocate-item",
      payload as unknown as Record<string, unknown>,
    );
  },

  async getProductAllocation(
    productId: string,
  ): Promise<ProductAllocationInfo[]> {
    addUIBreadcrumb("getProductAllocation", "salesService", { productId });
    return apiClient.get(
      `/sales/item-allocation/${encodeURIComponent(productId)}`,
    );
  },
};
