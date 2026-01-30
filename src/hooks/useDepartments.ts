import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { departmentService } from "@/services/departmentService";
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  Department,
} from "@/types/department";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useLocale } from "@/contexts/LocaleContext";

export const useDepartments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { t } = useLocale();

  // Fetch departments
  const {
    data: departments = [],
    isLoading,
    error,
  } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: departmentService.getDepartments,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentDto) =>
      departmentService.createDepartment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({ title: t("admin.departments.createSuccess") });
    },
    onError: handleError,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDepartmentDto }) =>
      departmentService.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast({ title: t("admin.departments.updateSuccess") });
    },
    onError: handleError,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => departmentService.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast({ title: t("admin.departments.deleteSuccess") });
    },
    onError: handleError,
  });

  return {
    departments,
    isLoading,
    error,
    createDepartment: createMutation.mutateAsync,
    updateDepartment: updateMutation.mutateAsync,
    deleteDepartment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
