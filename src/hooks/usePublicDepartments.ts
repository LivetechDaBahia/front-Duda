import { useQuery } from "@tanstack/react-query";
import { publicApiClient } from "@/lib/publicApiClient";
import { Department } from "@/types/department";

export function usePublicDepartments() {
  return useQuery<Department[]>({
    queryKey: ["public-departments"],
    queryFn: () => publicApiClient.get("/public/departments"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
