import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { salesService } from "@/services/salesService";
import { cn } from "@/lib/utils";
import type {
  AllocationByProductGroupInfo,
  AllocationByProductInfo,
} from "@/types/sales";

interface AllocationCodeDialogProps {
  allocationCode: string | null;
  allocationName?: string;
  highlightProductCode?: string | null;
  open: boolean;
  onClose: () => void;
}

export const AllocationCodeDialog = ({
  allocationCode,
  allocationName,
  highlightProductCode,
  open,
  onClose,
}: AllocationCodeDialogProps) => {
  const { t, locale } = useLocale();
  const [allocationGroups, setAllocationGroups] = useState<
    AllocationByProductGroupInfo[] | undefined
  >(undefined);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const normalizedHighlight = highlightProductCode?.trim().toLowerCase();
  const numberFormatter = useMemo(
    () => new Intl.NumberFormat(locale || "pt-BR"),
    [locale],
  );

  const normalizeResponse = (
    payload: AllocationByProductGroupInfo[] | AllocationByProductInfo[],
  ): AllocationByProductGroupInfo[] => {
    if (!Array.isArray(payload) || payload.length === 0) return [];

    const firstItem = payload[0] as Partial<AllocationByProductGroupInfo>;
    if (Array.isArray(firstItem.allocations)) {
      return payload as AllocationByProductGroupInfo[];
    }

    const grouped = new Map<string, AllocationByProductGroupInfo>();
    (payload as AllocationByProductInfo[]).forEach((item) => {
      const groupKey = [item.order, item.item, item.proposal, item.review].join(
        "|",
      );
      const current = grouped.get(groupKey);
      if (current) {
        current.allocations.push(item);
        return;
      }

      grouped.set(groupKey, {
        groupKey,
        order: item.order,
        item: item.item,
        proposal: item.proposal,
        review: item.review,
        allocations: [item],
      });
    });

    return Array.from(grouped.values());
  };

  const formatNumber = (value: number | null | undefined) => {
    if (typeof value !== "number" || Number.isNaN(value)) return "-";
    return numberFormatter.format(value);
  };

  const isHighlightedProduct = (productCodeValue: string) =>
    !!normalizedHighlight &&
    productCodeValue?.trim().toLowerCase() === normalizedHighlight;

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  useEffect(() => {
    if (!open || !allocationCode) {
      setAllocationGroups(undefined);
      setExpandedGroups({});
      return;
    }

    let active = true;

    const load = async () => {
      setIsLoading(true);
      setAllocationGroups(undefined);
      try {
        const result = await salesService.getAllocationByProduct(allocationCode);
        if (!active) return;
        const normalized = normalizeResponse(result);
        setAllocationGroups(normalized);
        setExpandedGroups(
          normalized.reduce<Record<string, boolean>>((acc, group) => {
            acc[group.groupKey] = group.allocations.length > 1;
            return acc;
          }, {}),
        );
      } catch {
        if (!active) return;
        setAllocationGroups([]);
        setExpandedGroups({});
      } finally {
        if (!active) return;
        setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [open, allocationCode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-background rounded-lg shadow-xl w-full max-w-7xl max-h-[80vh] flex flex-col mx-4"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b shrink-0">
          <div>
            <h2 className="text-lg font-semibold">
              {t("sales.searchType.allocationCode")} —{" "}
              {allocationName || allocationCode}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : !allocationGroups || allocationGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("sales.noAllocationData")}
            </p>
          ) : (
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Nível</TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.branch")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.order")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.offer")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.review")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.contract")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.additional")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.item")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap min-w-[280px]">
                        {t("sales.product")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.local")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        {t("sales.numSold")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        {t("sales.numAvailable")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        {t("sales.numReserved")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        {t("sales.numOp")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        {t("sales.numPo")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        {t("sales.numSc")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.productOrder")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.purchaseOrder")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.prevArrival")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.purchaseRequest")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.batch")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.sequence")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.include")}
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        {t("sales.minimumDate")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocationGroups.map((group) => {
                      const [rootRow, ...childRows] = group.allocations;
                      if (!rootRow) return null;

                      const hasChildren = childRows.length > 0;
                      const isExpanded = hasChildren
                        ? !!expandedGroups[group.groupKey]
                        : true;
                      const rootHighlighted = isHighlightedProduct(
                        rootRow.product,
                      );

                      return (
                        <Fragment key={`group-${group.groupKey}`}>
                          <TableRow
                            className={cn(
                              "bg-slate-200/70 hover:!bg-slate-200/90 dark:bg-slate-800/65 dark:hover:!bg-slate-800/85",
                              rootHighlighted && "font-semibold",
                            )}
                          >
                            <TableCell className="whitespace-nowrap">
                              {hasChildren ? (
                                <button
                                  type="button"
                                  onClick={() => toggleGroup(group.groupKey)}
                                  className="inline-flex items-center gap-2 font-semibold"
                                  aria-label={
                                    isExpanded
                                      ? "Recolher grupo"
                                      : "Expandir grupo"
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span>{`Level ${rootRow.level || "-"}`}</span>
                                </button>
                              ) : (
                                <span className="font-semibold">{`Level ${rootRow.level || "-"}`}</span>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-semibold">
                              {rootRow.branch || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap font-semibold">
                              {group.order || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {group.proposal || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {group.review || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.contract || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.additional || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.item || "-"}
                            </TableCell>
                            <TableCell className="whitespace-normal">
                              <div className="space-y-1 min-w-[280px]">
                                <p className="font-semibold">
                                  {rootRow.product || "-"}
                                </p>
                                <p className="text-muted-foreground whitespace-normal">
                                  {rootRow.description || "-"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.local ? (
                                <Badge className="uppercase px-3 py-1 rounded-xl bg-emerald-900/35 text-emerald-300 border-emerald-700/30">
                                  {rootRow.local}
                                </Badge>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {formatNumber(rootRow.quantitySold)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {formatNumber(rootRow.quantityAvailable)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {formatNumber(rootRow.quantityReserved)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {formatNumber(rootRow.quantityOp)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {formatNumber(rootRow.quantityPo)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-right font-semibold">
                              {formatNumber(rootRow.quantitySc)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatNumber(rootRow.productOrder)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatNumber(rootRow.purchaseOrder)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.expectedArrival || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatNumber(rootRow.purchaseRequest)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.batch || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {formatNumber(rootRow.sequence)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.included || "-"}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {rootRow.minimumDate || "-"}
                            </TableCell>
                          </TableRow>

                          {isExpanded &&
                            childRows.map((row, idx) => {
                              const rowHighlighted = isHighlightedProduct(
                                row.product,
                              );

                              return (
                                <TableRow
                                  key={`child-${group.groupKey}-${idx}`}
                                  className={cn(
                                    idx % 2 === 0
                                      ? "bg-slate-100/80 hover:!bg-slate-100 dark:bg-slate-900/70 dark:hover:!bg-slate-900/85"
                                      : "bg-white hover:!bg-slate-50 dark:bg-slate-950/70 dark:hover:!bg-slate-900/55",
                                    rowHighlighted && "font-semibold",
                                  )}
                                >
                                  <TableCell className="whitespace-nowrap">
                                    <span className="inline-flex items-center gap-2 pl-2">
                                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/80" />
                                      {`Level ${row.level || "-"}`}
                                    </span>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap font-semibold">
                                    {row.branch || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap font-semibold">
                                    {row.order || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.proposal || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.review || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.contract || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.additional || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.item || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-normal">
                                    <div className="space-y-1 min-w-[280px]">
                                      <p className="font-semibold">
                                        {row.product || "-"}
                                      </p>
                                      <p className="text-muted-foreground whitespace-normal">
                                        {row.description || "-"}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.local ? (
                                      <Badge className="uppercase px-3 py-1 rounded-xl bg-emerald-900/35 text-emerald-300 border-emerald-700/30">
                                        {row.local}
                                      </Badge>
                                    ) : (
                                      "-"
                                    )}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-right font-semibold">
                                    {formatNumber(row.quantitySold)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-right font-semibold">
                                    {formatNumber(row.quantityAvailable)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-right font-semibold">
                                    {formatNumber(row.quantityReserved)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-right font-semibold">
                                    {formatNumber(row.quantityOp)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-right font-semibold">
                                    {formatNumber(row.quantityPo)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap text-right font-semibold">
                                    {formatNumber(row.quantitySc)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {formatNumber(row.productOrder)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {formatNumber(row.purchaseOrder)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.expectedArrival || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {formatNumber(row.purchaseRequest)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.batch || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {formatNumber(row.sequence)}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.included || "-"}
                                  </TableCell>
                                  <TableCell className="whitespace-nowrap">
                                    {row.minimumDate || "-"}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
};
