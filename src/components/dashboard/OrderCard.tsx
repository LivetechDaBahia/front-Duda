import { PurchaseOrder, UIOrderStatus } from "@/types/order";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, User, RotateCcw } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface OrderCardProps {
  order: PurchaseOrder;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, orderId: string) => void;
  onRevertOrder?: (orderId: string) => void;
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
}: OrderCardProps) => {
  const { t } = useLocale();

  const handleDragStart = (e: React.DragEvent) => {
    if (onDragStart) {
      onDragStart(e, order.id);
    }
  };

  return (
    <Card
      className="p-4 cursor-grab active:cursor-grabbing transition-all hover:shadow-md hover:scale-[1.02] animate-scale-in bg-gradient-to-br from-card to-card/50 w-full"
      onClick={onClick}
      draggable={!!onDragStart}
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
          <Badge className={statusColors[order.status]}>
            {t(`status.${order.status}`)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {t("order.value")}
            </span>
            <span className="font-semibold text-foreground">
              ${(order.value || 0).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {t("order.dueDate")}
            </span>
            <span className="font-medium text-foreground">
              {new Date(order.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Revert button for approved/declined orders */}
        {(order.status === "approved" || order.status === "declined") &&
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
};
