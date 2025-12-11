import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { OrderIndicators } from "@/types/order";

export const useOrderIndicators = () => {
  const { user } = useAuth();
  const { canManagePurchaseOrders } = usePermissions();

  // Default date range: last 15 days (matching purchase orders page behavior)
  const today = new Date();
  const fifteenDaysAgo = subDays(today, 15);
  const dateBegin = format(fifteenDaysAgo, "yyyy-MM-dd");
  const dateEnd = format(today, "yyyy-MM-dd");

  const {
    data: indicators,
    isLoading,
    error,
  } = useQuery<OrderIndicators>({
    queryKey: ["orderIndicators", user?.email, dateBegin, dateEnd],
    queryFn: () =>
      orderService.getIndicators(user?.email || "", dateBegin, dateEnd),
    enabled: canManagePurchaseOrders && !!user?.email,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    indicators,
    isLoading: canManagePurchaseOrders ? isLoading : false,
    error,
    enabled: canManagePurchaseOrders,
  };
};
