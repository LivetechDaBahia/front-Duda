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
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface RoleListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  isLoading?: boolean;
}

const getAccessLevelName = (accessLevelId: string): string => {
  const levels: Record<string, string> = {
    "1": "Administrator",
    "2": "Manager",
    "3": "Editor",
    "4": "Viewer",
  };
  return levels[accessLevelId] || accessLevelId;
};

const getAccessLevelVariant = (
  accessLevelId: string,
): "default" | "secondary" | "outline" => {
  if (accessLevelId === "1") return "default";
  if (accessLevelId === "2") return "secondary";
  return "outline";
};

export function RoleList({
  roles,
  onEdit,
  onDelete,
  isLoading = false,
}: RoleListProps) {
  const { isAdmin } = usePermissions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">Loading roles...</p>
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No roles found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Access Level</TableHead>
          {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id}>
            <TableCell className="font-medium">{role.name}</TableCell>
            <TableCell>
              <Badge variant={getAccessLevelVariant(role.accessLevelId)}>
                {getAccessLevelName(role.accessLevelId)}
              </Badge>
            </TableCell>
            {isAdmin && (
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(role)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(role)}
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
