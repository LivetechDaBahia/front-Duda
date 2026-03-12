import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, Layers } from "lucide-react";
import { SalesStageVariations } from "./SalesStageVariations";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";

interface SalesTableViewProps {
  items: SalesElementItem[];
  stages: Stage[];
  variationsMap: Map<string, SalesElementItem[]>;
  onItemClick: (item: SalesElementItem) => void;
}

/** Group items by key+stageId */
const groupItemsByKeyAndStage = (items: SalesElementItem[]) => {
  const map = new Map<string, SalesElementItem[]>();
  items.forEach((item) => {
    const groupKey = `${item.key}-${item.stageId}`;
    if (!map.has(groupKey)) map.set(groupKey, []);
    map.get(groupKey)!.push(item);
  });
  return Array.from(map.values());
};

export const SalesTableView = ({
  items,
  stages,
  variationsMap,
  onItemClick,
}: SalesTableViewProps) => {
  const { t, locale } = useLocale();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const grouped = useMemo(() => groupItemsByKeyAndStage(items), [items]);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="w-full min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead className="whitespace-nowrap">{t("sales.offer")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("sales.client")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("sales.value")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("sales.seller")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("sales.variations.purchaseOrderId")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("sales.variations.purchaseOrderBranch")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.variations.processId")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("status")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">VIP</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grouped.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
                {t("sales.noItems")}
              </TableCell>
            </TableRow>
          ) : (
            grouped.map((group) => {
              const item = group[0];
              const stage = stages.find((s) => s.id === item.stageId);
              const groupKey = `${item.id}-${item.key}`;
              const variations = variationsMap.get(groupKey) || [];
              const hasVariations = variations.length > 1;
              const hasGroupedItems = group.length > 1;
              const canExpand = hasVariations || hasGroupedItems;
              const rowKey = `${item.key}-${item.stageId}`;
              const isExpanded = expandedRows.has(rowKey);

              return (
                <Collapsible key={`sales-table-${rowKey}`} open={isExpanded} asChild>
                  <>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onItemClick(item)}
                    >
                      <TableCell className="w-8 px-2">
                        {canExpand && (
                          <CollapsibleTrigger asChild>
                            <button
                              className="p-1 rounded hover:bg-muted"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(rowKey);
                              }}
                            >
                              <ChevronRight
                                className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              />
                            </button>
                          </CollapsibleTrigger>
                        )}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">{item.offer}</TableCell>
                      <TableCell className="whitespace-nowrap">{item.client}/{item.clientBranch}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatCurrency(item.value, item.currency, locale)}</TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">{item.sellerName}</TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">
                        {hasGroupedItems ? (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Layers className="h-3 w-3" />
                            {group.length}
                          </Badge>
                        ) : (
                          item.purchaseOrderId || "-"
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">
                        {hasGroupedItems ? "-" : item.purchaseOrderBranch || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap hidden lg:table-cell">
                        {hasGroupedItems ? "-" : item.processId || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {stage && (
                          <Badge variant={stage.final ? "success" : "secondary"} className="text-xs">
                            {stage.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">
                        {item.vip === "Sim" && <Badge variant="default" className="text-xs">VIP</Badge>}
                      </TableCell>
                      <TableCell className="whitespace-nowrap hidden lg:table-cell">
                        {formatDate(item.date, locale)}
                      </TableCell>
                    </TableRow>
                    {canExpand && (
                      <CollapsibleContent asChild>
                        <tr>
                          <td colSpan={11} className="p-0">
                            <div className="px-8 py-2 bg-muted/30 border-y space-y-2">
                              {hasGroupedItems && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    {t("sales.groupedItems")} ({group.length} {t("sales.groupedItemsCount")})
                                  </p>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/50">
                                        <TableHead className="text-xs">{t("sales.variations.purchaseOrderId")}</TableHead>
                                        <TableHead className="text-xs">{t("sales.variations.purchaseOrderBranch")}</TableHead>
                                        <TableHead className="text-xs">{t("sales.variations.processId")}</TableHead>
                                        <TableHead className="text-xs">{t("sales.variations.assignee")}</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {group.map((gi, idx) => (
                                        <TableRow
                                          key={`gi-${gi.id}-${gi.purchaseOrderId}-${gi.processId}-${idx}`}
                                          className="bg-muted/20 cursor-pointer hover:bg-muted/40"
                                          onClick={() => onItemClick(gi)}
                                        >
                                          <TableCell className="text-xs py-1.5">{gi.purchaseOrderId || "-"}</TableCell>
                                          <TableCell className="text-xs py-1.5">{gi.purchaseOrderBranch || "-"}</TableCell>
                                          <TableCell className="text-xs py-1.5">{gi.processId || "-"}</TableCell>
                                          <TableCell className="text-xs py-1.5">{gi.user || "-"}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                              {hasVariations && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">
                                    {t("sales.variations.label")} ({variations.length} {t("sales.variations.stages")})
                                  </p>
                                  <SalesStageVariations
                                    variations={variations}
                                    stages={stages}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      </CollapsibleContent>
                    )}
                  </>
                </Collapsible>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
