import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import type {
  SalesGroupedItem,
  Stage,
  SalesElementItemDetails,
  SalesAssignPayload,
  SalesTrackingEvent,
  SalesOrderDetails,
  DeallocateItemPayload,
  ItemStock,
  ChangeObservationsPayload,
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
    addUIBreadcrumb("assignItem", "salesService", payload as unknown as Record<string, unknown>);
    return apiClient.post("/sales/assign", payload as unknown as Record<string, unknown>);
  },

  async getTracking(orderId: string, orderBranch: string, processId: string): Promise<SalesTrackingEvent[]> {
    addUIBreadcrumb("getTracking", "salesService", { orderId, orderBranch, processId });
    return apiClient.post("/sales/tracking", { orderId, orderBranch, processId });
  },

  async deallocateItem(payload: DeallocateItemPayload): Promise<any> {
    addUIBreadcrumb("deallocateItem", "salesService", payload as unknown as Record<string, unknown>);
    return apiClient.post("/sales/deallocate-item", payload as unknown as Record<string, unknown>);
  },

  async getItemStock(productId: string): Promise<ItemStock[]> {
    addUIBreadcrumb("getItemStock", "salesService", { productId });
    return apiClient.post(`/sales/item-stock/${productId}`);
  },

  async changeObservations(payload: ChangeObservationsPayload): Promise<void> {
    addUIBreadcrumb("changeObservations", "salesService", payload as unknown as Record<string, unknown>);
    return apiClient.post("/sales/change-observations", payload as unknown as Record<string, unknown>);
  },
};
