import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DepartmentList } from "./DepartmentList";
import { DepartmentDialog } from "./DepartmentDialog";
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
import { useDepartments } from "@/hooks/useDepartments";
import { Department, CreateDepartmentDto } from "@/types/department";
import { usePermissions } from "@/hooks/usePermissions";

export function DepartmentsManagement() {
  const { isAdmin } = usePermissions();
  const {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDepartments();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] =
    useState<Department | null>(null);

  const handleCreate = async (data: CreateDepartmentDto) => {
    await createDepartment(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (data: CreateDepartmentDto) => {
    if (!editingDepartment) return;
    await updateDepartment({ id: editingDepartment.id, data });
    setEditingDepartment(null);
  };

  const handleDelete = async () => {
    if (!deletingDepartment) return;
    await deleteDepartment(deletingDepartment.id);
    setDeletingDepartment(null);
  };

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Departments</h3>
          <p className="text-sm text-muted-foreground">
            Manage organizational departments
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        )}
      </div>

      {/* List */}
      <DepartmentList
        departments={departments}
        onEdit={setEditingDepartment}
        onDelete={setDeletingDepartment}
        isLoading={isLoading}
      />

      {/* Create Dialog */}
      <DepartmentDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      {/* Edit Dialog */}
      <DepartmentDialog
        open={!!editingDepartment}
        onClose={() => setEditingDepartment(null)}
        onSubmit={handleUpdate}
        department={editingDepartment || undefined}
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingDepartment}
        onOpenChange={(open) => !open && setDeletingDepartment(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingDepartment?.name}"? This
              action cannot be undone. Make sure there are no positions
              associated with this department.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
