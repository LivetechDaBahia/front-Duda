import { useState, useRef } from "react";
import { TrafficLightSummary } from "@/types/trafficLight";
import { useLocale } from "@/contexts/LocaleContext";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { getStatusLabelKey } from "@/lib/trafficLightTransformer";

type WorkflowStatus = "expired" | "in-progress" | "completed" | "cancelled";

interface WorkflowKanbanViewProps {
  items: TrafficLightSummary[];
  onItemClick: (item: TrafficLightSummary) => void;
}

// Check if item is expired based on validityDate (due date)
function isExpired(validityDate: string | undefined): boolean {
  if (!validityDate) return false;
  try {
    const dueDate = new Date(validityDate);
    // Check if it's a valid date
    if (isNaN(dueDate.getTime())) return false;
    return dueDate < new Date();
  } catch {
    return false;
  }
}

// Derive status from summary for list display
function getSummaryStatus(item: TrafficLightSummary): WorkflowStatus {
  // Check if cancelled first

  if (item.erro) {
    return "cancelled";
  }

  if (item.canceled08 && item.canceled08.trim() !== "") {
    return "cancelled";
  }
  if (item.finishedDate) {
    return "completed";
  }
  // Check if expired (past due date)
  if (isExpired(item.validityDate)) {
    return "expired";
  }
  // Default: in execution (no pending state)
  return "in-progress";
}

export const WorkflowKanbanView = ({
  items,
  onItemClick,
}: WorkflowKanbanViewProps) => {
  const { t } = useLocale();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);

  // Enable auto-scroll when dragging (read-only, but keep for consistency)
  useAutoScroll(scrollContainerRef, draggedItemId !== null);

  const columns: {
    status: WorkflowStatus;
    label: string;
    color: string;
    icon: typeof Clock;
  }[] = [
    {
      status: "in-progress",
      label: t("workflow.status.inExecution"),
      color: "border-primary",
      icon: Clock,
    },
    {
      status: "expired",
      label: t("workflow.status.expired"),
      color: "border-warning",
      icon: AlertTriangle,
    },
    {
      status: "completed",
      label: t("workflow.status.completed"),
      color: "border-success",
      icon: CheckCircle2,
    },
    {
      status: "cancelled",
      label: t("workflow.status.failed"),
      color: "border-destructive",
      icon: XCircle,
    },
  ];

  const getItemsByStatus = (status: WorkflowStatus) => {
    return items.filter((item) => getSummaryStatus(item) === status);
  };

  return (
    <div className="w-full h-[calc(100vh-280px)]">
      <div ref={scrollContainerRef} className="overflow-x-auto h-full">
        <div className="flex flex-nowrap gap-3 sm:gap-4 pb-4 min-w-max h-full">
          {columns.map(({ status, label, color, icon: StatusIcon }) => {
            const columnItems = getItemsByStatus(status);

            return (
              <div
                key={status}
                className="flex-shrink-0 w-[400px] h-full flex flex-col"
              >
                <div className="rounded-lg border bg-card transition-colors h-full flex flex-col">
                  <div
                    className={cn(
                      "flex items-center justify-between p-3 sm:p-4 border-b-2",
                      color,
                    )}
                  >
                    <h3 className="font-semibold text-sm sm:text-base flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      {label}
                    </h3>
                    <span className="text-xs bg-muted px-2 py-1 rounded-full">
                      {columnItems.length}
                    </span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div
                      className="space-y-2 sm:space-y-3 p-3 sm:p-4"
                      style={{ width: "398px" }}
                    >
                      {columnItems.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                          {t("workflow.kanban.noItems")}
                        </div>
                      ) : (
                        columnItems.map((item) => {
                          const itemStatus = getSummaryStatus(item);

                          return (
                            <Card
                              key={item.id}
                              className={cn(
                                "p-3 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                                "border-l-4",
                                itemStatus === "completed" &&
                                  "border-l-success",
                                itemStatus === "in-progress" &&
                                  "border-l-primary",
                                itemStatus === "expired" && "border-l-warning",
                                itemStatus === "cancelled" &&
                                  "border-l-destructive",
                              )}
                              onClick={() => onItemClick(item)}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={cn(
                                    "p-2 rounded-lg shrink-0",
                                    itemStatus === "completed" &&
                                      "bg-success/10",
                                    itemStatus === "in-progress" &&
                                      "bg-primary/10",
                                    itemStatus === "expired" && "bg-warning/10",
                                    itemStatus === "cancelled" &&
                                      "bg-destructive/10",
                                  )}
                                >
                                  <FileText
                                    className={cn(
                                      "h-4 w-4",
                                      itemStatus === "completed" &&
                                        "text-success",
                                      itemStatus === "in-progress" &&
                                        "text-primary",
                                      itemStatus === "expired" &&
                                        "text-warning",
                                      itemStatus === "cancelled" &&
                                        "text-destructive",
                                    )}
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-medium text-sm text-foreground truncate">
                                    {t("workflow.quote")}: {item.numQuote}
                                  </h4>
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                                    <span>
                                      {t("workflow.salesOrder")}:{" "}
                                      {item.salesOrderNumber}
                                    </span>
                                    {item.lvts && (
                                      <span>
                                        {t("workflow.lvts")}: {item.lvts}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs",
                                        itemStatus === "expired"
                                          ? "bg-warning/20 text-warning"
                                          : "bg-muted text-muted-foreground",
                                      )}
                                    >
                                      {t("workflow.dueDate")}:{" "}
                                      {item.validityDate}
                                    </Badge>
                                  </div>
                                  {(item.startDate || item.finishedDate) && (
                                    <div className="text-xs text-muted-foreground mt-2 space-y-0.5">
                                      {item.startDate && (
                                        <div>
                                          {t("workflow.started")}:{" "}
                                          {new Date(
                                            item.startDate,
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                      {item.finishedDate && (
                                        <div>
                                          {t("workflow.finished")}:{" "}
                                          {new Date(
                                            item.finishedDate,
                                          ).toLocaleDateString()}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Card>
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
