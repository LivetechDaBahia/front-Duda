import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { positionService } from "@/services/positionService";
import {
  CreatePositionDto,
  UpdatePositionDto,
  Position,
} from "@/types/position";
import { useToast } from "@/hooks/use-toast";

export const usePositions = (departmentId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
      toast({ title: "Position created successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create position",
        description: error.message,
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePositionDto }) =>
      positionService.updatePosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast({ title: "Position updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update position",
        description: error.message,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => positionService.deletePosition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Position deleted successfully" });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete position",
        description: error.message,
      });
    },
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
