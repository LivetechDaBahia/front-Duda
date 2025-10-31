import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { Branch } from "@/types/order";

export const useBranches = () => {
  const {
    data: branches = [],
    isLoading,
    error,
  } = useQuery<Branch[], Error>({
    queryKey: ["branches"],
    queryFn: () => orderService.getBranches(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    branches,
    isLoading,
    error,
  };
};
