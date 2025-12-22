import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { userService } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";
import type { CreditElementItem } from "@/types/credit";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";

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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLocale();
  const { user: currentUser } = useAuth();
  const { isAdmin, isCreditManager } = usePermissions();

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

  // Find current user's departmentId from the users list
  const allUsers = usersData?.data || [];
  const currentUserData = allUsers.find((u) => u.email === currentUser?.email);

  // Filter users based on role:
  // - Admins and Credit Managers can assign to any user
  // - Credit Agents can self-assign OR assign to users in their department
  const users = allUsers.filter((user) => {
    // Admins and Credit Managers have unrestricted access
    if (isAdmin || isCreditManager) return true;

    // Credit agents can always see themselves for self-assignment
    if (user.email === currentUser?.email) return true;

    // Credit agents can assign to users in their same department
    if (
      currentUserData?.departmentId &&
      user.departmentId === currentUserData.departmentId
    ) {
      return true;
    }

    return false;
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
    }
  }, [isOpen]);

  const handleClose = () => {
    setSelectedUserId("");
    onClose();
  };

  const handleAssign = async () => {
    if (!credit) return;

    if (!selectedUserId) {
      toast({
        variant: "destructive",
        title: t("credit.assign.emailRequiredTitle"),
        description: t("credit.assign.emailRequiredDesc"),
      });
      return;
    }

    const selectedUser = users.find((u) => u.id === selectedUserId);
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

          {/* New Assignee Selection */}
          <div className="space-y-2">
            <Label htmlFor="assignee-user">Assign to User *</Label>
            {isLoadingUsers ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No users available.
              </div>
            ) : (
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
                disabled={isLoading}
              >
                <SelectTrigger id="assignee-user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || isLoadingUsers || users.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("credit.assign.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
