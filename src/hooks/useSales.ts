import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItem } from "@/types/sales";

/** Fetch all sales items from the unified all-stages endpoint and flatten them */
export const useSales = () => {
  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery<SalesElementItem[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      const groups = await salesService.getAllStages();
      // Flatten grouped items; each stage occurrence becomes its own entry
      const all = groups.flatMap((g) => g.items);
      // Deduplicate by id + stageId to keep one entry per stage
      const map = new Map<string, SalesElementItem>();
      all.forEach((item) => map.set(`${item.id}-${item.stageId}`, item));
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
