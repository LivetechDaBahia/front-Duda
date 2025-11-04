import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PositionList } from "./PositionList";
import { PositionDialog } from "./PositionDialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePositions } from "@/hooks/usePositions";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { Position, CreatePositionDto } from "@/types/position";
import { usePermissions } from "@/hooks/usePermissions";

export function PositionsManagement() {
  const { isAdmin } = usePermissions();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    string | undefined
  >(undefined);

  const {
    positions,
    isLoading: positionsLoading,
    createPosition,
    updatePosition,
    deletePosition,
    isCreating,
    isUpdating,
    isDeleting,
  } = usePositions(selectedDepartmentId);

  const { departments, isLoading: departmentsLoading } = useDepartments();
  const { roles, isLoading: rolesLoading } = useRoles();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [deletingPosition, setDeletingPosition] = useState<Position | null>(
    null,
  );

  const handleCreate = async (data: CreatePositionDto) => {
    await createPosition(data);
    setIsCreateDialogOpen(false);
  };

  const handleUpdate = async (data: CreatePositionDto) => {
    if (!editingPosition) return;
    await updatePosition({ id: editingPosition.id, data });
    setEditingPosition(null);
  };

  const handleDelete = async () => {
    if (!deletingPosition) return;
    await deletePosition(deletingPosition.id);
    setDeletingPosition(null);
  };

  const isLoading = positionsLoading || departmentsLoading || rolesLoading;

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Positions</h3>
          <p className="text-sm text-muted-foreground">
            Manage positions linking departments and roles
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Position
          </Button>
        )}
      </div>

      {/* Department Filter */}
      <div className="flex gap-2 items-center">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select
          value={selectedDepartmentId || "all"}
          onValueChange={(value) =>
            setSelectedDepartmentId(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <PositionList
        positions={positions}
        departments={departments}
        roles={roles}
        onEdit={setEditingPosition}
        onDelete={setDeletingPosition}
        isLoading={isLoading}
      />

      {/* Create Dialog */}
      <PositionDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={isCreating}
      />

      {/* Edit Dialog */}
      <PositionDialog
        open={!!editingPosition}
        onClose={() => setEditingPosition(null)}
        onSubmit={handleUpdate}
        position={editingPosition || undefined}
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingPosition}
        onOpenChange={(open) => !open && setDeletingPosition(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Position</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingPosition?.name}"? This
              action cannot be undone. Make sure there are no users assigned to
              this position.
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
