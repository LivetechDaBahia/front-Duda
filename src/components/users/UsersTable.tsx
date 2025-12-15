import { User } from "@/types/user";
import { usePermissions } from "@/hooks/usePermissions";
import { useDepartments } from "@/hooks/useDepartments";
import { useRoles } from "@/hooks/useRoles";
import { usePositions } from "@/hooks/usePositions";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Mail,
  Building,
  Users,
  Briefcase,
  Phone,
  CheckCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  isLoading?: boolean;
}

export function UsersTable({
  users,
  onEdit,
  onDelete,
  isLoading,
}: UsersTableProps) {
  const { canManageUsers, canDeleteUsers } = usePermissions();
  const { departments } = useDepartments();
  const { roles } = useRoles();
  const { positions } = usePositions();

  // Helper to get names from IDs
  const getDepartmentName = (id: string) =>
    departments.find((d) => d.id === id)?.name || id;
  const getRoleName = (id: string) =>
    roles.find((r) => r.id === id)?.name || id;
  const getRoleNames = (ids: string[]) =>
    ids.map((id) => getRoleName(id));
  const getPositionName = (id: string) =>
    positions.find((p) => p.id === id)?.name || id;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-md border border-dashed">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {canManageUsers
              ? "Get started by creating your first user."
              : "No users match your search criteria."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Roles</TableHead>
            <TableHead>First Access</TableHead>
            {(canManageUsers || canDeleteUsers) && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-sm">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{user.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.phone || "—"}</span>
                  {user.phoneVerified && (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {getPositionName(user.positionId)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {getDepartmentName(user.departmentId)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.roleIds?.length > 0 ? (
                    getRoleNames(user.roleIds).map((roleName, idx) => (
                      <Badge key={idx} variant="outline">
                        {roleName}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.firstAccess ? "secondary" : "outline"}>
                  {user.firstAccess ? "Yes" : "No"}
                </Badge>
              </TableCell>
              {(canManageUsers || canDeleteUsers) && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {canManageUsers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit user</span>
                      </Button>
                    )}
                    {canDeleteUsers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(user)}
                        className="h-8 w-8 p-0 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete user</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
