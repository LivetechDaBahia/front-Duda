import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { CreditIndicators } from "@/types/credit";

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
    queryFn: () => creditService.getIndicators(user?.email || ""),
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
