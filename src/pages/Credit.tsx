import { useState, useMemo } from "react";
import { CreditHeader } from "@/components/credit/CreditHeader";
import { CreditFilters } from "@/components/credit/CreditFilters";
import { CreditKanbanView } from "@/components/credit/CreditKanbanView";
import { CreditTableView } from "@/components/credit/CreditTableView";
import { CreditDetailPanel } from "@/components/credit/CreditDetailPanel";
import { CreditLogsDialog } from "@/components/credit/CreditLogsDialog";
import { CreditJustificationDialog } from "@/components/credit/CreditJustificationDialog";
import { CreditAssignmentDialog } from "@/components/credit/CreditAssignmentDialog";
import { CreditLimitDialog } from "@/components/credit/CreditLimitDialog";
import { useCredits } from "@/hooks/useCredits";
import { useCreditStatuses } from "@/hooks/useCreditStatuses";
import { creditService } from "@/services/creditService";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type {
  CreditElementItem,
  CreditFilters as CreditFiltersType,
  UpdateCreditStatusDto,
} from "@/types/credit";
import { formatOfferId } from "@/utils/offer";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/shared/AccessDenied";

const Credit = () => {
  // All hooks must be called first, before any conditional returns
  const { canViewCredit, canManageCredit, isCreditManager } = usePermissions();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();
  const { t } = useLocale();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const isReadOnly = canViewCredit && !canManageCredit;
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [selectedCredit, setSelectedCredit] =
    useState<CreditElementItem | null>(null);
  const [logsDialogCreditId, setLogsDialogCreditId] = useState<number | null>(
    null,
  );
  const [loadingCreditId, setLoadingCreditId] = useState<number | null>(null);
  const [assignmentDialogCredit, setAssignmentDialogCredit] =
    useState<CreditElementItem | null>(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [selectedCreditForLimit, setSelectedCreditForLimit] =
    useState<CreditElementItem | null>(null);
  const [justificationDialog, setJustificationDialog] = useState<{
    creditId: number;
    offerId: string;
    newStatusId: string;
    statusName: string;
  } | null>(null);
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

  const filteredCredits = useMemo(() => {
    if (!canViewCredit) return [];
    return credits.filter((credit) => {
      // Role-based visibility: agents only see unassigned or their own items
      if (!isCreditManager) {
        const userEmail = user?.email?.toLowerCase() || "";
        const creditAssignee = (credit.user || "").toLowerCase();
        const isUnassigned = !credit.user || credit.user.trim() === "";
        const isAssignedToMe = creditAssignee === userEmail;
        if (!isUnassigned && !isAssignedToMe) return false;
      }

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

      // User/Assignee filter
      if (filters.user) {
        const selected = filters.user;
        if (selected === "unassigned") {
          if (credit.user && credit.user.trim() !== "") return false;
        } else if (selected === "me") {
          const authEmail = user?.email?.toLowerCase() || "";
          if (!authEmail || (credit.user || "").toLowerCase() !== authEmail) {
            return false;
          }
        } else {
          if ((credit.user || "").toLowerCase() !== selected.toLowerCase()) {
            return false;
          }
        }
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
        const [a, b] = filters.valueRange;
        const min = Math.min(a, b);
        const max = Math.max(a, b);
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

      // Date range filter
      if (filters.dateBegin || filters.dateEnd) {
        const creditDate = credit.details.date;

        if (creditDate) {
          // Normalize dates to start/end of day for comparison
          if (filters.dateBegin) {
            const startOfDay = new Date(filters.dateBegin);
            startOfDay.setHours(0, 0, 0, 0);
            if (creditDate < startOfDay) return false;
          }

          if (filters.dateEnd) {
            const endOfDay = new Date(filters.dateEnd);
            endOfDay.setHours(23, 59, 59, 999);
            if (creditDate > endOfDay) return false;
          }
        } else {
          // If credit has no date, exclude it when date filter is active
          return false;
        }
      }

      return true;
    });
  }, [credits, filters, isCreditManager, user?.email, canViewCredit]);

  const uniqueCardClients = useMemo(() => {
    const map = new Map<
      string,
      {
        branch: string;
        client: string;
      }
    >();

    filteredCredits.forEach((credit) => {
      const branch = (credit.details.clientBranch || "").trim();
      const client = (credit.details.client || "").trim();
      if (!branch || !client) return;

      const clientKey = `${branch}:${client}`;
      if (!map.has(clientKey)) {
        map.set(clientKey, { branch, client });
      }
    });

    return Array.from(map.entries()).map(([clientKey, value]) => ({
      clientKey,
      ...value,
    }));
  }, [filteredCredits]);

  const blacklistQueries = useQueries({
    queries: uniqueCardClients.map(({ branch, client, clientKey }) => ({
      queryKey: ["credit-client-details-card", clientKey],
      queryFn: () => creditService.getClientDetails(branch, client),
      staleTime: 5 * 60 * 1000,
      retry: false,
    })),
  });

  const blacklistedClientKeys = useMemo(() => {
    const keys = new Set<string>();

    uniqueCardClients.forEach(({ clientKey }, index) => {
      const clientDetails = blacklistQueries[index]?.data;
      if (!clientDetails) return;

      const hasBlackListInfo = Boolean(
        clientDetails.blackList ||
          clientDetails.totalInBlacklist ||
          clientDetails.blacklistObservation,
      );

      if (hasBlackListInfo) {
        keys.add(clientKey);
      }
    });

    return keys;
  }, [uniqueCardClients, blacklistQueries]);

  const blacklistedCreditIds = useMemo(() => {
    const ids = new Set<number>();

    filteredCredits.forEach((credit) => {
      const branch = (credit.details.clientBranch || "").trim();
      const client = (credit.details.client || "").trim();
      if (!branch || !client) return;

      const clientKey = `${branch}:${client}`;
      if (blacklistedClientKeys.has(clientKey)) {
        ids.add(credit.id);
      }
    });

    return ids;
  }, [filteredCredits, blacklistedClientKeys]);

  // Early permission check - after all hooks
  if (!canViewCredit) {
    return <AccessDenied />;
  }

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
        title: t("credit.statusUpdated") || "Status updated",
        description:
          t("credit.statusUpdatedDesc") ||
          "Credit status has been successfully updated.",
      });

      await refetchCredits();
    } catch (error) {
      handleError(error);
    } finally {
      setLoadingCreditId(null);
    }
  };

  const handleActionsClick = async (
    credit: CreditElementItem,
    action: string,
  ) => {
    if (action === "view-logs") {
      setLogsDialogCreditId(credit.id);
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
          title: t("credit.itemAssigned") || "Item assigned",
          description:
            t("credit.itemAssignedDesc") || "Successfully assigned to you.",
        });

        await refetchCredits();
      } catch (error) {
        handleError(error);
      } finally {
        setLoadingCreditId(null);
      }
    } else if (action === "assign-item") {
      // Open dialog for managers
      setAssignmentDialogCredit(credit);
    } else if (action === "set-credit-limit") {
      setSelectedCreditForLimit(credit);
      setLimitDialogOpen(true);
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
              credits={filteredCredits}
              statuses={statuses}
              blacklistedCreditIds={blacklistedCreditIds}
              onCreditClick={setSelectedCredit}
              onStatusChange={isReadOnly ? undefined : handleStatusChange}
              onActionsClick={handleActionsClick}
              loadingCreditId={loadingCreditId}
              isCreditManager={isCreditManager}
              isReadOnly={isReadOnly}
            />
          ) : (
            <CreditTableView
              credits={filteredCredits}
              statuses={statuses}
              onCreditClick={setSelectedCredit}
              onStatusChange={isReadOnly ? undefined : handleStatusChange}
              onActionsClick={handleActionsClick}
              loadingCreditId={loadingCreditId}
              isCreditManager={isCreditManager}
              isReadOnly={isReadOnly}
            />
          )}
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

      <CreditLimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        clientCnpj={selectedCreditForLimit?.details.clientCpfCnpj || ""}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["credit-elements"] });
          queryClient.invalidateQueries({ queryKey: ["credit-limit"] });
        }}
      />
    </div>
  );
};

export default Credit;
