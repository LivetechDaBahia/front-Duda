import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesElementItem } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";

interface SalesPurchaseOrdersTabProps {
  item: SalesElementItem;
  variations: SalesElementItem[];
}

/**
 * Shows all purchase orders associated with a sales item across its stage variations.
 * Deduplicates by PO ID + Branch + Process ID to show unique purchase orders.
 */
export const SalesPurchaseOrdersTab = ({
  item,
  variations,
}: SalesPurchaseOrdersTabProps) => {
  const { t } = useLocale();

  // Collect unique purchase orders from all variations (or just current item if no variations)
  const allItems = variations.length > 0 ? variations : [item];

  const uniquePOs = (() => {
    const seen = new Map<string, SalesElementItem>();
    allItems.forEach((v) => {
      const poKey = `${v.purchaseOrderId}-${v.purchaseOrderBranch}-${v.processId}`;
      if (!seen.has(poKey)) seen.set(poKey, v);
    });
    return Array.from(seen.values());
  })();

  if (uniquePOs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t("sales.noPurchaseOrders")}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{t("sales.purchaseOrders")}</h3>
        <Badge variant="outline" className="text-xs">
          {uniquePOs.length} {uniquePOs.length === 1 ? "PO" : "POs"}
        </Badge>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {uniquePOs.map((po, idx) => (
          <Card key={`po-card-${idx}`}>
            <CardContent className="p-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("sales.variations.purchaseOrderId")}
                </span>
                <span className="font-medium">{po.purchaseOrderId || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("sales.variations.purchaseOrderBranch")}
                </span>
                <span className="font-medium">
                  {po.purchaseOrderBranch || "-"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("sales.variations.processId")}
                </span>
                <span className="font-medium">{po.processId || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("sales.variations.stage")}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {po.stageId}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("sales.variations.assignee")}
                </span>
                <span>{po.user || "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("sales.variations.group")}
                </span>
                <span>{po.group || "-"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">
                {t("sales.variations.purchaseOrderId")}
              </TableHead>
              <TableHead className="text-xs">
                {t("sales.variations.purchaseOrderBranch")}
              </TableHead>
              <TableHead className="text-xs">
                {t("sales.variations.processId")}
              </TableHead>
              <TableHead className="text-xs">
                {t("sales.variations.stage")}
              </TableHead>
              <TableHead className="text-xs">
                {t("sales.variations.assignee")}
              </TableHead>
              <TableHead className="text-xs">
                {t("sales.variations.group")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uniquePOs.map((po, idx) => (
              <TableRow key={`po-row-${idx}`}>
                <TableCell className="text-sm font-medium">
                  {po.purchaseOrderId || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {po.purchaseOrderBranch || "-"}
                </TableCell>
                <TableCell className="text-sm">{po.processId || "-"}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {po.stageId}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{po.user || "-"}</TableCell>
                <TableCell className="text-sm">{po.group || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
