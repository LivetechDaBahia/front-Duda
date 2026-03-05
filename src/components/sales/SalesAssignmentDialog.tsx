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
import { salesService } from "@/services/salesService";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import type { SalesElementItem } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

interface SalesAssignmentDialogProps {
  item: SalesElementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignSuccess: () => void;
}

export const SalesAssignmentDialog = ({
  item,
  isOpen,
  onClose,
  onAssignSuccess,
}: SalesAssignmentDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLocale();
  const { user: currentUser } = useAuth();
  const { isAdmin, canAssignSalesToOthers } = usePermissions();

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", "for-sales-assignment"],
    queryFn: async () => {
      return userService.getUsers({
        limit: 100,
        sortBy: "name",
        sortDir: "asc",
      });
    },
    enabled: isOpen,
  });

  const allUsers = usersData?.data || [];
  const currentUserData = allUsers.find((u) => u.email === currentUser?.email);
  const currentDepartmentId = currentUserData?.departmentId;

  // Assignment rules: Viewer/Editor can only self-assign unassigned items; Manager/Admin can assign to anyone
  const permittedUsers = useMemo(() => {
    return allUsers.filter((user) => {
      if (isAdmin || canAssignSalesToOthers) return true;
      // Viewer/Editor: only self
      if (user.email === currentUser?.email) return true;
      return false;
    });
  }, [allUsers, isAdmin, canAssignSalesToOthers, currentUser?.email]);

  const departmentUsers = useMemo(() => {
    return permittedUsers.filter(
      (user) => currentDepartmentId && user.departmentId === currentDepartmentId,
    );
  }, [permittedUsers, currentDepartmentId]);

  const otherDepartmentUsers = useMemo(() => {
    return permittedUsers.filter(
      (user) => !currentDepartmentId || user.departmentId !== currentDepartmentId,
    );
  }, [permittedUsers, currentDepartmentId]);

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

  const selectedUser = permittedUsers.find((u) => u.id === selectedUserId);

  // Check if current user (Viewer/Editor) can assign this item
  const canSelfAssign = useMemo(() => {
    if (isAdmin || canAssignSalesToOthers) return true;
    // Viewer/Editor can only assign unassigned items to themselves
    if (item?.user) return false; // Already assigned
    return true;
  }, [isAdmin, canAssignSalesToOthers, item?.user]);

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
    if (!item || !selectedUser) return;

    try {
      setIsLoading(true);

      await salesService.assignItem({
        itemId: item.id.toString(),
        assigneeEmail: selectedUser.email,
        flowId: item.flowId,
        key: item.key,
      });

      toast({
        title: t("sales.assign.successTitle"),
        description: t("sales.assign.successDesc").replace("{name}", selectedUser.name),
      });

      onAssignSuccess();
      handleClose();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast({
          variant: "destructive",
          title: t("sales.assign.permissionDeniedTitle"),
          description: t("sales.assign.permissionDeniedDesc"),
        });
      } else if (error?.response?.status === 400) {
        toast({
          variant: "destructive",
          title: t("sales.assign.failedTitle"),
          description: error?.response?.data?.message || t("sales.assign.genericError"),
        });
      } else {
        toast({
          variant: "destructive",
          title: t("sales.assign.failedTitle"),
          description: t("sales.assign.genericError"),
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
          {t("sales.assign.selected")}
        </Badge>
      )}
    </button>
  );

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("sales.assign.title")}</DialogTitle>
          <DialogDescription>
            {t("sales.assign.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Assignee */}
          <div className="space-y-2">
            <Label>{t("sales.assign.currentAssignee")}</Label>
            {item.user ? (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {item.user}
              </Badge>
            ) : (
              <Badge variant="outline">{t("sales.assign.unassigned")}</Badge>
            )}
          </div>

          {/* Item Info */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">{t("sales.offer")}: </span>
              <span className="font-medium">{item.offer}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">{t("sales.client")}: </span>
              <span className="font-medium">{item.client}/{item.clientBranch}</span>
            </div>
          </div>

          {!canSelfAssign && (
            <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <p className="text-sm text-destructive">
                {t("sales.assign.alreadyAssigned")}
              </p>
            </div>
          )}

          {canSelfAssign && (
            <>
              {/* Search Input */}
              <div className="space-y-2">
                <Label htmlFor="sales-user-search">{t("sales.assign.selectUser")}</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sales-user-search"
                    placeholder={t("sales.assign.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading || isLoadingUsers}
                    className="pl-9"
                  />
                </div>
                {!searchQuery.trim() && canAssignSalesToOthers && (
                  <p className="text-xs text-muted-foreground">
                    {t("sales.assign.searchHint")}
                  </p>
                )}
              </div>

              {/* User List */}
              {isLoadingUsers ? (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("sales.assign.loadingUsers")}
                </div>
              ) : permittedUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-8">
                  {t("sales.assign.noUsersAvailable")}
                </div>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border">
                  <div className="p-2 space-y-3">
                    {filteredDepartmentUsers.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t("sales.assign.myDepartment")}
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

                    {filteredOtherUsers.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-2 py-1 border-t pt-3">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {t("sales.assign.otherDepartments")}
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

                    {searchQuery.trim() &&
                      filteredDepartmentUsers.length === 0 &&
                      filteredOtherUsers.length === 0 && (
                        <div className="text-sm text-muted-foreground text-center py-6">
                          {t("sales.assign.noResults")}
                        </div>
                      )}
                  </div>
                </ScrollArea>
              )}

              {selectedUser && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm">
                    <span className="text-muted-foreground">
                      {t("sales.assign.willAssignTo")}:{" "}
                    </span>
                    <span className="font-medium">{selectedUser.name}</span>
                    <span className="text-muted-foreground"> ({selectedUser.email})</span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || isLoadingUsers || !selectedUserId || !canSelfAssign}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("sales.assign.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
