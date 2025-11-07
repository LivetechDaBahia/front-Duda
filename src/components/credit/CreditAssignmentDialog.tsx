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

  const users = usersData?.data || [];

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
        title: "User required",
        description: "Please select a user to assign.",
      });
      return;
    }

    const selectedUser = users.find((u) => u.id === selectedUserId);
    if (!selectedUser) {
      toast({
        variant: "destructive",
        title: "Invalid user",
        description: "Please select a valid user.",
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
        title: "Item assigned",
        description: `Successfully assigned to ${selectedUser.name}`,
      });

      onAssignSuccess();
      handleClose();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast({
          variant: "destructive",
          title: "Permission denied",
          description:
            "You don't have permission to assign this item to another user.",
        });
      } else if (error?.response?.status === 400) {
        toast({
          variant: "destructive",
          title: "Assignment failed",
          description:
            error?.response?.data?.message || "Item not found or invalid data.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Assignment failed",
          description: "Could not assign item. Please try again.",
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
          <DialogTitle>Assign Credit Item</DialogTitle>
          <DialogDescription>
            Select a user from the list to assign this credit item.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Assignee */}
          <div className="space-y-2">
            <Label>Current Assignee</Label>
            {credit.user ? (
              <Badge variant="secondary" className="gap-1">
                <User className="h-3 w-3" />
                {credit.user}
              </Badge>
            ) : (
              <Badge variant="outline">Unassigned</Badge>
            )}
          </div>

          {/* Credit Info */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <span className="text-muted-foreground">Offer: </span>
              <span className="font-medium">{credit.details.offer}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Client: </span>
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
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={isLoading || isLoadingUsers || users.length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
