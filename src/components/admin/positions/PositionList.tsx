import { Position } from "@/types/position";
import { Department } from "@/types/department";
import { Role } from "@/types/role";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface PositionListProps {
  positions: Position[];
  departments: Department[];
  roles: Role[];
  onEdit: (position: Position) => void;
  onDelete: (position: Position) => void;
  isLoading?: boolean;
}

export function PositionList({
  positions,
  departments,
  roles,
  onEdit,
  onDelete,
  isLoading = false,
}: PositionListProps) {
  const { isAdmin } = usePermissions();

  const getDepartmentName = (departmentId: string) => {
    return departments.find((d) => d.id === departmentId)?.name || departmentId;
  };

  const getRoleName = (roleId: string) => {
    return roles.find((r) => r.id === roleId)?.name || roleId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading positions...</p>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No positions found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Description</TableHead>
          {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map((position) => (
          <TableRow key={position.id}>
            <TableCell className="font-medium">{position.name}</TableCell>
            <TableCell>{getDepartmentName(position.departmentId)}</TableCell>
            <TableCell>{getRoleName(position.roleId)}</TableCell>
            <TableCell className="max-w-xs truncate">
              {position.description || "-"}
            </TableCell>
            {isAdmin && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(position)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(position)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
