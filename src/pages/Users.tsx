import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { UsersHeader } from "@/components/users/UsersHeader";
import { UsersTable } from "@/components/users/UsersTable";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Users() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { hasPermission } = usePermissions();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Check if user has permission to view users
  const canViewUsers = hasPermission("users:read");

  // Fetch users
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
    enabled: canViewUsers,
  });

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "User created",
        description: "The user has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message,
      });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast({
        title: "User updated",
        description: "The user has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: error.message,
      });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
      toast({
        title: "User deleted",
        description: "The user has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: error.message,
      });
    },
  });

  // Handlers
  const handleCreate = async (data: CreateUserDto) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (data: UpdateUserDto) => {
    if (!editingUser) return;
    await updateMutation.mutateAsync({ id: editingUser.id, data });
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    await deleteMutation.mutateAsync(deletingUser.id);
  };

  // Permission check
  if (!canViewUsers) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to view users. Please contact your
            administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <UsersHeader
        onCreateClick={() => setIsCreateDialogOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load users: {(error as Error).message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <UsersTable
            users={filteredUsers}
            onEdit={setEditingUser}
            onDelete={setDeletingUser}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <UserFormDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createMutation.isPending}
      />

      {/* Edit Dialog */}
      <UserFormDialog
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdate}
        user={editingUser || undefined}
        isSubmitting={updateMutation.isPending}
      />

      {/* Delete Dialog */}
      <DeleteUserDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDelete}
        user={deletingUser}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
