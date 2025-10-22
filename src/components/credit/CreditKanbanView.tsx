import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CreditCard } from "./CreditCard";
import type { CreditElementItem, CreditStatus } from "@/types/credit";
import { useLocale } from "@/contexts/LocaleContext";

interface CreditKanbanViewProps {
  credits: CreditElementItem[];
  statuses: CreditStatus[];
  onCreditClick: (credit: CreditElementItem) => void;
}

export const CreditKanbanView = ({
  credits,
  statuses,
  onCreditClick,
}: CreditKanbanViewProps) => {
  const { t } = useLocale();

  const getCreditsByStatus = (statusId: string) => {
    return credits.filter((credit) => credit.statusId === statusId);
  };

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {statuses.map((status) => {
          const statusCredits = getCreditsByStatus(status.id);
          return (
            <div
              key={status.id}
              className="flex-shrink-0 w-80"
            >
              <div
                className={`rounded-lg border p-4 bg-card ${
                  status.destructive ? "border-destructive/50" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {status.description}
                    {status.destructive && (
                      <span className="ml-2 text-destructive">⚠️</span>
                    )}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {statusCredits.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {statusCredits.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t("credit.noCreditsInStatus")}
                    </p>
                  ) : (
                    statusCredits.map((credit) => (
                      <CreditCard
                        key={`credit-${credit.id}`}
                        credit={credit}
                        statuses={statuses}
                        onClick={() => onCreditClick(credit)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
