import { PurchaseOrderItem, OrderStatus } from "@/types/order";
import { OrderCard } from "./OrderCard";
import { useState } from "react";

interface KanbanViewProps {
  orders: PurchaseOrderItem[];
  onOrderClick: (order: PurchaseOrderItem) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const columns: { status: OrderStatus; label: string; color: string }[] = [
  { status: "pending", label: "Pending", color: "border-warning" },
  { status: "processing", label: "Processing", color: "border-info" },
  {
    status: "approved",
    label: "Approved",
    color: "border-[hsl(var(--success))]",
  },
  {
    status: "completed",
    label: "Completed",
    color: "border-[hsl(var(--success))]",
  },
  { status: "declined", label: "Declined", color: "border-destructive" },
  { status: "cancelled", label: "Cancelled", color: "border-destructive" },
];

// Best-effort mapping from item status fields to UI OrderStatus
const mapStatus = (item: PurchaseOrderItem): OrderStatus => {
  const s = `${item.statusCode ?? ""} ${item.statusDescription ?? ""}`
    .toLowerCase()
    .trim();
  if (s.includes("approved") || s.includes("aprov")) return "approved";
  if (s.includes("declined") || s.includes("reprov")) return "declined";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("complete") || s.includes("finaliz") || s.includes("done"))
    return "completed";
  if (s.includes("process") || s.includes("em and") || s.includes("ongoing"))
    return "processing";
  return "pending";
};

export const KanbanView = ({
  orders,
  onOrderClick,
  onStatusChange,
}: KanbanViewProps) => {
  const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<OrderStatus | null>(
    null,
  );

  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    setDraggedOrderId(orderId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: OrderStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: OrderStatus) => {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
      {columns.map(({ status, label, color }) => {
        const columnOrders = orders.filter(
          (order) => mapStatus(order) === status,
        );

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
                  key={order.document}
                  order={order}
                  onClick={() => onOrderClick(order)}
                  onDragStart={handleDragStart}
                />
              ))}

              {columnOrders.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                  No orders
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
