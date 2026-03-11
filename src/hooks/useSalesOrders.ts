import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { SalesOrderDetails } from "@/types/sales";

export const useSalesOrders = (id: string | null) => {
  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery<SalesOrderDetails[]>({
    queryKey: ["salesOrders", id],
    queryFn: () => salesService.getSalesOrderDetails(id!),
    enabled: !!id,
  });

  return {
    orders: orders || [],
    isLoading,
    error,
    refetch,
  };
};
