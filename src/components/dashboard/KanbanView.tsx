import { PurchaseOrder, UIOrderStatus, isOrderLocked } from "@/types/order";
import { OrderCard } from "./OrderCard";
import { useState, useRef } from "react";
import { useLocale } from "@/contexts/LocaleContext.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface KanbanViewProps {
  orders: PurchaseOrder[];
  onOrderClick: (order: PurchaseOrder) => void;
  onStatusChange: (orderId: string, newStatus: UIOrderStatus) => void;
  onRevertOrder: (orderId: string) => void;
  showInBRL?: boolean;
}

export const KanbanView = ({
  orders,
  onOrderClick,
  onStatusChange,
  onRevertOrder,
  showInBRL = false,
}: KanbanViewProps) => {
  const { t } = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const columns: { status: UIOrderStatus; label: string; color: string }[] = [
    { status: "pending", label: t("status.pending"), color: "border-warning" },
    {
      status: "approved",
      label: t("status.approved"),
      color: "border-[hsl(var(--success))]",
    },
    {
      status: "declined",
      label: t("status.declined"),
      color: "border-destructive",
    },
  ];
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<UIOrderStatus | null>(
    null,
  );

  // Enable auto-scroll when dragging
  useAutoScroll(scrollContainerRef, draggedOrderId !== null);

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: UIOrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: UIOrderStatus) => {
    e.preventDefault();
    if (draggedOrderId) {
      const draggedOrder = orders.find((o) => o.id === draggedOrderId);
      if (draggedOrder && isOrderLocked(draggedOrder)) {
        // Don't allow status change for locked orders
        setDraggedOrderId(null);
        setDragOverColumn(null);
        return;
      }
      onStatusChange(draggedOrderId, newStatus);
    }
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedOrderId(null);
    setDragOverColumn(null);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6"
    >
      {columns.map(({ status, label, color }) => {
        const columnOrders = orders.filter((order) => order.status === status);
        const isDragOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className={`rounded-lg border bg-card transition-colors flex flex-col max-h-[calc(100vh-280px)] ${
              isDragOver ? "border-primary bg-accent/50" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={`p-3 sm:p-4 border-b-2 ${color}`}>
              <h3 className="font-semibold text-sm sm:text-base flex items-center justify-between">
                {label}
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {columnOrders.length}
                </span>
              </h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="space-y-3 p-3 sm:p-4">
                {columnOrders.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                    {t("kanban.noOrders")}
                  </div>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => onOrderClick(order)}
                      onDragStart={handleDragStart}
                      onRevertOrder={onRevertOrder}
                      showInBRL={showInBRL}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};
