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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";

interface CreditJustificationDialogProps {
  isOpen: boolean;
  statusName: string;
  onConfirm: (justification: string) => void;
  onCancel: () => void;
}

export const CreditJustificationDialog = ({
  isOpen,
  statusName,
  onConfirm,
  onCancel,
}: CreditJustificationDialogProps) => {
  const { t } = useLocale();
  const [justification, setJustification] = useState("");
  const maxLength = 50;

  const handleConfirm = () => {
    if (justification.trim()) {
      onConfirm(justification.trim());
      setJustification("");
    }
  };

  const handleCancel = () => {
    setJustification("");
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("credit.justifyStatusChange")}</DialogTitle>
          <DialogDescription>
            {t("credit.justifyStatusChangeDescription")} <strong>{statusName}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="justification">
              {t("credit.justification")}
            </Label>
            <Textarea
              id="justification"
              value={justification}
              onChange={(e) => {
                if (e.target.value.length <= maxLength) {
                  setJustification(e.target.value);
                }
              }}
              placeholder={t("credit.justificationPlaceholder")}
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {justification.length}/{maxLength}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!justification.trim()}
          >
            {t("common.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
