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
import type { ProductAllocationInfo } from "@/types/sales";

interface ProductAllocationDialogProps {
  productId: string | null;
  productName?: string;
  open: boolean;
  onClose: () => void;
}

export const ProductAllocationDialog = ({
  productId,
  productName,
  open,
  onClose,
}: ProductAllocationDialogProps) => {
  const { t } = useLocale();

  const { data: allocations, isLoading } = useQuery<ProductAllocationInfo[]>({
    queryKey: ["productAllocation", productId],
    queryFn: () => salesService.getProductAllocation(productId!),
    enabled: !!productId && open,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {t("sales.productAllocation")} — {productName || productId}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : !allocations || allocations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t("sales.noAllocationData")}
          </p>
        ) : (
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableHead className="whitespace-nowrap">
                      {t("sales.local")}
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
                      {t("sales.batch")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("sales.sequence")}
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      {t("sales.include")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocations.map((row, idx) => (
                    <TableRow key={`alloc-${idx}`}>
                      <TableCell className="whitespace-nowrap">
                        {row.branch}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.order}
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
                        {row.item}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.local || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {row.amountAvailable}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {row.amountReserved}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {row.amountOp}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {row.amountPo}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right">
                        {row.amountSc}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.productSequence || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.purchaseOrder || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.batch || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.sequence || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {row.include || "-"}
                      </TableCell>
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
