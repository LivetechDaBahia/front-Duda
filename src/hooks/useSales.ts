import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItem } from "@/types/sales";

/** Fetch all sales items from the unified all-stages endpoint and flatten them */
export const useSales = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<{ items: SalesElementItem[]; variationsMap: Map<string, SalesElementItem[]> }>({
    queryKey: ["sales"],
    queryFn: async () => {
      const groups = await salesService.getAllStages();

      // Build a map of id+key → all stage occurrences (variations)
      const variationsMap = new Map<string, SalesElementItem[]>();
      groups.forEach((g) => {
        const groupKey = `${g.id}-${g.key}`;
        variationsMap.set(groupKey, g.items);
      });

      // Flatten grouped items; each stage occurrence becomes its own entry
      const all = groups.flatMap((g) => g.items);
      // Deduplicate by id + stageId to keep one entry per stage
      const map = new Map<string, SalesElementItem>();
      all.forEach((item) => map.set(`${item.id}-${item.stageId}`, item));

      return {
        items: Array.from(map.values()),
        variationsMap,
      };
    },
  });

  return {
    items: data?.items || [],
    variationsMap: data?.variationsMap || new Map<string, SalesElementItem[]>(),
    isLoading,
    error,
    refetch,
  };
};
