import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { sortCreditStatuses } from "@/lib/creditTransformer";
import type { CreditStatus } from "@/types/credit";
import { USE_MOCK_CREDIT_DATA, mockCreditStatuses } from "@/data/mockCredits";

export const useCreditStatuses = () => {
  const {
    data: statuses,
    isLoading,
    error,
  } = useQuery<CreditStatus[]>({
    queryKey: ["creditStatuses"],
    queryFn: async () => {
      // Use mock data if flag is enabled
      if (USE_MOCK_CREDIT_DATA) {
        return sortCreditStatuses(mockCreditStatuses);
      }
      const statuses = await creditService.getCreditStatuses();
      return sortCreditStatuses(statuses);
    },
  });

  return {
    statuses: statuses || [],
    isLoading,
    error,
  };
};
