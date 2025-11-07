import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User } from "lucide-react";
import { creditService } from "@/services/creditService";
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
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    setAssigneeEmail("");
    onClose();
  };

  const handleAssign = async () => {
    if (!credit) return;

    if (!assigneeEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter an email address.",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(assigneeEmail.trim())) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address.",
      });
      return;
    }

    try {
      setIsLoading(true);

      await creditService.assignCreditItem({
        itemId: credit.id.toString(),
        assigneeEmail: assigneeEmail.trim(),
        flowId: credit.flowId,
        key: credit.key,
      });

      toast({
        title: "Item assigned",
        description: `Successfully assigned to ${assigneeEmail.trim()}`,
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
            Assign this credit item to another user by entering their email
            address.
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

          {/* New Assignee Email */}
          <div className="space-y-2">
            <Label htmlFor="assignee-email">Assignee Email *</Label>
            <Input
              id="assignee-email"
              type="email"
              placeholder="user@example.com"
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
