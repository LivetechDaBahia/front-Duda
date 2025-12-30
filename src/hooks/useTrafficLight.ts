import { useQuery } from "@tanstack/react-query";
import { trafficLightService } from "@/services/trafficLightService";
import {
  TrafficLightListResponse,
  TrafficLightDetail,
} from "@/types/trafficLight";

interface UseTrafficLightListParams {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}

export const useTrafficLightList = ({
  page = 1,
  pageSize = 10,
  enabled = true,
}: UseTrafficLightListParams = {}) => {
  const query = useQuery<TrafficLightListResponse>({
    queryKey: ["trafficLight", "list", page, pageSize],
    queryFn: () => trafficLightService.getList(page, pageSize),
    enabled,
  });

  return {
    items: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? page,
    pageSize: query.data?.pageSize ?? pageSize,
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
