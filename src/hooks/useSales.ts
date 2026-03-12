import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItem } from "@/types/sales";

/** Fetch all sales items from the unified all-stages endpoint and flatten them.
 *  Each item is kept individually (no dedup) so cards with different PO/process show separately.
 *  variationsMap groups all occurrences of the same id+key for the detail panel. */
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

      // Flatten all items — no deduplication so each PO/process combo is its own card
      const items = groups.flatMap((g) => g.items);

      return {
        items,
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
