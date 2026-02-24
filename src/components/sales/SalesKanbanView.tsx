import { SalesCard } from "./SalesCard";
import type { SalesElementItem, Stage } from "@/types/sales";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/contexts/LocaleContext";

interface SalesKanbanViewProps {
  items: SalesElementItem[];
  stages: Stage[];
  onItemClick: (item: SalesElementItem) => void;
}

export const SalesKanbanView = ({
  items,
  stages,
  onItemClick,
}: SalesKanbanViewProps) => {
  const { t } = useLocale();

  const getItemsByStage = (stageId: string) =>
    items.filter((item) => item.stageId === stageId);

  return (
    <div className="w-full h-[calc(100vh-280px)]">
      <div className="overflow-x-auto h-full">
        <div className="flex flex-nowrap gap-3 sm:gap-4 pb-4 min-w-max h-full">
          {stages.map((stage) => {
            const stageItems = getItemsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[349px] h-full flex flex-col"
              >
                <div className={`rounded-lg border bg-card h-full flex flex-col ${stage.final ? "border-primary/50" : ""}`}>
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {stage.name}
                    </h3>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {stageItems.length}
                    </span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                      {stageItems.length === 0 ? (
                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                          {t("sales.noItemsInStage")}
                        </p>
                      ) : (
                        stageItems.map((item) => (
                          <SalesCard
                            key={`sales-${item.id}`}
                            item={item}
                            stages={stages}
                            onClick={() => onItemClick(item)}
                          />
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
