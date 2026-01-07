import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RoleList } from "./RoleList";
import { RoleDialog } from "./RoleDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRoles } from "@/hooks/useRoles";
import { Role, CreateRoleDto } from "@/types/role";
import { usePermissions } from "@/hooks/usePermissions";
import { useLocale } from "@/contexts/LocaleContext";

export function RolesManagement() {
  const { isAdmin } = usePermissions();
  const { t } = useLocale();
  const {
    roles,
    isLoading,
    createRole,
    updateRole,
    deleteRole,
    isCreating,
    isUpdating,
    isDeleting,
    accessLevels,
    permissionsList,
    isLoadingAccessLevels,
    isLoadingPermissions,
  } = useRoles();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const handleCreate = async (data: CreateRoleDto) => {
    await createRole(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (data: CreateRoleDto) => {
    if (!editingRole) return;
    await updateRole({ id: editingRole.id, data });
    setEditingRole(null);
  };

  const handleDelete = async () => {
    if (!deletingRole) return;
    await deleteRole(deletingRole.id);
    setDeletingRole(null);
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t("role.title")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("role.description")}
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("role.addRole")}
          </Button>
        )}
      </div>

      {/* List */}
      <RoleList
        roles={roles}
        accessLevels={accessLevels}
        onEdit={setEditingRole}
        onDelete={setDeletingRole}
        isLoading={isLoading || isLoadingAccessLevels}
      />

      {/* Create Dialog */}
      <RoleDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
        accessLevels={accessLevels}
        permissionsList={permissionsList}
        isLoadingAccessLevels={isLoadingAccessLevels}
        isLoadingPermissions={isLoadingPermissions}
      />

      {/* Edit Dialog */}
      <RoleDialog
        open={!!editingRole}
        onClose={() => setEditingRole(null)}
        onSubmit={handleUpdate}
        role={editingRole || undefined}
        isSubmitting={isUpdating}
        accessLevels={accessLevels}
        permissionsList={permissionsList}
        isLoadingAccessLevels={isLoadingAccessLevels}
        isLoadingPermissions={isLoadingPermissions}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("role.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("role.deleteConfirm").replace("{name}", deletingRole?.name || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? t("role.deleting") : t("role.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
