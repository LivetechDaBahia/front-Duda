import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { transformCreditElementsToUI } from "@/lib/creditTransformer";
import type { CreditElementItem } from "@/types/credit";

export const useCredits = () => {
  const {
    data: credits,
    isLoading,
    error,
    refetch,
  } = useQuery<CreditElementItem[]>({
    queryKey: ["credits"],
    queryFn: async () => {
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
