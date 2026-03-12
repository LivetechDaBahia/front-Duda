import { PurchaseOrder, isOrderLocked } from "@/types/order";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, User, RotateCcw, Lock } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDateDDMMYYYY } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OrderCardProps {
  order: PurchaseOrder;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, orderId: string) => void;
  onRevertOrder?: (orderId: string) => void;
  showInBRL?: boolean;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved:
    "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
  declined: "bg-destructive/10 text-destructive border-destructive/20",
};

export const OrderCard = ({
  order,
  onClick,
  onDragStart,
  onRevertOrder,
  showInBRL = false,
}: OrderCardProps) => {
  const { t } = useLocale();
  const isLocked = isOrderLocked(order);

  const displayAmount =
    showInBRL && order.currencyRate
      ? order.amount * order.currencyRate
      : order.amount;
  const displaySymbol = showInBRL ? "R$" : order.coinSymbol;

  const handleDragStart = (e: React.DragEvent) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    if (onDragStart) {
      onDragStart(e, order.id);
    }
  };

  const cardContent = (
    <Card
      className={`p-4 transition-all hover:shadow-md animate-scale-in bg-gradient-to-br from-card to-card/50 w-full ${
        isLocked
          ? "opacity-60 cursor-not-allowed"
          : "cursor-grab active:cursor-grabbing hover:scale-[1.02]"
      }`}
      onClick={onClick}
      draggable={!isLocked && !!onDragStart}
      onDragStart={handleDragStart}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{order.id}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              {order.supplierName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[order.status]}>
              {t(`status.${order.status}`)}
            </Badge>
            {isLocked && (
              <Badge className="bg-muted text-muted-foreground border-muted-foreground/20">
                <Lock className="w-3 h-3" />
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {t("order.value")}
            </span>
            <span className="font-semibold text-foreground">
              {displaySymbol}{" "}
              {displayAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t("order.dueDate")}
            </span>
            <span className="font-medium text-foreground">
              {formatDateDDMMYYYY(order.createdAt)}
            </span>
          </div>
        </div>

        {/* Revert button for approved orders */}
        {order.status === "approved" &&
          onRevertOrder && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full text-warning hover:text-warning hover:bg-warning/10"
              onClick={(e) => {
                e.stopPropagation();
                onRevertOrder(order.id);
              }}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              {t("order.revertToPending")}
            </Button>
          )}
      </div>
    </Card>
  );

  if (isLocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{cardContent}</TooltipTrigger>
          <TooltipContent>
            <p>{t("order.lockedTooltip")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cardContent;
};
