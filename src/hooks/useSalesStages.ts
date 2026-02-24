import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { Stage } from "@/types/sales";

export const useSalesStages = () => {
  const {
    data: stages,
    isLoading,
    error,
  } = useQuery<Stage[]>({
    queryKey: ["salesStages"],
    queryFn: async () => {
      const stages = await salesService.getStageSequence();
      return stages.sort((a, b) => a.stageSequence - b.stageSequence);
    },
  });

  return {
    stages: stages || [],
    isLoading,
    error,
  };
};
