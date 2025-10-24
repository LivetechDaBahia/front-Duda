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
import { Loader2 } from "lucide-react";
import { mapUIStatusToAPITypes, formatDateForAPI } from "@/lib/statusMapper";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ItemsPerPageSelector } from "@/components/shared/ItemsPerPageSelector";

const Index = () => {
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(
    null,
  );
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filters, setFilters] = useState<FilterValues>({
    search: "",
    status: "all",
    branch: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Pass API-level filters to useOrders
  const { orders, isLoading, error, approveOrder, declineOrder } = useOrders({
    dateBegin: formatDateForAPI(filters.dateFrom),
    dateEnd: formatDateForAPI(filters.dateTo),
    types: mapUIStatusToAPITypes(filters.status),
    tenantId: "01",
  });

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

      // Branch filter
      if (
        filters.branch &&
        !order.branch.toLowerCase().includes(filters.branch.toLowerCase())
      ) {
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

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleOrderClick = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsPanelOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: UIOrderStatus) => {
    // Map UI status changes to approve/decline actions
    if (newStatus === "approved" || newStatus === "completed") {
      approveOrder(orderId);
    } else if (newStatus === "declined" || newStatus === "cancelled") {
      declineOrder(orderId);
    }
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

      <main className="container mx-auto">
        <div className="mb-6">
          <OrderFilters onFilterChange={setFilters} />
        </div>

        {viewMode === "kanban" ? (
          <KanbanView
            orders={paginatedOrders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <TableView
            orders={paginatedOrders}
            onOrderClick={handleOrderClick}
            onStatusChange={handleStatusChange}
          />
        )}

        <div className="mt-8 flex items-center justify-between">
          <ItemsPerPageSelector
            value={itemsPerPage}
            onChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
          />

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <PaginationItem key={page}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return null;
                  },
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
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
