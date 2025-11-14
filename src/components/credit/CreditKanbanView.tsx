import { useState, useRef } from "react";
import { CreditCard } from "./CreditCard";
import type { CreditElementItem, CreditStatus } from "@/types/credit";
import { useLocale } from "@/contexts/LocaleContext";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";

interface CreditKanbanViewProps {
  credits: CreditElementItem[];
  statuses: CreditStatus[];
  onCreditClick: (credit: CreditElementItem) => void;
  onStatusChange?: (
    creditId: number,
    offerId: string,
    newStatusId: string,
  ) => void;
  onActionsClick?: (credit: CreditElementItem, action: string) => void;
  loadingCreditId?: number | null;
}

export const CreditKanbanView = ({
  credits,
  statuses,
  onCreditClick,
  onStatusChange,
  onActionsClick,
  loadingCreditId,
}: CreditKanbanViewProps) => {
  const { t } = useLocale();
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const [draggedCreditId, setDraggedCreditId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Enable auto-scroll when dragging
  useAutoScroll(scrollContainerRef, draggedCreditId !== null);

  // Check if user can drag a specific credit
  const canDragCredit = (credit: CreditElementItem): boolean => {
    // Check if credit is in a destructive status - if so, it cannot be moved
    const currentStatus = statuses.find((s) => s.id === credit.statusId);
    if (currentStatus?.destructive) return false;
    
    if (isAdmin) return true;
    if (!user?.email) return false;
    return credit.user?.toLowerCase() === user.email.toLowerCase();
  };

  const getCreditsByStatus = (statusId: string) => {
    return credits.filter((credit) => credit.statusId === statusId);
  };

  const handleDragStart = (e: React.DragEvent, creditId: number) => {
    setDraggedCreditId(creditId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(statusId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, newStatusId: string) => {
    e.preventDefault();
    if (draggedCreditId && onStatusChange) {
      const draggedCredit = credits.find((c) => c.id === draggedCreditId);
      if (draggedCredit && draggedCredit.statusId !== newStatusId) {
        onStatusChange(
          draggedCredit.id,
          draggedCredit.details.offer,
          newStatusId,
        );
      }
    }
    setDraggedCreditId(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedCreditId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="w-full">
      <div ref={scrollContainerRef} className="overflow-x-auto">
        <div className="flex flex-nowrap gap-3 sm:gap-4 pb-4 min-w-max">
          {statuses.map((status) => {
            const statusCredits = getCreditsByStatus(status.id);
            const isDragOver = dragOverColumn === status.id;
            return (
              <div key={status.id} className="flex-shrink-0 w-[360px]">
                <div
                  className={`rounded-lg border p-3 sm:p-4 bg-card transition-colors ${
                    status.destructive ? "border-destructive/50" : ""
                  } ${isDragOver ? "border-primary bg-accent/50" : ""}`}
                  onDragOver={(e) => handleDragOver(e, status.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status.id)}
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {status.description}
                      {status.destructive && (
                        <span className="ml-2 text-destructive">⚠️</span>
                      )}
                    </h3>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {statusCredits.length}
                    </span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {statusCredits.length === 0 ? (
                      <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                        {t("credit.noCreditsInStatus")}
                      </p>
                    ) : (
                      statusCredits.map((credit) => {
                        const isDraggable = canDragCredit(credit);
                        return (
                          <CreditCard
                            key={`credit-${credit.id}`}
                            credit={credit}
                            statuses={statuses}
                            onClick={() => onCreditClick(credit)}
                            onDragStart={
                              onStatusChange && isDraggable
                                ? handleDragStart
                                : undefined
                            }
                            onDragEnd={handleDragEnd}
                            onActionsClick={onActionsClick}
                            isDragging={draggedCreditId === credit.id}
                            isLoading={loadingCreditId === credit.id}
                            canDrag={isDraggable}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
