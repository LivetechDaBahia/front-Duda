import { useState, useMemo } from "react";
import { CreditHeader } from "@/components/credit/CreditHeader";
import { CreditFilters } from "@/components/credit/CreditFilters";
import { CreditKanbanView } from "@/components/credit/CreditKanbanView";
import { CreditTableView } from "@/components/credit/CreditTableView";
import { CreditDetailPanel } from "@/components/credit/CreditDetailPanel";
import { CreditLogsDialog } from "@/components/credit/CreditLogsDialog";
import { useCredits } from "@/hooks/useCredits";
import { useCreditStatuses } from "@/hooks/useCreditStatuses";
import { creditService } from "@/services/creditService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type {
  CreditElementItem,
  CreditFilters as CreditFiltersType,
} from "@/types/credit";
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

const Credit = () => {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedCredit, setSelectedCredit] =
    useState<CreditElementItem | null>(null);
  const [logsDialogCreditId, setLogsDialogCreditId] = useState<number | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filters, setFilters] = useState<CreditFiltersType>({
    search: "",
    status: "all",
    group: "",
    user: "",
    currency: "",
    type: "",
    valueRange: undefined,
    financial: undefined,
    operation: undefined,
  });

  const { toast } = useToast();

  const {
    credits,
    isLoading: isLoadingCredits,
    error: creditsError,
    refetch: refetchCredits,
  } = useCredits();
  const {
    statuses,
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useCreditStatuses();

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

      // Value range filter (using slider range)
      if (filters.valueRange) {
        const [min, max] = filters.valueRange;
        if (credit.details.value < min || credit.details.value > max) {
          return false;
        }
      }

      // Financial filter
      if (filters.financial && credit.details.financial !== filters.financial) {
        return false;
      }

      // Operation filter
      if (filters.operation && credit.details.operation !== filters.operation) {
        return false;
      }

      // Badge filter
      if (filters.badges && filters.badges.length > 0) {
        const hasBadge = credit.badges?.some((badge) =>
          filters.badges!.includes(badge.id),
        );
        if (!hasBadge) return false;
      }

      return true;
    });
  }, [credits, filters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCredits.length / itemsPerPage);
  const paginatedCredits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCredits.slice(startIndex, endIndex);
  }, [filteredCredits, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleStatusChange = async (creditId: number, newStatusId: string) => {
    try {
      await creditService.updateCreditStatus(creditId, newStatusId);

      toast({
        title: "Status updated",
        description: "Credit status has been successfully updated.",
      });

      refetchCredits();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update credit status.",
      });
    }
  };

  const handleActionsClick = (credit: CreditElementItem, action: string) => {
    if (action === "view-logs") {
      setLogsDialogCreditId(parseInt(credit.key));
    }
  };

  const isLoading = isLoadingCredits || isLoadingStatuses;
  const error = creditsError || statusesError;

  if (isLoading) {
    return (
      <div className="min-h-full max-w-full bg-background">
        <CreditHeader view={view} onViewChange={setView} />
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
        <CreditHeader view={view} onViewChange={setView} />
        <main className="max-w-full">
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
    <div className="min-h-full max-w-full bg-background">
      <CreditHeader view={view} onViewChange={setView} />

      <main className="max-w-full">
        <div className="max-w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-10 pb-4 pt-2 px-4 sm:px-6">
          <CreditFilters
            filters={filters}
            statuses={statuses}
            credits={credits}
            onFiltersChange={setFilters}
          />
        </div>

        <div className="px-4 sm:px-6 pt-4">
          {isLoading ? (
          <div className="space-y-4">
            <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
            <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
            <div className="h-32 w-full animate-pulse bg-muted rounded-lg" />
          </div>
          ) : view === "kanban" ? (
            <CreditKanbanView
              credits={paginatedCredits}
              statuses={statuses}
              onCreditClick={setSelectedCredit}
              onStatusChange={handleStatusChange}
              onActionsClick={handleActionsClick}
            />
          ) : (
            <CreditTableView
              credits={paginatedCredits}
              statuses={statuses}
              onCreditClick={setSelectedCredit}
            />
          )}

          <div className="mt-8 flex items-center justify-between pb-4">
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
        </div>
      </main>

      <CreditDetailPanel
        credit={selectedCredit}
        isOpen={!!selectedCredit}
        onClose={() => setSelectedCredit(null)}
      />

      <CreditLogsDialog
        creditId={logsDialogCreditId}
        isOpen={!!logsDialogCreditId}
        onClose={() => setLogsDialogCreditId(null)}
      />
    </div>
  );
};

export default Credit;
