import { SalesCard } from "./SalesCard";
import type { SalesElementItem, Stage } from "@/types/sales";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocale } from "@/contexts/LocaleContext";

interface SalesKanbanViewProps {
  items: SalesElementItem[];
  stages: Stage[];
  variationsMap: Map<string, SalesElementItem[]>;
  onItemClick: (item: SalesElementItem) => void;
}

/** Group items by key within the same stage */
const groupItemsByKey = (items: SalesElementItem[]) => {
  const map = new Map<string, SalesElementItem[]>();
  items.forEach((item) => {
    const groupKey = item.key;
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey)!.push(item);
  });
  return Array.from(map.values());
};

export const SalesKanbanView = ({
  items,
  stages,
  variationsMap,
  onItemClick,
}: SalesKanbanViewProps) => {
  const { t } = useLocale();

  const getItemsByStage = (stageId: string) =>
    items.filter((item) => item.stageId === stageId);

  const getVariations = (item: SalesElementItem) =>
    variationsMap.get(`${item.id}-${item.key}`) || [];

  return (
    <div className="w-full h-[calc(100vh-280px)]">
      <div className="overflow-x-auto h-full">
        <div className="flex flex-nowrap gap-3 sm:gap-4 pb-4 min-w-full h-full">
          {stages.map((stage) => {
            const stageItems = getItemsByStage(stage.id);
            const grouped = groupItemsByKey(stageItems);
            return (
              <div
                key={stage.id}
                className="flex-shrink-0 w-[400px] h-full flex flex-col"
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
                      {grouped.length === 0 ? (
                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                          {t("sales.noItemsInStage")}
                        </p>
                      ) : (
                        grouped.map((group) => {
                          const representative = group[0];
                          return (
                            <SalesCard
                              key={`sales-${stage.id}-${representative.key}`}
                              item={representative}
                              stages={stages}
                              variations={getVariations(representative)}
                              groupedItems={group}
                              onClick={() => onItemClick(representative)}
                            />
                          );
                        })
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
