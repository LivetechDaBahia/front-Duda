import { useEffect, useMemo } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { SalesKanbanView } from "@/components/sales/SalesKanbanView";
import { SalesTableView } from "@/components/sales/SalesTableView";
import { SalesDetailPanel } from "@/components/sales/SalesDetailPanel";
import { SalesAssignmentDialog } from "@/components/sales/SalesAssignmentDialog";
import { AllocationCodeDialog } from "@/components/sales/AllocationCodeDialog";
import { useSales } from "@/hooks/useSales";
import { useSalesStages } from "@/hooks/useSalesStages";
import { usePermissions } from "@/hooks/usePermissions";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useLocale } from "@/contexts/LocaleContext";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Loader2 } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useSalesUIStore } from "@/store/useSalesUIStore";
import { matchesSearchTerm } from "@/utils/search";

const Sales = () => {
  const { canViewSales } = usePermissions();
  const { handleError } = useErrorHandler();
  const { t } = useLocale();

  const {
    items,
    variationsMap,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch,
  } = useSales();
  const {
    stages,
    isLoading: isLoadingStages,
    error: stagesError,
  } = useSalesStages();

  const view = useSalesUIStore((state) => state.view);
  const dateSort = useSalesUIStore((state) => state.dateSort);
  const activeSearchType = useSalesUIStore((state) => state.activeSearchType);
  const allocationCodeSearch = useSalesUIStore(
    (state) => state.allocationCodeSearch,
  );
  const submittedAllocationCode = useSalesUIStore(
    (state) => state.submittedAllocationCode,
  );
  const allocationSearchRequestId = useSalesUIStore(
    (state) => state.allocationSearchRequestId,
  );
  const allocationSearchDialogOpen = useSalesUIStore(
    (state) => state.allocationSearchDialogOpen,
  );
  const selectedItem = useSalesUIStore((state) => state.selectedItem);
  const assignItem = useSalesUIStore((state) => state.assignItem);
  const filters = useSalesUIStore((state) => state.filters);
  const setView = useSalesUIStore((state) => state.setView);
  const setDateSort = useSalesUIStore((state) => state.setDateSort);
  const setSelectedItem = useSalesUIStore((state) => state.setSelectedItem);
  const setAssignItem = useSalesUIStore((state) => state.setAssignItem);
  const closeAllocationSearchDialog = useSalesUIStore(
    (state) => state.closeAllocationSearchDialog,
  );
  const resetState = useSalesUIStore((state) => state.resetState);

  useEffect(() => {
    resetState();
    return () => resetState();
  }, [resetState]);

  const filteredItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (activeSearchType === "allocationCode") {
        return true;
      }

      const searchValue =
        typeof filters.search === "string" ? filters.search : "";

      if (searchValue) {
        const offerValue = item.offer ?? "";
        const clientValue = item.client ?? "";
        const matchesSearch = matchesSearchTerm(searchValue, {
          textFields: [offerValue, clientValue, item.clientName, item.name],
          digitFields: [offerValue, clientValue],
        });

        if (!matchesSearch) return false;
      }
      if (filters.status !== "all" && item.stageId !== filters.status) {
        return false;
      }
      if (filters.type && item.type !== filters.type) return false;
      if (filters.seller && item.sellerName !== filters.seller) return false;
      if (
        filters.name &&
        !item.name?.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }
      if (filters.sellerGroup && item.sellerGroup !== filters.sellerGroup) {
        return false;
      }
      if (filters.salesGroup && item.groupName !== filters.salesGroup) {
        return false;
      }
      return true;
    });

    if (dateSort) {
      filtered.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateSort === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  }, [items, filters, activeSearchType, dateSort]);

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
          <SalesFilters stages={stages} items={items} />
        </div>

        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-200px)]"
        >
          <ResizablePanel defaultSize={selectedItem ? 50 : 100} minSize={25}>
            <div className="px-4 sm:px-6 pt-4 h-full overflow-auto">
              {view === "kanban" ? (
                <SalesKanbanView
                  items={filteredItems}
                  stages={stages}
                  variationsMap={variationsMap}
                  onItemClick={setSelectedItem}
                />
              ) : (
                <SalesTableView
                  items={filteredItems}
                  stages={stages}
                  variationsMap={variationsMap}
                  onItemClick={setSelectedItem}
                  dateSort={dateSort}
                  onDateSortChange={setDateSort}
                />
              )}
            </div>
          </ResizablePanel>

          {selectedItem && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={25} maxSize={75}>
                <SalesDetailPanel
                  item={selectedItem}
                  isOpen={!!selectedItem}
                  variations={
                    variationsMap.get(
                      `${selectedItem.id}-${selectedItem.key}`,
                    ) || []
                  }
                  onClose={() => setSelectedItem(null)}
                  onAssignClick={(item) => {
                    setSelectedItem(null);
                    setAssignItem(item);
                  }}
                />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>

      <SalesAssignmentDialog
        item={assignItem}
        isOpen={!!assignItem}
        onClose={() => setAssignItem(null)}
        onAssignSuccess={() => {
          setAssignItem(null);
          refetch();
        }}
      />

      <AllocationCodeDialog
        allocationCode={submittedAllocationCode || null}
        allocationName={submittedAllocationCode || undefined}
        open={allocationSearchDialogOpen}
        onClose={closeAllocationSearchDialog}
      />
    </div>
  );
};

export default Sales;
