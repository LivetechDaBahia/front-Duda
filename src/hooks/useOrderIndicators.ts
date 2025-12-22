import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { BranchIndicators, OrderIndicators } from "@/types/order";

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
    queryFn: async () => {
      const branchData: BranchIndicators[] = await orderService.getIndicators(
        user?.email || "",
        dateBegin,
        dateEnd,
      );

      // Sum totals across all branches
      return branchData.reduce(
        (acc, branch) => ({
          pendingItems: acc.pendingItems + branch.pendingItems,
          urgentItems: acc.urgentItems + branch.urgentItems,
          totalValueBRL: acc.totalValueBRL + branch.totalValueBRL,
        }),
        { pendingItems: 0, urgentItems: 0, totalValueBRL: 0 },
      );
    },
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
