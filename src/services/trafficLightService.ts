import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import {
  TrafficLightListResponse,
  TrafficLightDetail,
} from "@/types/trafficLight";

export interface TrafficLightFilters {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const trafficLightService = {
  /**
   * Get paginated list of traffic lights with optional filters
   */
  async getList(
    page: number = 1,
    pageSize: number = 10,
    filters?: TrafficLightFilters
  ): Promise<TrafficLightListResponse> {
    addUIBreadcrumb("getList", "trafficLightService", { page, pageSize, ...filters });
    
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("pageSize", String(pageSize));

    if (filters?.search) {
      params.append("search", filters.search);
    }
    if (filters?.status && filters.status !== "all") {
      params.append("status", filters.status);
    }
    if (filters?.dateFrom) {
      params.append("dateFrom", filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append("dateTo", filters.dateTo);
    }

    return apiClient.get(`/sophos/trafficLight?${params.toString()}`);
  },

  /**
   * Get traffic light details by ID
   */
  async getDetail(id: number): Promise<TrafficLightDetail> {
    addUIBreadcrumb("getDetail", "trafficLightService", { id });
    return apiClient.get(`/sophos/trafficLight/${id}`);
  },
};
