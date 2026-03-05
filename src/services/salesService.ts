import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import type {
  SalesElementItem,
  Stage,
  SalesElementItemDetails,
  SalesAssignPayload,
} from "@/types/sales";

export const salesService = {
  async getCreditStage(): Promise<SalesElementItem[]> {
    addUIBreadcrumb("getCreditStage", "salesService");
    return apiClient.get("/sales/credit-stage");
  },

  async getStockStage(): Promise<SalesElementItem[]> {
    addUIBreadcrumb("getStockStage", "salesService");
    return apiClient.get("/sales/stock-stage");
  },

  async getShippingStage(): Promise<SalesElementItem[]> {
    addUIBreadcrumb("getShippingStage", "salesService");
    return apiClient.get("/sales/shipping-stage");
  },

  async getAttendedStage(): Promise<SalesElementItem[]> {
    addUIBreadcrumb("getAttendedStage", "salesService");
    return apiClient.get("/sales/attended-stage");
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
    addUIBreadcrumb("assignItem", "salesService", payload);
    return apiClient.post("/sales/assign", payload);
  },
};
