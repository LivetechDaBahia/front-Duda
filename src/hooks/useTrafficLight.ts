import { useQuery } from "@tanstack/react-query";
import { trafficLightService, TrafficLightFilters } from "@/services/trafficLightService";
import {
  TrafficLightListResponse,
  TrafficLightDetail,
} from "@/types/trafficLight";

interface UseTrafficLightListParams {
  page?: number;
  pageSize?: number;
  filters?: TrafficLightFilters;
  enabled?: boolean;
}

export const useTrafficLightList = ({
  page = 1,
  pageSize = 10,
  filters,
  enabled = true,
}: UseTrafficLightListParams = {}) => {
  const query = useQuery<TrafficLightListResponse>({
    queryKey: ["trafficLight", "list", page, pageSize, filters],
    queryFn: () => trafficLightService.getList(page, pageSize, filters),
    enabled,
  });

  return {
    items: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: Number(query.data?.page) || page,
    pageSize: Number(query.data?.pageSize) || pageSize,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

interface UseTrafficLightDetailParams {
  id: number | null;
  enabled?: boolean;
}

export const useTrafficLightDetail = ({
  id,
  enabled = true,
}: UseTrafficLightDetailParams) => {
  const query = useQuery<TrafficLightDetail>({
    queryKey: ["trafficLight", "detail", id],
    queryFn: () => trafficLightService.getDetail(id!),
    enabled: enabled && id !== null,
  });

  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};
