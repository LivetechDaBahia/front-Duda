import { useState, useMemo } from "react";
import { CreditHeader } from "@/components/credit/CreditHeader";
import { CreditFilters } from "@/components/credit/CreditFilters";
import { CreditKanbanView } from "@/components/credit/CreditKanbanView";
import { CreditTableView } from "@/components/credit/CreditTableView";
import { CreditDetailPanel } from "@/components/credit/CreditDetailPanel";
import { CreditLogsDialog } from "@/components/credit/CreditLogsDialog";
import { CreditJustificationDialog } from "@/components/credit/CreditJustificationDialog";
import { CreditAssignmentDialog } from "@/components/credit/CreditAssignmentDialog";
import { useCredits } from "@/hooks/useCredits";
import { useCreditStatuses } from "@/hooks/useCreditStatuses";
import { creditService } from "@/services/creditService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import type {
  CreditElementItem,
  CreditFilters as CreditFiltersType,
  UpdateCreditStatusDto,
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
import { formatOfferId } from "@/utils/offer";

const Credit = () => {
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedCredit, setSelectedCredit] =
    useState<CreditElementItem | null>(null);
  const [logsDialogCreditId, setLogsDialogCreditId] = useState<number | null>(
    null,
  );
  const [loadingCreditId, setLoadingCreditId] = useState<number | null>(null);
  const [assignmentDialogCredit, setAssignmentDialogCredit] =
    useState<CreditElementItem | null>(null);
  const [justificationDialog, setJustificationDialog] = useState<{
    creditId: number;
    offerId: string;
    newStatusId: string;
    statusName: string;
  } | null>(null);
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
  const { user } = useAuth();

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

  const handleStatusChange = async (
    creditId: number,
    offerId: string,
    newStatusId: string,
  ) => {
    // If moving to success status (S004), skip justification
    if (newStatusId === "S004") {
      await executeStatusChange(creditId, offerId, newStatusId, "");
      return;
    }

    // For other statuses, show justification dialog
    const status = statuses.find((s) => s.id === newStatusId);
    setJustificationDialog({
      creditId,
      offerId,
      newStatusId,
      statusName: status?.description || newStatusId,
    });
  };

  const executeStatusChange = async (
    creditId: number,
    offerId: string,
    newStatusId: string,
    justification: string,
  ) => {
    try {
      setLoadingCreditId(creditId);

      const current = credits.find((c) => c.id === creditId);
      if (!current) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Credit not found to update status.",
        });
        return;
      }

      // Extract required values
      const emailVal = user?.email ?? "";
      const branchVal = current.details.clientBranch ?? "";
      const clientIdVal = current.details.client ?? "";
      const sellerNameVal = current.details.sellerName ?? "";
      // Seller ID must be parsed from sellerName (format: "000817 - Full Name")
      const sellerIdVal = (() => {
        const match = sellerNameVal.match(/^\s*(\d+)\s*-/);
        return match ? match[1] : "";
      })();

      // Offer ID comes masked like "01-801185/00"; we must send digits only
      const offerIdVal = formatOfferId(current.details.offer);

      // Validate required values before sending
      const missingFields: string[] = [];
      if (!emailVal) missingFields.push("email");
      if (!branchVal) missingFields.push("branch");
      if (!clientIdVal) missingFields.push("item.clientId");
      if (!sellerNameVal) missingFields.push("item.sellerName");
      if (!sellerIdVal) missingFields.push("item.sellerId");
      if (!offerIdVal) missingFields.push("item.id (offer)");

      if (missingFields.length > 0) {
        toast({
          variant: "destructive",
          title: "Missing data",
          description: `Cannot update status. Missing: ${missingFields.join(", ")}`,
        });
        return;
      }

      const payload: UpdateCreditStatusDto = {
        status: newStatusId,
        oldStatus: current.statusId,
        email: emailVal,
        branch: branchVal,
        item: {
          id: offerIdVal,
          clientId: clientIdVal,
          sellerName: sellerNameVal,
          sellerId: sellerIdVal,
        },
        ...(justification && { justification }),
      };

      await creditService.updateCreditStatus(payload);

      toast({
        title: "Status updated",
        description: "Credit status has been successfully updated.",
      });

      await refetchCredits();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update credit status.",
      });
    } finally {
      setLoadingCreditId(null);
    }
  };

  const handleActionsClick = async (
    credit: CreditElementItem,
    action: string,
  ) => {
    if (action === "view-logs") {
      setLogsDialogCreditId(parseInt(credit.key));
    } else if (action === "assign-to-me") {
      // Self-assign directly
      try {
        setLoadingCreditId(credit.id);
        await creditService.assignCreditItem({
          itemId: credit.id.toString(),
          // No assigneeEmail = assign to current user
          flowId: credit.flowId,
          key: credit.key,
        });

        toast({
          title: "Item assigned",
          description: "Successfully assigned to you.",
        });

        await refetchCredits();
      } catch (error: any) {
        if (error?.response?.status === 403) {
          toast({
            variant: "destructive",
            title: "Permission denied",
            description: "You can only assign unassigned items to yourself.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Assignment failed",
            description: "Could not assign item. Please try again.",
          });
        }
      } finally {
        setLoadingCreditId(null);
      }
    } else if (action === "assign-item") {
      // Open dialog for managers
      setAssignmentDialogCredit(credit);
    }
  };

  const handleAssignSuccess = async () => {
    setAssignmentDialogCredit(null);
    await refetchCredits();
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
              loadingCreditId={loadingCreditId}
            />
          ) : (
            <CreditTableView
              credits={paginatedCredits}
              statuses={statuses}
              onCreditClick={setSelectedCredit}
              loadingCreditId={loadingCreditId}
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

      <CreditJustificationDialog
        isOpen={!!justificationDialog}
        statusName={justificationDialog?.statusName || ""}
        onConfirm={(justification) => {
          if (justificationDialog) {
            executeStatusChange(
              justificationDialog.creditId,
              justificationDialog.offerId,
              justificationDialog.newStatusId,
              justification,
            );
            setJustificationDialog(null);
          }
        }}
        onCancel={() => setJustificationDialog(null)}
      />

      <CreditAssignmentDialog
        credit={assignmentDialogCredit}
        isOpen={!!assignmentDialogCredit}
        onClose={() => setAssignmentDialogCredit(null)}
        onAssignSuccess={handleAssignSuccess}
      />
    </div>
  );
};

export default Credit;
