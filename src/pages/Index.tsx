import { useState, useMemo } from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KanbanView } from "@/components/dashboard/KanbanView";
import { TableView } from "@/components/dashboard/TableView";
import { OrderDetailPanel } from "@/components/dashboard/OrderDetailPanel";
import { OrderFilters, FilterValues } from "@/components/dashboard/OrderFilters";
import { PurchaseOrder, UIOrderStatus } from "@/types/order";
import { useOrders } from "@/hooks/useOrders";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    branch: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const { orders, isLoading, error, updateStatus } = useOrders();

  // Filter orders based on user filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter (ID or supplier name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(searchLower);
        const matchesSupplier = order.supplierName.toLowerCase().includes(searchLower);
        if (!matchesId && !matchesSupplier) return false;
      }

      // Status filter
      if (filters.status !== "all" && order.status !== filters.status) {
        return false;
      }

      // Branch filter
      if (filters.branch && !order.branch.toLowerCase().includes(filters.branch.toLowerCase())) {
        return false;
      }

      // Date range filter
      const orderDate = new Date(order.createdAt);
      if (filters.dateFrom && orderDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo);
        dateTo.setHours(23, 59, 59, 999); // Include the entire day
        if (orderDate > dateTo) {
          return false;
        }
      }

      return true;
    });
  }, [orders, filters]);

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
        <div className="mb-6">
          <OrderFilters onFilterChange={setFilters} />
        </div>

        {viewMode === "kanban" ? (
          <KanbanView
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TableView
            orders={filteredOrders}
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
