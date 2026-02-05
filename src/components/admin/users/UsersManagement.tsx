import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/userService";
import { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, Users as UsersIcon } from "lucide-react";
import { UsersTable } from "@/components/users/UsersTable";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { useLocale } from "@/contexts/LocaleContext";

export function UsersManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLocale();
  const { handleError } = useErrorHandler();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Fetch users with pagination
  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", { search: searchQuery }],
    queryFn: () =>
      userService.getUsers({
        search: searchQuery || undefined,
        limit: 100, // Get more records for client-side operations
      }),
  });

  const users = usersResponse?.data || [];
  const total = usersResponse?.total || 0;

  // Users are already filtered by the API search
  const filteredUsers = users;

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsCreateDialogOpen(false);
      toast({
        title: t("user.createSuccess") || "User created",
        description:
          t("user.createSuccessDesc") ||
          "The user has been successfully created.",
      });
    },
    onError: handleError,
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditingUser(null);
      toast({
        title: t("user.updateSuccess") || "User updated",
        description:
          t("user.updateSuccessDesc") ||
          "The user has been successfully updated.",
      });
    },
    onError: handleError,
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
      toast({
        title: t("user.deleteSuccess") || "User deleted",
        description:
          t("user.deleteSuccessDesc") ||
          "The user has been successfully deleted.",
      });
    },
    onError: handleError,
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

  return (
    <div className="space-y-6 p-6">
      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("user.totalUsers") || "Total Users"}
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">
              {searchQuery && `${users.length} matching search`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("user.searchUsers") || "Search users..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {t("user.addUser") || "Add User"}
        </Button>
      </div>

      {/* Table */}
      <UsersTable
        users={filteredUsers}
        onEdit={setEditingUser}
        onDelete={setDeletingUser}
        isLoading={isLoading}
      />

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
