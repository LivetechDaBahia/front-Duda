import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { roleService } from "@/services/roleService";
import { CreateRoleDto, UpdateRoleDto, Role, AccessLevel } from "@/types/role";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useLocale } from "@/contexts/LocaleContext";

export const useRoles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { t } = useLocale();

  // Fetch roles
  const {
    data: roles = [],
    isLoading,
    error,
  } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: roleService.getRoles,
  });

  // Fetch permissions list
  const { data: permissionsList = [], isLoading: isLoadingPermissions } =
    useQuery<string[]>({
      queryKey: ["permissions-list"],
      queryFn: roleService.getPermissionsList,
    });

  // Fetch access levels
  const { data: accessLevels = [], isLoading: isLoadingAccessLevels } =
    useQuery<AccessLevel[]>({
      queryKey: ["access-levels"],
      queryFn: roleService.getAccessLevels,
    });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateRoleDto) => roleService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({ title: t("admin.roles.createSuccess") });
    },
    onError: handleError,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      roleService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({ title: t("admin.roles.updateSuccess") });
    },
    onError: handleError,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast({ title: t("admin.roles.deleteSuccess") });
    },
    onError: handleError,
  });

  return {
    roles,
    isLoading,
    error,
    permissionsList,
    isLoadingPermissions,
    accessLevels,
    isLoadingAccessLevels,
    createRole: createMutation.mutateAsync,
    updateRole: updateMutation.mutateAsync,
    deleteRole: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
