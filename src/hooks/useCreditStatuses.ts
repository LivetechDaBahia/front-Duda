import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { sortCreditStatuses } from "@/lib/creditTransformer";
import type { CreditStatus } from "@/types/credit";

export const useCreditStatuses = () => {
  const {
    data: statuses,
    isLoading,
    error,
  } = useQuery<CreditStatus[]>({
    queryKey: ["creditStatuses"],
    queryFn: async () => {
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
