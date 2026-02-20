import { SalesCard } from "./SalesCard";
import type { SalesItem, SalesStatus } from "@/types/sales";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SalesKanbanViewProps {
  items: SalesItem[];
  statuses: SalesStatus[];
  onItemClick: (item: SalesItem) => void;
}

export const SalesKanbanView = ({
  items,
  statuses,
  onItemClick,
}: SalesKanbanViewProps) => {
  const getItemsByStatus = (statusId: string) =>
    items.filter((item) => item.statusId === statusId);

  return (
    <div className="w-full h-[calc(100vh-280px)]">
      <div className="overflow-x-auto h-full">
        <div className="flex flex-nowrap gap-3 sm:gap-4 pb-4 min-w-max h-full">
          {statuses.map((status) => {
            const statusItems = getItemsByStatus(status.id);
            return (
              <div
                key={status.id}
                className="flex-shrink-0 w-[349px] h-full flex flex-col"
              >
                <div className="rounded-lg border bg-card h-full flex flex-col">
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {status.description}
                    </h3>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {statusItems.length}
                    </span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4">
                      {statusItems.length === 0 ? (
                        <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                          No items in this status
                        </p>
                      ) : (
                        statusItems.map((item) => (
                          <SalesCard
                            key={item.id}
                            item={item}
                            statuses={statuses}
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
