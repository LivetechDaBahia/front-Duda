import { useState, useMemo } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KanbanView } from "@/components/dashboard/KanbanView";
import { TableView } from "@/components/dashboard/TableView";
import { OrderDetailPanel } from "@/components/dashboard/OrderDetailPanel";
import {
  OrderFilters,
  FilterValues,
} from "@/components/dashboard/OrderFilters";
import { PurchaseOrder, UIOrderStatus } from "@/types/order";
import { useOrders } from "@/hooks/useOrders";
import { useBranches } from "@/hooks/useBranches";
import { Loader2 } from "lucide-react";
import { mapUIStatusToAPITypes, formatDateForAPI } from "@/lib/statusMapper";

const Index = () => {
  const isDev = (import.meta as any).env?.DEV;
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
    showInBRL: false,
  });

  // Pass API-level filters to useOrders
  const tenantForHook = filters.branch ? `01,${filters.branch}` : "01";
  if (isDev) {
    console.log("[Index] useOrders.params", {
      dateBegin: formatDateForAPI(filters.dateFrom),
      dateEnd: formatDateForAPI(filters.dateTo),
      types: mapUIStatusToAPITypes(filters.status),
      tenantId: tenantForHook,
      filters,
    });
  }
  const { orders, isLoading, error, approveOrder, declineOrder, revertOrder } =
    useOrders({
      dateBegin: formatDateForAPI(filters.dateFrom),
      dateEnd: formatDateForAPI(filters.dateTo),
      types: mapUIStatusToAPITypes(filters.status),
      tenantId: tenantForHook,
    });

  const { branches, isLoading: isLoadingBranches } = useBranches();

  // Filter orders based on user filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter (ID or supplier name)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(searchLower);
        const matchesSupplier = order.supplierName
          .toLowerCase()
          .includes(searchLower);
        if (!matchesId && !matchesSupplier) return false;
      }

      // Status filter
      if (filters.status !== "all" && order.status !== filters.status) {
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
    if (isDev)
      console.log("[Index] handleOrderClick", {
        orderId: order.id,
        orderBranch: order.branch,
      });
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: UIOrderStatus) => {
    if (isDev) {
      const ord = orders.find((o) => o.id === orderId);
      console.log("[Index] handleStatusChange", {
        orderId,
        newStatus,
        orderBranch: ord?.branch,
      });
    }
    if (newStatus === "approved") {
      approveOrder(orderId);
    } else if (newStatus === "declined") {
      declineOrder(orderId);
    }
  };

  const handleRevertOrder = (orderId: string) => {
    if (isDev) {
      const ord = orders.find((o) => o.id === orderId);
      console.log("[Index] handleRevertOrder", {
        orderId,
        orderBranch: ord?.branch,
      });
    }
    revertOrder(orderId);
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />
        <main className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-background">
        <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />
        <main className="container mx-auto">
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
    <div className="min-h-full bg-background">
      <DashboardHeader viewMode={viewMode} onViewChange={setViewMode} />

      <main className="container mt-3 mx-auto">
        <div className="mb-6">
          <OrderFilters
            onFilterChange={setFilters}
            branches={branches}
            isLoadingBranches={isLoadingBranches}
            selectedBranch={filters.branch}
          />
        </div>

        {viewMode === "kanban" ? (
          <KanbanView
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
            onRevertOrder={handleRevertOrder}
            showInBRL={filters.showInBRL}
          />
        ) : (
          <TableView
            orders={filteredOrders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
            onRevertOrder={handleRevertOrder}
            showInBRL={filters.showInBRL}
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
