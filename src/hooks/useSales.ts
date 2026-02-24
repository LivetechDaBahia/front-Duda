import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItem } from "@/types/sales";

export const useSales = () => {
  const {
    data: items,
    isLoading,
    error,
    refetch,
  } = useQuery<SalesElementItem[]>({
    queryKey: ["sales"],
    queryFn: async () => {
      const [credit, stock, shipping, attended] = await Promise.all([
        salesService.getCreditStage(),
        salesService.getStockStage(),
        salesService.getShippingStage(),
        salesService.getAttendedStage(),
      ]);
      return [...credit, ...stock, ...shipping, ...attended];
    },
  });

  return {
    items: items || [],
    isLoading,
    error,
    refetch,
  };
};
