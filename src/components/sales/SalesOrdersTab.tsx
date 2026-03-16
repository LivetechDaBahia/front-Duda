import { useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import { toDateNoTZShift } from "@/utils/date";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { SalesOrderDetails } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";
import { ChangeObservationsDialog } from "@/components/sales/ChangeObservationsDialog";

interface SalesOrdersTabProps {
  orders: SalesOrderDetails[];
  isLoading: boolean;
  onObservationsChanged?: () => void;
}

interface GroupedOrder {
  branch: string;
  order: string;
  header: SalesOrderDetails;
  items: SalesOrderDetails[];
}

const formatCurrency = (value: number, currency: string = "BRL") => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesOrdersTab = ({ orders, isLoading, onObservationsChanged }: SalesOrdersTabProps) => {
  const { t, locale } = useLocale();
  const [observationsOrder, setObservationsOrder] = useState<SalesOrderDetails | null>(null);

  const groupedOrders = useMemo<GroupedOrder[]>(() => {
    const map = new Map<string, GroupedOrder>();
    for (const row of orders) {
      const key = `${row.branch}-${row.order}`;
      if (!map.has(key)) {
        map.set(key, { branch: row.branch, order: row.order, header: row, items: [] });
      }
      map.get(key)!.items.push(row);
    }
    return Array.from(map.values());
  }, [orders]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t("sales.noSalesOrders")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">{t("sales.salesOrderDetails")}</h3>
      {groupedOrders.map((group, idx) => {
        const order = group.header;
        return (
          <div
            key={`${group.branch}-${group.order}-${idx}`}
            className="border rounded-md p-3 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">
                {t("sales.order")}: {group.order} — {t("sales.branch")}: {group.branch}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setObservationsOrder(order)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t("sales.changeObservations")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">{t("sales.emissionDate")}:</span>
                <p className="font-medium">{formatDate(order.emissionDate, locale)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.totalValue")}:</span>
                <p className="font-medium">{formatCurrency(order.totalValue)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.shippingType")}:</span>
                <p className="font-medium">{order.shippingType || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.shippingValue")}:</span>
                <p className="font-medium">{formatCurrency(order.shippingValue)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.tid")}:</span>
                <p className="font-medium">{order.TID || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.clientId")}:</span>
                <p className="font-medium">{order.clientId || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.clientBranch")}:</span>
                <p className="font-medium">{order.clientBranch || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.contractId")}:</span>
                <p className="font-medium">{order.contractId || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.addictive")}:</span>
                <p className="font-medium">{order.addictive || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.type")}:</span>
                <p className="font-medium">{order.type || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.operation")}:</span>
                <p className="font-medium">{order.oper || "-"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.isPartial")}:</span>
                <p className="font-medium">{order.isPartial ? t("common.yes") : t("common.no")}</p>
              </div>
              <div>
                <span className="text-muted-foreground">{t("sales.isReinvoice")}:</span>
                <p className="font-medium">{order.isReinvoice ? t("common.yes") : t("common.no")}</p>
              </div>
              {(() => {
                const minDate = toDateNoTZShift(order.minimumDate);
                const isFuture = minDate ? minDate > new Date() : false;
                return (
                  <div>
                    <span className="text-muted-foreground">{t("sales.minimumDate")}:</span>
                    <p className={isFuture ? "font-bold" : "font-medium"}>
                      {formatDate(order.minimumDate, locale)}
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Observations section */}
            {(order.obsNF || order.obsPacking || order.obsLogistics || order.obsProposal) && (
              <div className="border-t pt-2 space-y-1">
                <span className="text-sm font-semibold">{t("sales.observations")}</span>
                {order.obsNF && (
                  <div>
                    <span className="text-muted-foreground text-xs">{t("sales.obsNF")}:</span>
                    <p className="text-sm">{order.obsNF}</p>
                  </div>
                )}
                {order.obsPacking && (
                  <div>
                    <span className="text-muted-foreground text-xs">{t("sales.obsPacking")}:</span>
                    <p className="text-sm">{order.obsPacking}</p>
                  </div>
                )}
                {order.obsLogistics && (
                  <div>
                    <span className="text-muted-foreground text-xs">{t("sales.obsLogistics")}:</span>
                    <p className="text-sm">{order.obsLogistics}</p>
                  </div>
                )}
                {order.obsProposal && (
                  <div>
                    <span className="text-muted-foreground text-xs">{t("sales.obsProposal")}:</span>
                    <p className="text-sm">{order.obsProposal}</p>
                  </div>
                )}
              </div>
            )}

            {/* Order items section */}
            {group.items.length > 0 && (
              <div className="border-t pt-2 space-y-2">
                <span className="text-sm font-semibold">{t("sales.orderItems")}</span>
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">{t("sales.item")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.product")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.description")}</TableHead>
                          <TableHead className="whitespace-nowrap text-right">{t("sales.orderItem.numSold")}</TableHead>
                          <TableHead className="whitespace-nowrap text-right">{t("sales.orderItem.numDelivered")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.orderItem.process")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.orderItem.statusAss")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.orderItem.shippingModality")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.items.map((row, itemIdx) => (
                          <TableRow key={`${group.order}-item-${itemIdx}`}>
                            <TableCell className="whitespace-nowrap">{row.item}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.product}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.description}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{row.numSold}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{row.numDelivered}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.process || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.statusAss || "-"}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.shippingModality || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </div>
        );
      })}

      <ChangeObservationsDialog
        order={observationsOrder}
        open={!!observationsOrder}
        onClose={() => setObservationsOrder(null)}
        onSuccess={onObservationsChanged}
      />
    </div>
  );
};
