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
import { useLocale } from "@/contexts/LocaleContext";

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
  const { t } = useLocale();

  const handleClose = () => {
    setAssigneeEmail("");
    onClose();
  };

  const handleAssign = async () => {
    if (!credit) return;

    if (!assigneeEmail.trim()) {
      toast({
        variant: "destructive",
        title: t("credit.assign.emailRequiredTitle"),
        description: t("credit.assign.emailRequiredDesc"),
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(assigneeEmail.trim())) {
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
        assigneeEmail: assigneeEmail.trim(),
        flowId: credit.flowId,
        key: credit.key,
      });

      toast({
        title: t("credit.assign.successTitle"),
        description: t("credit.assign.successDesc").replace(
          "{email}",
          assigneeEmail.trim(),
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

          {/* New Assignee Email */}
          <div className="space-y-2">
            <Label htmlFor="assignee-email">
              {t("credit.assign.emailLabel")}
            </Label>
            <Input
              id="assignee-email"
              type="email"
              placeholder={t("credit.assign.emailPlaceholder")}
              value={assigneeEmail}
              onChange={(e) => setAssigneeEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleAssign} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("credit.assign.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
