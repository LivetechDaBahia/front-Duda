import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, History } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { format, isValid, parseISO } from "date-fns";

interface CreditLogsDialogProps {
  creditId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CreditLogsDialog({
  creditId,
  isOpen,
  onClose,
}: CreditLogsDialogProps) {
  const { t } = useLocale();

  const { data: logs, isLoading } = useQuery({
    queryKey: ["creditLogs", creditId],
    queryFn: () => creditService.getCreditLogs(creditId!),
    enabled: !!creditId && isOpen,
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            {t("credit.activityLogs")}
          </DialogTitle>
          <DialogDescription>
            {t("credit.activityLogsDescription")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{log.description}</Badge>
                        {log.oldStatus && log.newStatus && (
                          <span className="text-xs text-muted-foreground">
                            {log.oldStatus} → {log.newStatus}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-light">{log.detail}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{log.user}</span>
                        <span>•</span>
                        <span>
                          {format(
                            (() => {
                              const rawDate = log.dateTime;
                              if (!rawDate) return new Date();
                              // If it's already a Date, just return it (no timezone adjustment by us)
                              if (rawDate instanceof Date) {
                                return rawDate;
                              }
                              // Otherwise, treat as string and strip trailing "Z" so it's parsed as local time
                              const str = String(rawDate);
                              const normalized = str.endsWith("Z")
                                ? str.slice(0, -1)
                                : str;
                              return new Date(normalized);
                            })(),
                            "PPp",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t("credit.noLogs")}</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
