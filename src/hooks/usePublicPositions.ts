import { useQuery } from "@tanstack/react-query";
import { publicApiClient } from "@/lib/publicApiClient";
import { Position } from "@/types/position";

export function usePublicPositions(departmentId?: string) {
  return useQuery<Position[]>({
    queryKey: ["public-positions", departmentId],
    queryFn: () => {
      const params = departmentId ? `?departmentId=${departmentId}` : "";
      return publicApiClient.get(`/public/positions${params}`);
    },
    enabled: !!departmentId, // Only fetch when department is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
