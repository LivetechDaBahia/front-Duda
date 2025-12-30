import { apiClient } from "@/lib/apiClient";
import {
  TrafficLightListResponse,
  TrafficLightDetail,
} from "@/types/trafficLight";

export const trafficLightService = {
  /**
   * Get paginated list of traffic lights
   */
  async getList(
    page: number = 1,
    pageSize: number = 10
  ): Promise<TrafficLightListResponse> {
    return apiClient.get(
      `/sophos/trafficLight?page=${page}&pageSize=${pageSize}`
    );
  },

  /**
   * Get traffic light details by ID
   */
  async getDetail(id: number): Promise<TrafficLightDetail> {
    return apiClient.get(`/sophos/trafficLight/${id}`);
  },
};
