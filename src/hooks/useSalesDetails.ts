import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesElementItemDetails } from "@/types/sales";

export const useSalesDetails = (id: string | null) => {
  const {
    data: details,
    isLoading,
    error,
  } = useQuery<SalesElementItemDetails[]>({
    queryKey: ["salesDetails", id],
    queryFn: async () => {
      return salesService.getItemDetails(id!);
    },
    enabled: !!id,
  });

  return {
    details: details || [],
    isLoading,
    error,
  };
};
