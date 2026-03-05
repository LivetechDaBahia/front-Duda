import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItem } from "@/types/sales";

/** Fetch items from all stage endpoints and tag each with its stage id */
const STAGE_FETCHERS: { stageKey: string; fetcher: () => Promise<SalesElementItem[]> }[] = [
  { stageKey: "credit", fetcher: () => salesService.getCreditStage() },
  { stageKey: "stock", fetcher: () => salesService.getStockStage() },
  { stageKey: "shipping", fetcher: () => salesService.getShippingStage() },
  { stageKey: "attended", fetcher: () => salesService.getAttendedStage() },
];

export const useSales = () => {
  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery<SalesElementItem[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      const results = await Promise.all(
        STAGE_FETCHERS.map(async ({ stageKey, fetcher }) => {
          const data = await fetcher();
          return data.map((item) => ({ ...item, _stageId: stageKey }));
        }),
      );
      return results.flat();
    },
  });

  return {
    items: items || [],
    isLoading,
    error,
    refetch,
  };
};
