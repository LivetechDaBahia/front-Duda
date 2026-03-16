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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/contexts/LocaleContext";
import { salesService } from "@/services/salesService";
import { toast } from "@/hooks/use-toast";
import type { SalesOrderDetails } from "@/types/sales";

interface ChangeObservationsDialogProps {
  order: SalesOrderDetails | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangeObservationsDialog = ({
  order,
  open,
  onClose,
  onSuccess,
}: ChangeObservationsDialogProps) => {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [obsNF, setObsNF] = useState("");
  const [obsPacking, setObsPacking] = useState("");
  const [obsLogistics, setObsLogistics] = useState("");
  const [obsProposal, setObsProposal] = useState("");
  const [minimumDate, setMinimumDate] = useState("");

  useEffect(() => {
    if (order) {
      setObsNF(order.obsNF || "");
      setObsPacking(order.obsPacking || "");
      setObsLogistics(order.obsLogistics || "");
      setObsProposal(order.obsProposal || "");
      setMinimumDate(order.minimumDate ? new Date(order.minimumDate).toISOString().split("T")[0] : "");
    }
  }, [order]);

  const handleSubmit = async () => {
    if (!order) return;
    setIsSubmitting(true);
    try {
      await salesService.changeObservations({
        branch: order.branch,
        order: order.order,
        obsNF,
        obsPacking,
        obsLogistics,
        obsProposal,
        minimumDate,
      });
      toast({
        title: t("sales.observationsUpdated"),
        description: t("sales.observationsUpdatedDescription"),
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error changing observations:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("sales.changeObservations")}</DialogTitle>
          <DialogDescription>
            {t("sales.changeObservationsDescription")} — {t("sales.order")}: {order?.order}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("sales.obsNF")}</Label>
            <Textarea value={obsNF} onChange={(e) => setObsNF(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("sales.obsPacking")}</Label>
            <Textarea value={obsPacking} onChange={(e) => setObsPacking(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("sales.obsLogistics")}</Label>
            <Textarea value={obsLogistics} onChange={(e) => setObsLogistics(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("sales.obsProposal")}</Label>
            <Textarea value={obsProposal} onChange={(e) => setObsProposal(e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("sales.minimumDate")}</Label>
            <Input type="date" value={minimumDate} onChange={(e) => setMinimumDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
