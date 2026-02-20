import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesKanbanView } from "@/components/sales/SalesKanbanView";
import { SalesTableView } from "@/components/sales/SalesTableView";
import { SalesDetailPanel } from "@/components/sales/SalesDetailPanel";
import { mockSalesItems, mockSalesStatuses } from "@/data/mockSales";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/shared/AccessDenied";
import type { SalesItem, SalesFilters as SalesFiltersType } from "@/types/sales";

const Sales = () => {
  const { canViewSales } = usePermissions();
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedItem, setSelectedItem] = useState<SalesItem | null>(null);
  const [filters, setFilters] = useState<SalesFiltersType>({
    search: "",
    status: "all",
    type: "",
    seller: "",
  });

  if (!canViewSales) {
    return <AccessDenied />;
  }

  const filteredItems = mockSalesItems.filter((item) => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const matches =
        item.offer.toLowerCase().includes(s) ||
        item.client.toLowerCase().includes(s) ||
        item.clientName.toLowerCase().includes(s);
      if (!matches) return false;
    }
    if (filters.status !== "all" && item.statusId !== filters.status) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.seller && item.sellerName !== filters.seller) return false;
    return true;
  });

  return (
    <div className="min-h-full max-w-full bg-background">
      <PageHeader
        title="Sales Management"
        subtitle="Track and manage your sales pipeline"
        view={view}
        onViewChange={setView}
      />

      <main className="max-w-full">
        <div className="max-w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-10 pb-4 pt-2 px-4 sm:px-6">
          <SalesFilters
            filters={filters}
            statuses={mockSalesStatuses}
            items={mockSalesItems}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="px-4 sm:px-6 pt-4">
          {view === "kanban" ? (
            <SalesKanbanView
              items={filteredItems}
              statuses={mockSalesStatuses}
              onItemClick={setSelectedItem}
            />
          ) : (
            <SalesTableView
              items={filteredItems}
              statuses={mockSalesStatuses}
              onItemClick={setSelectedItem}
            />
          )}
        </div>
      </main>

      <SalesDetailPanel
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default Sales;
