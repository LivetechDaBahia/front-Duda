import { useState, useMemo } from "react";
import { CreditHeader } from "@/components/credit/CreditHeader";
import { CreditFilters } from "@/components/credit/CreditFilters";
import { CreditKanbanView } from "@/components/credit/CreditKanbanView";
import { CreditTableView } from "@/components/credit/CreditTableView";
import { CreditDetailPanel } from "@/components/credit/CreditDetailPanel";
import { useCredits } from "@/hooks/useCredits";
import { useCreditStatuses } from "@/hooks/useCreditStatuses";
import { Loader2 } from "lucide-react";
import type { CreditElementItem, CreditFilters as CreditFiltersType } from "@/types/credit";

const Credit = () => {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedCredit, setSelectedCredit] = useState<CreditElementItem | null>(null);
  const [filters, setFilters] = useState<CreditFiltersType>({
    search: "",
    status: "all",
    group: "",
    user: "",
    currency: "",
    type: "",
  });

  const { credits, isLoading: isLoadingCredits, error: creditsError } = useCredits();
  const { statuses, isLoading: isLoadingStatuses, error: statusesError } = useCreditStatuses();

  const filteredCredits = useMemo(() => {
    return credits.filter((credit) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
          credit.details.offer.toLowerCase().includes(searchLower) ||
          credit.details.client.toLowerCase().includes(searchLower) ||
          credit.name.toLowerCase().includes(searchLower) ||
          credit.key.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && credit.statusId !== filters.status) {
        return false;
      }

      // Group filter
      if (filters.group && credit.group !== filters.group) {
        return false;
      }

      // User filter
      if (filters.user && credit.user !== filters.user) {
        return false;
      }

      // Currency filter
      if (filters.currency && credit.details.currency !== filters.currency) {
        return false;
      }

      // Type filter
      if (filters.type && credit.details.type !== filters.type) {
        return false;
      }

      // Value range filters
      if (filters.minValue !== undefined && credit.details.value < filters.minValue) {
        return false;
      }
      if (filters.maxValue !== undefined && credit.details.value > filters.maxValue) {
        return false;
      }

      return true;
    });
  }, [credits, filters]);

  const isLoading = isLoadingCredits || isLoadingStatuses;
  const error = creditsError || statusesError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CreditHeader view={view} onViewChange={setView} />
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
        <CreditHeader view={view} onViewChange={setView} />
        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">Error loading credit data</p>
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
    <div className="min-h-screen bg-background">
      <CreditHeader view={view} onViewChange={setView} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <CreditFilters
            filters={filters}
            statuses={statuses}
            onFiltersChange={setFilters}
          />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
            <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
            <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
          </div>
        ) : view === "kanban" ? (
          <CreditKanbanView
            credits={filteredCredits}
            statuses={statuses}
            onCreditClick={setSelectedCredit}
          />
        ) : (
          <CreditTableView
            credits={filteredCredits}
            statuses={statuses}
            onCreditClick={setSelectedCredit}
          />
        )}
      </main>

      <CreditDetailPanel
        credit={selectedCredit}
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
      />
    </div>
  );
};

export default Credit;
