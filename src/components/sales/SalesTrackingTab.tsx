import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/salesService";
import type { ItemTrackingStatus } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Clock } from "lucide-react";

interface SalesTrackingTabProps {
  orderId: string;
  orderBranch: string;
  processId: string;
}

export const SalesTrackingTab = ({
  orderId,
  orderBranch,
  processId,
}: SalesTrackingTabProps) => {
  const { t } = useLocale();

  const { data: events = [], isLoading } = useQuery<ItemTrackingStatus[]>({
    queryKey: ["salesTracking", orderId, orderBranch, processId],
    queryFn: () => salesService.getTracking(orderId, orderBranch, processId),
    enabled: !!orderId && !!orderBranch && !!processId,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
        <Package className="h-10 w-10 mb-2" />
        <p className="text-sm">{t("sales.tracking.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="font-semibold text-sm mb-3">
        {t("sales.tracking.title")}
      </h3>
      <ol className="relative border-l-2 border-muted ml-3 space-y-4">
        {events.map((event, index) => (
          <li key={index} className="ml-4">
            <div className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2 border-primary bg-background" />
            <p className="font-medium text-sm">{event.description}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <Clock className="h-3 w-3" />
              <span>
                {event.date} — {event.time}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};
