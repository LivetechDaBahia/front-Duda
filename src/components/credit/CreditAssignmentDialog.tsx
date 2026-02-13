import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, User, Search, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import type { CreditElementItem } from "@/types/credit";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface CreditAssignmentDialogProps {
  credit: CreditElementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignSuccess: () => void;
}

export const CreditAssignmentDialog = ({
  credit,
  isOpen,
  onClose,
  onAssignSuccess,
}: CreditAssignmentDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLocale();
  const { user: currentUser } = useAuth();
  const { isAdmin, isCreditManager, canAssignCreditToOthers } = usePermissions();

  // Fetch all users for assignment
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "for-assignment"],
    queryFn: async () => {
      return userService.getUsers({
        limit: 100,
        sortBy: "name",
        sortDir: "asc",
      });
    },
    enabled: isOpen,
  });

  // Find current user's data from the users list
  const allUsers = usersData?.data || [];
  const currentUserData = allUsers.find((u) => u.email === currentUser?.email);
  const currentDepartmentId = currentUserData?.departmentId;

  // Filter users based on role permissions
  const permittedUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Admins, Credit Managers, and Manager-level users can see all users
      if (isAdmin || isCreditManager || canAssignCreditToOthers) return true;

      // Credit agents can always see themselves for self-assignment
      if (user.email === currentUser?.email) return true;

      // Credit agents can assign to users in their same department
      if (currentDepartmentId && user.departmentId === currentDepartmentId) {
        return true;
      }

      return false;
    });
  }, [
    allUsers,
    isAdmin,
    isCreditManager,
    currentUser?.email,
    currentDepartmentId,
  ]);

  // Separate users into department users and other users
  const departmentUsers = useMemo(() => {
    return permittedUsers.filter(
      (user) =>
        currentDepartmentId && user.departmentId === currentDepartmentId,
    );
  }, [permittedUsers, currentDepartmentId]);

  const otherDepartmentUsers = useMemo(() => {
    return permittedUsers.filter(
      (user) =>
        !currentDepartmentId || user.departmentId !== currentDepartmentId,
    );
  }, [permittedUsers, currentDepartmentId]);

  // Filter users based on search query
  const filteredDepartmentUsers = useMemo(() => {
    if (!searchQuery.trim()) return departmentUsers;
    const query = searchQuery.toLowerCase();
    return departmentUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [departmentUsers, searchQuery]);

  const filteredOtherUsers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return otherDepartmentUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [otherDepartmentUsers, searchQuery]);

  // Get selected user
  const selectedUser = permittedUsers.find((u) => u.id === selectedUserId);

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedUserId("");
    setSearchQuery("");
    onClose();
  };

  const handleAssign = async () => {
    if (!credit) return;

    if (!selectedUserId) {
      toast({
        variant: "destructive",
        title: t("credit.assign.emailRequiredTitle"),
        description: t("credit.assign.selectUserRequired"),
      });
      return;
    }

    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: t("credit.assign.invalidEmailTitle"),
        description: t("credit.assign.invalidEmailDesc"),
      });
      return;
    }

    try {
      setIsLoading(true);

      await creditService.assignCreditItem({
        itemId: credit.id.toString(),
        assigneeEmail: selectedUser.email,
        flowId: credit.flowId,
        key: credit.key,
      });

      toast({
        title: t("credit.assign.successTitle"),
        description: t("credit.assign.successDesc").replace(
          "{email}",
          selectedUser.name,
        ),
      });

      onAssignSuccess();
      handleClose();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast({
          variant: "destructive",
          title: t("credit.assign.permissionDeniedTitle"),
          description: t("credit.assign.permissionDeniedDesc"),
        });
      } else if (error?.response?.status === 400) {
        toast({
          variant: "destructive",
          title: t("credit.assign.failedTitle"),
          description:
            error?.response?.data?.message ||
            t("credit.assign.notFoundOrInvalid"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("credit.assign.failedTitle"),
          description: t("credit.assign.genericError"),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const UserItem = ({
    user,
    isSelected,
    onClick,
  }: {
    user: (typeof allUsers)[0];
    isSelected: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
        "hover:bg-accent",
        isSelected && "bg-primary/10 border border-primary",
      )}
    >
      <div className="flex-shrink-0 h-9 w-9 rounded-full bg-muted flex items-center justify-center">
        <User className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
      {isSelected && (
        <Badge variant="secondary" className="flex-shrink-0">
          {t("credit.assign.selected")}
        </Badge>
      )}
    </button>
  );

  if (!credit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("credit.assign.title")}</DialogTitle>
          <DialogDescription>
            {t("credit.assign.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Assignee */}
          <div className="space-y-2">
            <Label>{t("credit.assign.currentAssignee")}</Label>
            {credit.user ? (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {credit.user}
              </Badge>
            ) : (
              <Badge variant="outline">{t("credit.assign.unassigned")}</Badge>
            )}
          </div>

          {/* Credit Info */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">
                {t("credit.offer")}:{" "}
              </span>
              <span className="font-medium">{credit.details.offer}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">
                {t("credit.client")}:{" "}
              </span>
              <span className="font-medium">{credit.details.client}</span>
            </div>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="user-search">{t("credit.assign.selectUser")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="user-search"
                placeholder={t("credit.assign.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isLoading || isLoadingUsers}
                className="pl-9"
              />
            </div>
            {!searchQuery.trim() && (isAdmin || isCreditManager || canAssignCreditToOthers) && (
              <p className="text-xs text-muted-foreground">
                {t("credit.assign.searchHint")}
              </p>
            )}
          </div>

          {/* User List */}
          {isLoadingUsers ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("credit.assign.loadingUsers")}
            </div>
          ) : permittedUsers.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {t("credit.assign.noUsersAvailable")}
            </div>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border">
              <div className="p-2 space-y-3">
                {/* Department Users Section */}
                {filteredDepartmentUsers.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("credit.assign.myDepartment")}
                      </span>
                    </div>
                    {filteredDepartmentUsers.map((user) => (
                      <UserItem
                        key={user.id}
                        user={user}
                        isSelected={selectedUserId === user.id}
                        onClick={() => setSelectedUserId(user.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Other Departments Section (only shown when searching) */}
                {filteredOtherUsers.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2 py-1 border-t pt-3">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {t("credit.assign.otherDepartments")}
                      </span>
                    </div>
                    {filteredOtherUsers.map((user) => (
                      <UserItem
                        key={user.id}
                        user={user}
                        isSelected={selectedUserId === user.id}
                        onClick={() => setSelectedUserId(user.id)}
                      />
                    ))}
                  </div>
                )}

                {/* No results message */}
                {searchQuery.trim() &&
                  filteredDepartmentUsers.length === 0 &&
                  filteredOtherUsers.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-6">
                      {t("credit.assign.noResults")}
                    </div>
                  )}
              </div>
            </ScrollArea>
          )}

          {/* Selected User Summary */}
          {selectedUser && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm">
                <span className="text-muted-foreground">
                  {t("credit.assign.willAssignTo")}:{" "}
                </span>
                <span className="font-medium">{selectedUser.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  ({selectedUser.email})
                </span>
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || isLoadingUsers || !selectedUserId}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("credit.assign.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
