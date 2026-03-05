import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItem } from "@/types/sales";

/** Fetch items from all stage endpoints and merge them (deduplicating by id) */
const STAGE_FETCHERS = [
  () => salesService.getCreditStage(),
  () => salesService.getStockStage(),
  () => salesService.getShippingStage(),
  () => salesService.getAttendedStage(),
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
      const results = await Promise.all(STAGE_FETCHERS.map((fn) => fn()));
      const all = results.flat();
      // Deduplicate by id in case an item appears in multiple endpoints
      const map = new Map<number, SalesElementItem>();
      all.forEach((item) => map.set(item.id, item));
      return Array.from(map.values());
    },
  });

  return {
    items: items || [],
    isLoading,
    error,
    refetch,
  };
};
