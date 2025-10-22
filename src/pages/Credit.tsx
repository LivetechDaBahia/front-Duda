import { useState, useMemo } from "react";
import { CreditHeader } from "@/components/credit/CreditHeader";
import { CreditFilters } from "@/components/credit/CreditFilters";
import { CreditKanbanView } from "@/components/credit/CreditKanbanView";
import { CreditTableView } from "@/components/credit/CreditTableView";
import { CreditDetailPanel } from "@/components/credit/CreditDetailPanel";
import { useCredits } from "@/hooks/useCredits";
import { useCreditStatuses } from "@/hooks/useCreditStatuses";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load credit data"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <CreditHeader view={view} onViewChange={setView} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CreditFilters
            filters={filters}
            statuses={statuses}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
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
        </div>
      </div>

      <CreditDetailPanel
        credit={selectedCredit}
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
      />
    </div>
  );
};

export default Credit;
