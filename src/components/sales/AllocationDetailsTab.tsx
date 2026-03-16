import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LayoutGrid, TableIcon, MoreHorizontal, PackageMinus, PackageSearch, PackagePlus, ClipboardList } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SalesElementItemDetails } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { DeallocateItemDialog } from "@/components/sales/DeallocateItemDialog";
import { ReallocateItemDialog } from "@/components/sales/ReallocateItemDialog";
import { ItemStockDialog } from "@/components/sales/ItemStockDialog";
import { ProductAllocationDialog } from "@/components/sales/ProductAllocationDialog";

interface AllocationDetailsTabProps {
  details: SalesElementItemDetails[];
  isLoading: boolean;
  onDeallocated?: () => void;
}

interface DetailFieldProps {
  label: string;
  value: string | number | null | undefined;
  className?: string;
}

const DetailField = ({ label, value, className = "" }: DetailFieldProps) => (
  <div className={className}>
    <span className="text-muted-foreground text-xs font-medium">{label}:</span>
    <p className="text-sm mt-0.5">{value || "-"}</p>
  </div>
);

const ObservationField = ({ label, value }: { label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div>
      <span className="text-muted-foreground text-xs font-medium">{label}:</span>
      <p className="text-sm mt-0.5">{value}</p>
    </div>
  );
};

const ObservationsSection = (_props: { details: SalesElementItemDetails[]; t: (key: string) => string }) => {
  return null;
};

interface ItemActionsMenuProps {
  item: SalesElementItemDetails;
  onDeallocate: (item: SalesElementItemDetails) => void;
  onReallocate: (item: SalesElementItemDetails) => void;
  onCheckStock: (item: SalesElementItemDetails) => void;
  onViewAllocation: (item: SalesElementItemDetails) => void;
  t: (key: string) => string;
}

const ItemActionsMenu = ({ item, onDeallocate, onReallocate, onCheckStock, onViewAllocation, t }: ItemActionsMenuProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onDeallocate(item)}>
        <PackageMinus className="h-4 w-4 mr-2" />
        {t("sales.deallocate")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onReallocate(item)}>
        <PackagePlus className="h-4 w-4 mr-2" />
        {t("sales.reallocate")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onCheckStock(item)}>
        <PackageSearch className="h-4 w-4 mr-2" />
        {t("sales.checkStock")}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onViewAllocation(item)}>
        <ClipboardList className="h-4 w-4 mr-2" />
        {t("sales.productAllocation")}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const AllocationTableView = ({
  details,
  t,
  onDeallocate,
  onReallocate,
  onCheckStock,
  onViewAllocation,
}: {
  details: SalesElementItemDetails[];
  t: (key: string) => string;
  onDeallocate: (item: SalesElementItemDetails) => void;
  onReallocate: (item: SalesElementItemDetails) => void;
  onCheckStock: (item: SalesElementItemDetails) => void;
  onViewAllocation: (item: SalesElementItemDetails) => void;
}) => (
  <div className="space-y-3">
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap w-10"></TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.branch")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.order")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.item")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.product")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.description")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.local")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numAvailable")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numReserved")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.review")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.contract")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.additional")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.batch")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.sequence")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.include")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numOp")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.purchaseOrder")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numPo")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.purchaseRequest")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numSc")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((row, idx) => (
              <TableRow key={`detail-${idx}`}>
                <TableCell>
                  <ItemActionsMenu item={row} onDeallocate={onDeallocate} onReallocate={onReallocate} onCheckStock={onCheckStock} onViewAllocation={onViewAllocation} t={t} />
                </TableCell>
                <TableCell className="whitespace-nowrap">{row.branch}</TableCell>
                <TableCell className="whitespace-nowrap">{row.order}</TableCell>
                <TableCell className="whitespace-nowrap">{row.item}</TableCell>
                <TableCell className="whitespace-nowrap">{row.product}</TableCell>
                <TableCell className="whitespace-nowrap">{row.description}</TableCell>
                <TableCell className="whitespace-nowrap">{row.local || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numAvailable}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numReserved}</TableCell>
                <TableCell className="whitespace-nowrap">{row.review || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.contract || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.additional || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.batch || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.sequence || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.include || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numOp}</TableCell>
                <TableCell className="whitespace-nowrap">{row.purchaseOrder || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numPo}</TableCell>
                <TableCell className="whitespace-nowrap">{row.purchaseRequest || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numSc}</TableCell>
                <TableCell className="whitespace-nowrap">{row.minDate || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
    <ObservationsSection details={details} t={t} />
  </div>
);

const AllocationCardView = ({
  details,
  t,
  onDeallocate,
  onReallocate,
  onCheckStock,
  onViewAllocation,
}: {
  details: SalesElementItemDetails[];
  t: (key: string) => string;
  onDeallocate: (item: SalesElementItemDetails) => void;
  onReallocate: (item: SalesElementItemDetails) => void;
  onCheckStock: (item: SalesElementItemDetails) => void;
  onViewAllocation: (item: SalesElementItemDetails) => void;
}) => (
  <div className="space-y-4">
    {/* Summary table */}
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">{t("sales.branch")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.order")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.item")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.product")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.description")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.local")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numAvailable")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numReserved")}</TableHead>
              
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((row, idx) => (
              <TableRow key={`detail-${idx}`}>
                <TableCell className="whitespace-nowrap">{row.branch}</TableCell>
                <TableCell className="whitespace-nowrap">{row.order}</TableCell>
                <TableCell className="whitespace-nowrap">{row.item}</TableCell>
                <TableCell className="whitespace-nowrap">{row.product}</TableCell>
                <TableCell className="whitespace-nowrap">{row.description}</TableCell>
                <TableCell className="whitespace-nowrap">{row.local || "-"}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numAvailable}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{row.numReserved}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>

    {/* Product detail cards */}
    {details.map((row, idx) => (
      <ScrollArea key={`detail-card-${idx}`} className="w-full">
        <div className="border rounded-md p-4 min-w-[500px]">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm break-words whitespace-normal">
              {row.product} - {row.description}
            </p>
            <ItemActionsMenu item={row} onDeallocate={onDeallocate} onReallocate={onReallocate} onCheckStock={onCheckStock} onViewAllocation={onViewAllocation} t={t} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3">
            <DetailField label={t("sales.review")} value={row.review} />
            <DetailField label={t("sales.contract")} value={row.contract} />
            <DetailField label={t("sales.additional")} value={row.additional} />
            <DetailField label={t("sales.batch")} value={row.batch} />
            <DetailField label={t("sales.sequence")} value={row.sequence} />
            <DetailField label={t("sales.include")} value={row.include} />
            <DetailField
              label={t("sales.productOrder")}
              value={`${row.productOrder || "-"} (${t("sales.numOp")}: ${row.numOp})`}
            />
            <DetailField
              label={t("sales.purchaseOrder")}
              value={`${row.purchaseOrder || "-"} (${t("sales.numPo")}: ${row.numPo})`}
            />
            <DetailField
              label={t("sales.purchaseRequest")}
              value={`${row.purchaseRequest || "-"} (${t("sales.numSc")}: ${row.numSc})`}
            />
          </div>

        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    ))}
  </div>
);

export const AllocationDetailsTab = ({ details, isLoading, onDeallocated }: AllocationDetailsTabProps) => {
  const { t } = useLocale();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [deallocateItem, setDeallocateItem] = useState<SalesElementItemDetails | null>(null);
  const [reallocateItem, setReallocateItem] = useState<SalesElementItemDetails | null>(null);
  const [stockItem, setStockItem] = useState<SalesElementItemDetails | null>(null);
  const [allocationItem, setAllocationItem] = useState<SalesElementItemDetails | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (details.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t("sales.noItems")}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("sales.allocationDetails")}</h3>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <AllocationCardView
          details={details}
          t={t}
          onDeallocate={setDeallocateItem}
          onReallocate={setReallocateItem}
          onCheckStock={setStockItem}
          onViewAllocation={setAllocationItem}
        />
      ) : (
        <AllocationTableView
          details={details}
          t={t}
          onDeallocate={setDeallocateItem}
          onReallocate={setReallocateItem}
          onCheckStock={setStockItem}
          onViewAllocation={setAllocationItem}
        />
      )}

      <DeallocateItemDialog
        item={deallocateItem}
        open={!!deallocateItem}
        onClose={() => setDeallocateItem(null)}
        onSuccess={onDeallocated}
      />

      <ReallocateItemDialog
        item={reallocateItem}
        open={!!reallocateItem}
        onClose={() => setReallocateItem(null)}
        onSuccess={onDeallocated}
      />

      <ItemStockDialog
        productId={stockItem?.product || null}
        productName={stockItem ? `${stockItem.product} - ${stockItem.description}` : undefined}
        open={!!stockItem}
        onClose={() => setStockItem(null)}
      />

      <ProductAllocationDialog
        productId={allocationItem?.product || null}
        productName={allocationItem ? `${allocationItem.product} - ${allocationItem.description}` : undefined}
        open={!!allocationItem}
        onClose={() => setAllocationItem(null)}
      />
    </div>
  );
};
