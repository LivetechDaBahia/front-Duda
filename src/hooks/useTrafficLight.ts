import { useQuery } from "@tanstack/react-query";
import {
  trafficLightService,
  TrafficLightFilters,
} from "@/services/trafficLightService";
import {
  TrafficLightListResponse,
  TrafficLightDetail,
  TrafficLightSummary,
} from "@/types/trafficLight";

interface UseTrafficLightListParams {
  page?: number;
  pageSize?: number;
  filters?: TrafficLightFilters;
  enabled?: boolean;
}

// Transform API response to map numLvts -> lvts
const transformSummary = (
  item: Record<string, unknown>,
): TrafficLightSummary => ({
  id: item.id as number,
  numQuote: item.numQuote as string,
  salesOrderNumber: item.salesOrderNumber as string,
  validityDate: item.validityDate as string,
  startDate: item.startDate as string | null,
  finishedDate: item.finishedDate as string | null,
  canceled08: item.canceled08 as string | undefined,
  lvts: (item.numLvts as string) || (item.lvts as string) || "",
});

export const useTrafficLightList = ({
  page = 1,
  pageSize = 10,
  filters,
  enabled = true,
}: UseTrafficLightListParams = {}) => {
  const query = useQuery<TrafficLightListResponse>({
    queryKey: ["trafficLight", "list", page, pageSize, filters],
    queryFn: async () => {
      const response = await trafficLightService.getList(
        page,
        pageSize,
        filters,
      );
      return {
        ...response,
        data: response.data.map((item) =>
          transformSummary(item as unknown as Record<string, unknown>),
        ),
      };
    },
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
