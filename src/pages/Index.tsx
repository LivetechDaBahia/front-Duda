import { useState } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KanbanView } from "@/components/dashboard/KanbanView";
import { TableView } from "@/components/dashboard/TableView";
import { OrderDetailPanel } from "@/components/dashboard/OrderDetailPanel";
import { PurchaseOrder, UIOrderStatus } from "@/types/order";
import { useOrders } from "@/hooks/useOrders";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { orders, isLoading, error, updateStatus } = useOrders();

  const handleOrderClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: UIOrderStatus) => {
    updateStatus({ orderId, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading orders</p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />

      <main className="container mx-auto px-6 py-8">
        {viewMode === "kanban" ? (
          <KanbanView
            orders={orders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TableView
            orders={orders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>

      <OrderDetailPanel
        order={selectedOrder}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
};

export default Index;
