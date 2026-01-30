import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { positionService } from "@/services/positionService";
import {
  CreatePositionDto,
  UpdatePositionDto,
  Position,
} from "@/types/position";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useLocale } from "@/contexts/LocaleContext";

export const usePositions = (departmentId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { t } = useLocale();

  // Fetch positions
  const {
    data: positions = [],
    isLoading,
    error,
  } = useQuery<Position[]>({
    queryKey: ["positions", departmentId],
    queryFn: () => positionService.getPositions(departmentId),
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreatePositionDto) =>
      positionService.createPosition(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast({ title: t("admin.positions.createSuccess") });
    },
    onError: handleError,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePositionDto }) =>
      positionService.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast({ title: t("admin.positions.updateSuccess") });
    },
    onError: handleError,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => positionService.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: t("admin.positions.deleteSuccess") });
    },
    onError: handleError,
  });

  return {
    positions,
    isLoading,
    error,
    createPosition: createMutation.mutateAsync,
    updatePosition: updateMutation.mutateAsync,
    deletePosition: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
