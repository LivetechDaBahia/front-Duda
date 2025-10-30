import { PurchaseOrder, UIOrderStatus } from "@/types/order";
import { OrderCard } from "./OrderCard";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext.tsx";

interface KanbanViewProps {
  orders: PurchaseOrder[];
  onOrderClick: (order: PurchaseOrder) => void;
  onStatusChange: (orderId: string, newStatus: UIOrderStatus) => void;
}

export const KanbanView = ({
  orders,
  onOrderClick,
  onStatusChange,
}: KanbanViewProps) => {
  const { t } = useLocale();

  const columns: { status: UIOrderStatus; label: string; color: string }[] = [
    { status: "pending", label: t("status.pending"), color: "border-info" },
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
      className="grid gap-6 animate-fade-in"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
      }}
    >
      {columns.map(({ status, label, color }) => {
        const columnOrders = orders.filter((order) => order.status === status);

        const isDragOver = dragOverColumn === status;

        return (
          <div key={status} className="flex flex-col">
            <div className={`mb-4 pb-2 border-b-2 ${color}`}>
              <h3 className="font-semibold text-foreground flex items-center justify-between">
                {label}
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {columnOrders.length}
                </span>
              </h3>
            </div>

            <div
              className={`space-y-3 flex-1 min-h-[200px] rounded-lg transition-all ${
                isDragOver
                  ? "bg-primary/5 border-2 border-dashed border-primary"
                  : "border-2 border-transparent"
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {columnOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onClick={() => onOrderClick(order)}
                  onDragStart={handleDragStart}
                />
              ))}

              {columnOrders.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                  {t("kanban.noOrders")}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
