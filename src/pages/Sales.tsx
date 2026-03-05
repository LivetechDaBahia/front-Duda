import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesKanbanView } from "@/components/sales/SalesKanbanView";
import { SalesTableView } from "@/components/sales/SalesTableView";
import { SalesDetailPanel } from "@/components/sales/SalesDetailPanel";
import { SalesAssignmentDialog } from "@/components/sales/SalesAssignmentDialog";
import { useSales } from "@/hooks/useSales";
import { useSalesStages } from "@/hooks/useSalesStages";
import { usePermissions } from "@/hooks/usePermissions";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useLocale } from "@/contexts/LocaleContext";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Loader2 } from "lucide-react";
import type { SalesElementItem, SalesFilters as SalesFiltersType } from "@/types/sales";

const Sales = () => {
  const { canViewSales } = usePermissions();
  const { handleError } = useErrorHandler();
  const { t } = useLocale();

  const { items, isLoading: isLoadingItems, error: itemsError, refetch } = useSales();
  const { stages, isLoading: isLoadingStages, error: stagesError } = useSalesStages();

  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedItem, setSelectedItem] = useState<SalesElementItem | null>(null);
  const [assignItem, setAssignItem] = useState<SalesElementItem | null>(null);
  const [filters, setFilters] = useState<SalesFiltersType>({
    search: "",
    status: "all",
    type: "",
    seller: "",
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matches =
          item.offer.toLowerCase().includes(s) ||
          item.client.toLowerCase().includes(s) ||
          item.sellerName.toLowerCase().includes(s) ||
          item.clientBranch.toLowerCase().includes(s);
        if (!matches) return false;
      }
      if (filters.status !== "all" && item.stageId !== filters.status) return false;
      if (filters.type && item.type !== filters.type) return false;
      if (filters.seller && item.sellerName !== filters.seller) return false;
      return true;
    });
  }, [items, filters]);

  if (!canViewSales) {
    return <AccessDenied />;
  }

  const isLoading = isLoadingItems || isLoadingStages;
  const error = itemsError || stagesError;

  if (error) {
    handleError(error);
  }

  if (isLoading) {
    return (
      <div className="min-h-full max-w-full bg-background">
        <PageHeader
          title={t("sales.title")}
          subtitle={t("sales.subtitle")}
          view={view}
          onViewChange={setView}
        />
        <main className="max-w-full">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full max-w-full bg-background">
        <PageHeader
          title={t("sales.title")}
          subtitle={t("sales.subtitle")}
          view={view}
          onViewChange={setView}
        />
        <main className="max-w-full">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">{t("sales.errorLoading")}</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full max-w-full bg-background">
      <PageHeader
        title={t("sales.title")}
        subtitle={t("sales.subtitle")}
        view={view}
        onViewChange={setView}
      />

      <main className="max-w-full">
        <div className="max-w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-10 pb-4 pt-2 px-4 sm:px-6">
          <SalesFilters
            filters={filters}
            stages={stages}
            items={items}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="px-4 sm:px-6 pt-4">
          {view === "kanban" ? (
            <SalesKanbanView
              items={filteredItems}
              stages={stages}
              onItemClick={setSelectedItem}
            />
          ) : (
            <SalesTableView
              items={filteredItems}
              stages={stages}
              onItemClick={setSelectedItem}
            />
          )}
        </div>
      </main>

      <SalesDetailPanel
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onAssignClick={(item) => {
          setSelectedItem(null);
          setAssignItem(item);
        }}
      />

      <SalesAssignmentDialog
        item={assignItem}
        isOpen={!!assignItem}
        onClose={() => setAssignItem(null)}
        onAssignSuccess={() => {
          setAssignItem(null);
          refetch();
        }}
      />
    </div>
  );
};

export default Sales;
