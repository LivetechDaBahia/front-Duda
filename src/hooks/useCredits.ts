import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { transformCreditElementsToUI } from "@/lib/creditTransformer";
import type { CreditElementItem } from "@/types/credit";
import { USE_MOCK_CREDIT_DATA, mockCredits } from "@/data/mockCredits";

export const useCredits = () => {
  const {
    data: credits,
    isLoading,
    error,
    refetch,
  } = useQuery<CreditElementItem[]>({
    queryKey: ["credits"],
    queryFn: async () => {
      // Use mock data if flag is enabled
      if (USE_MOCK_CREDIT_DATA) {
        return transformCreditElementsToUI(mockCredits);
      }
      const elements = await creditService.getCreditElements();
      return transformCreditElementsToUI(elements);
    },
  });

  return {
    credits: credits || [],
    isLoading,
    error,
    refetch,
  };
};
