import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { BranchCreditIndicators, CreditIndicators } from "@/types/credit";

export const useCreditIndicators = () => {
  const { user } = useAuth();
  const { canManageCredit, canViewCredit } = usePermissions();

  const hasAccess = canManageCredit || canViewCredit;

  const {
    data: indicators,
    isLoading,
    error,
  } = useQuery<CreditIndicators>({
    queryKey: ["creditIndicators", user?.email],
    queryFn: async (): Promise<CreditIndicators> => {
      const data: BranchCreditIndicators[] = await creditService.getIndicators(user?.email || "");
      
      // Sum totals across all items in the array
      return data.reduce(
        (acc, item) => ({
          pendingItems: acc.pendingItems + item.pendingItems,
          urgentItems: acc.urgentItems + item.urgentItems,
          totalValueBRL: acc.totalValueBRL + item.totalValueBRL,
        }),
        { pendingItems: 0, urgentItems: 0, totalValueBRL: 0 }
      );
    },
    enabled: hasAccess && !!user?.email,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    indicators,
    isLoading: hasAccess ? isLoading : false,
    error,
    enabled: hasAccess,
  };
};
