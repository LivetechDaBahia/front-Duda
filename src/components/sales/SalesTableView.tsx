import { useState } from "react";
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
import { ChevronRight } from "lucide-react";
import { SalesStageVariations } from "./SalesStageVariations";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";

interface SalesTableViewProps {
  items: SalesElementItem[];
  stages: Stage[];
  variationsMap: Map<string, SalesElementItem[]>;
  onItemClick: (item: SalesElementItem) => void;
}

const formatCurrency = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesTableView = ({
  items,
  stages,
  variationsMap,
  onItemClick,
}: SalesTableViewProps) => {
  const { t, locale } = useLocale();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Deduplicate items by id+key for the table (show one row per logical item)
  const uniqueItems = (() => {
    const seen = new Map<string, SalesElementItem>();
    items.forEach((item) => {
      const key = `${item.id}-${item.key}`;
      if (!seen.has(key)) seen.set(key, item);
    });
    return Array.from(seen.values());
  })();

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
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("sales.type")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.paymentCondition")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.cnpj")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("status")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">VIP</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-8">
                {t("sales.noItems")}
              </TableCell>
            </TableRow>
          ) : (
            uniqueItems.map((item) => {
              const stage = stages.find((s) => s.id === item.stageId);
              const rowKey = `${item.id}-${item.key}`;
              const variations = variationsMap.get(rowKey) || [];
              const hasVariations = variations.length > 1;
              const isExpanded = expandedRows.has(rowKey);

              return (
                <Collapsible key={`sales-table-${rowKey}`} open={isExpanded} asChild>
                  <>
                    <TableRow
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onItemClick(item)}
                    >
                      <TableCell className="w-8 px-2">
                        {hasVariations && (
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
                      <TableCell className="whitespace-nowrap">{formatCurrency(item.value, item.currency)}</TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">{item.sellerName}</TableCell>
                      <TableCell className="whitespace-nowrap hidden md:table-cell">{item.type}</TableCell>
                      <TableCell className="whitespace-nowrap hidden lg:table-cell">{item.paymentCondition || "-"}</TableCell>
                      <TableCell className="whitespace-nowrap hidden lg:table-cell">{item.cnpj}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {stage && (
                          <Badge variant={stage.final ? "success" : "secondary"} className="text-xs">
                            {stage.name}
                          </Badge>
                        )}
                        {hasVariations && (
                          <Badge variant="outline" className="text-xs ml-1">
                            +{variations.length - 1}
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
                    {hasVariations && (
                      <CollapsibleContent asChild>
                        <tr>
                          <td colSpan={11} className="p-0">
                            <div className="px-8 py-2 bg-muted/30 border-y">
                              <p className="text-xs font-medium text-muted-foreground mb-1">
                                {t("sales.variations.label")} ({variations.length} {t("sales.variations.stages")})
                              </p>
                              <SalesStageVariations
                                variations={variations}
                                stages={stages}
                              />
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
