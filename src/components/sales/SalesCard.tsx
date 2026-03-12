import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Layers } from "lucide-react";
import { SalesStageVariations } from "./SalesStageVariations";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { useState } from "react";

interface SalesCardProps {
  item: SalesElementItem;
  stages: Stage[];
  variations?: SalesElementItem[];
  groupedItems?: SalesElementItem[];
  onClick: () => void;
}

export const SalesCard = ({ item, stages, variations = [], groupedItems = [], onClick }: SalesCardProps) => {
  const { t, locale } = useLocale();
  const [variationsOpen, setVariationsOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const stage = stages.find((s) => s.id === item.stageId);
  const hasVariations = variations.length > 1;
  const hasGroupedItems = groupedItems.length > 1;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all w-full max-w-[367px]"
      style={{
        backgroundColor: item.background ? `hsl(${item.background})` : undefined,
        borderLeftColor: item.borders?.left ? `hsl(${item.borders.left})` : undefined,
        borderRightColor: item.borders?.right ? `hsl(${item.borders.right})` : undefined,
        borderLeftWidth: item.borders?.left ? 4 : undefined,
        borderRightWidth: item.borders?.right ? 4 : undefined,
      }}
      onClick={onClick}
    >
      <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-xs">{t("sales.offer")}</span>
            <h3 className="font-semibold text-xs sm:text-sm truncate">{item.offer}</h3>
            <span className="text-muted-foreground text-xs">{t("sales.client")}</span>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {item.client}/{item.clientBranch}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {stage && (
              <Badge variant={stage.final ? "success" : "secondary"} className="text-xs">
                {stage.name}
              </Badge>
            )}
            {item.vip === "Sim" && (
              <Badge variant="default" className="text-xs">VIP</Badge>
            )}
            {hasGroupedItems && (
              <Badge variant="outline" className="text-xs gap-1">
                <Layers className="h-3 w-3" />
                {groupedItems.length}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0 space-y-1">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">{t("sales.value")}</span>
          <span className="font-medium">{formatCurrency(item.value, item.currency, locale)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("sales.seller")}</span>
          <span className="truncate ml-2">{item.sellerName}</span>
        </div>
        {item.sellerGroup && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("sales.sellerGroup")}</span>
            <span className="truncate ml-2">{item.sellerGroup}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("sales.type")}</span>
          <span className="truncate ml-2">{item.type}</span>
        </div>
        {item.paymentCondition && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("sales.paymentCondition")}</span>
            <span className="truncate ml-2">{item.paymentCondition}</span>
          </div>
        )}

        {item.date && (
          <div className="text-xs text-muted-foreground truncate">
            {formatDate(item.date, locale)} • {item.oper}
          </div>
        )}

        {hasGroupedItems && (
          <Collapsible open={groupOpen} onOpenChange={setGroupOpen}>
            <CollapsibleTrigger
              className="flex items-center gap-1 text-xs text-primary hover:underline w-full pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${groupOpen ? "rotate-180" : ""}`}
              />
              {t("sales.groupedItems")} ({groupedItems.length})
            </CollapsibleTrigger>
            <CollapsibleContent onClick={(e) => e.stopPropagation()}>
              <div className="pt-1 border-t border-border/50 mt-1 space-y-1">
                {groupedItems.map((gi, idx) => (
                  <div
                    key={`gi-${gi.id}-${gi.purchaseOrderId}-${gi.purchaseOrderBranch}-${gi.processId}-${idx}`}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="text-muted-foreground truncate">
                      {t("sales.variations.po")}: {gi.purchaseOrderId || "-"}/{gi.purchaseOrderBranch || "-"}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {t("sales.variations.process")}: {gi.processId || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {hasVariations && (
          <Collapsible open={variationsOpen} onOpenChange={setVariationsOpen}>
            <CollapsibleTrigger
              className="flex items-center gap-1 text-xs text-primary hover:underline w-full pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ChevronDown
                className={`h-3 w-3 transition-transform ${variationsOpen ? "rotate-180" : ""}`}
              />
              {t("sales.variations.label")} ({variations.length})
            </CollapsibleTrigger>
            <CollapsibleContent onClick={(e) => e.stopPropagation()}>
              <div className="pt-1 border-t border-border/50 mt-1">
                <SalesStageVariations
                  variations={variations}
                  stages={stages}
                  compact
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};
