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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [newOrder, setNewOrder] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !/^\d+$/.test(value)) return;

    setNewOrder(value);

    const num = Number(value);
    if (value && (num < 1 || num > 999)) {
      setError(t("sales.newOrderError"));
    } else {
      setError("");
    }
  };

  const isValid = newOrder !== "" && !error;

  const handleConfirm = async () => {
    if (!item || !isValid) return;
    setIsSubmitting(true);
    try {
      await salesService.reallocateItem({
        branch: item.branch,
        order: item.order,
        product: item.product,
        sequence: item.sequence,
        batch: item.batch,
        proposal: item.offer,
        newOrder: newOrder,
      });
      toast({
        title: t("sales.reallocateSuccess"),
        description: t("sales.reallocateSuccessDescription"),
      });
      onSuccess?.();
      handleClose();
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

  const handleClose = () => {
    setNewOrder("");
    setError("");
    onClose();
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleClose()}>
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-order">
            {t("sales.newSequence")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="new-order"
            inputMode="numeric"
            placeholder="1 – 999"
            value={newOrder}
            onChange={handleOrderChange}
            disabled={isSubmitting}
            maxLength={3}
            className={
              error ? "border-destructive focus-visible:ring-destructive" : ""
            }
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting} onClick={handleClose}>
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? t("common.processing") : t("common.confirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
