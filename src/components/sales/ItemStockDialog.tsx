import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useLocale } from "@/contexts/LocaleContext";
import { salesService } from "@/services/salesService";
import type { ItemStock } from "@/types/sales";

interface ItemStockDialogProps {
  productId: string | null;
  productName?: string;
  open: boolean;
  onClose: () => void;
}

export const ItemStockDialog = ({
  productId,
  productName,
  open,
  onClose,
}: ItemStockDialogProps) => {
  const { t } = useLocale();

  const { data: stocks, isLoading } = useQuery<ItemStock[]>({
    queryKey: ["itemStock", productId],
    queryFn: () => salesService.getItemStock(productId!),
    enabled: !!productId && open,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("sales.itemStock")} — {productName || productId}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : !stocks || stocks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("sales.noStockData")}
          </p>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">{t("sales.branch")}</TableHead>
                    <TableHead className="whitespace-nowrap">{t("sales.stock.warehouse")}</TableHead>
                    <TableHead className="whitespace-nowrap text-right">{t("sales.stock.available")}</TableHead>
                    <TableHead className="whitespace-nowrap text-right">{t("sales.stock.30days")}</TableHead>
                    <TableHead className="whitespace-nowrap text-right">{t("sales.stock.31_60days")}</TableHead>
                    <TableHead className="whitespace-nowrap text-right">{t("sales.stock.61_90days")}</TableHead>
                    <TableHead className="whitespace-nowrap text-right">{t("sales.stock.90plus")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stocks.map((row, idx) => (
                    <TableRow key={`stock-${idx}`}>
                      <TableCell className="whitespace-nowrap">{row.branch}</TableCell>
                      <TableCell className="whitespace-nowrap">{row.warehouse}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{row.available}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{row["30"]}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{row["31-60"]}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{row["61-90"]}</TableCell>
                      <TableCell className="whitespace-nowrap text-right">{row["90+"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};
