import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocale } from "@/contexts/LocaleContext";
import { salesService } from "@/services/salesService";
import { toast } from "@/hooks/use-toast";
import type { SalesElementItemDetails } from "@/types/sales";

interface DeallocateItemDialogProps {
  item: SalesElementItemDetails | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DeallocateItemDialog = ({
  item,
  open,
  onClose,
  onSuccess,
}: DeallocateItemDialogProps) => {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await salesService.deallocateItem({
        branch: item.branch,
        order: item.order,
        product: item.product,
        sequence: item.sequence,
        batch: item.batch,
        proposal: item.offer,
      });
      toast({
        title: t("sales.deallocateSuccess"),
        description: t("sales.deallocateSuccessDescription"),
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const message =
        error?.parsed?.message || error?.message || "Erro ao realocar item";

      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("sales.deallocateTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("sales.deallocateDescription")} <br />
            <span className="font-medium">
              {item?.product} — {item?.description}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? t("common.processing") : t("common.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
