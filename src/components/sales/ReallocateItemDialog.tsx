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

interface ReallocateItemDialogProps {
  item: SalesElementItemDetails | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReallocateItemDialog = ({
  item,
  open,
  onClose,
  onSuccess,
}: ReallocateItemDialogProps) => {
  const { t } = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!item) return;
    setIsSubmitting(true);
    try {
      await salesService.reallocateItem({
        branch: item.branch,
        order: item.order,
        product: item.product,
        sequence: item.sequence,
        batch: item.batch,
        proposal: item.offer,
      });
      toast({
        title: t("sales.reallocateSuccess"),
        description: t("sales.reallocateSuccessDescription"),
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error reallocating item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("sales.reallocateTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("sales.reallocateDescription")} <br />
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
