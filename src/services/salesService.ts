import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import type {
  SalesGroupedItem,
  SalesGroupedItem,
  Stage,
  SalesElementItemDetails,
  SalesAssignPayload,
  SalesTrackingEvent,
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

  async assignItem(payload: SalesAssignPayload): Promise<void> {
    addUIBreadcrumb("assignItem", "salesService", payload as unknown as Record<string, unknown>);
    return apiClient.post("/sales/assign", payload as unknown as Record<string, unknown>);
  },

  async getTracking(orderId: string, orderBranch: string, processId: string): Promise<SalesTrackingEvent[]> {
    addUIBreadcrumb("getTracking", "salesService", { orderId, orderBranch, processId });
    return apiClient.post("/sales/tracking", { orderId, orderBranch, processId });
  },
};
