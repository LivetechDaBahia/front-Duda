import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface UsersHeaderProps {
  onCreateClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function UsersHeader({
  onCreateClick,
  searchQuery,
  onSearchChange,
}: UsersHeaderProps) {
  const { canManageUsers } = usePermissions();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 w-full sm:w-[250px]"
          />
        </div>

        {canManageUsers && (
          <Button onClick={onCreateClick}>
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        )}
      </div>
    </div>
  );
}
