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
import { LayoutGrid, TableIcon } from "lucide-react";
import type { SalesElementItemDetails } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";

interface AllocationDetailsTabProps {
  details: SalesElementItemDetails[];
  isLoading: boolean;
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

const ObservationsSection = ({ details, t }: { details: SalesElementItemDetails[]; t: (key: string) => string }) => {
  const hasObservations = details.some(r => r.shippingObservations || r.logisticsObservations || r.offerObservations || r.nf);
  if (!hasObservations) return null;

  const seen = new Set<string>();
  const observations: Pick<SalesElementItemDetails, "shippingObservations" | "logisticsObservations" | "offerObservations" | "nf">[] = [];
  for (const r of details) {
    if (!r.shippingObservations && !r.logisticsObservations && !r.offerObservations && !r.nf) continue;
    const key = `${r.nf || ""}|${r.shippingObservations || ""}|${r.logisticsObservations || ""}|${r.offerObservations || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      observations.push({ nf: r.nf, shippingObservations: r.shippingObservations, logisticsObservations: r.logisticsObservations, offerObservations: r.offerObservations });
    }
  }

  if (observations.length === 0) return null;

  return (
    <div className="border rounded-md p-3 space-y-2">
      <span className="text-sm font-semibold">{t("sales.observations")}</span>
      {observations.map((obs, idx) => (
        <div key={idx} className="space-y-1">
          <ObservationField label={t("sales.nf")} value={obs.nf} />
          <ObservationField label={t("sales.shippingObservations")} value={obs.shippingObservations} />
          <ObservationField label={t("sales.logisticsObservations")} value={obs.logisticsObservations} />
          <ObservationField label={t("sales.offerObservations")} value={obs.offerObservations} />
        </div>
      ))}
    </div>
  );
};

const AllocationTableView = ({ details, t }: { details: SalesElementItemDetails[]; t: (key: string) => string }) => (
  <div className="space-y-3">
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
              <TableHead className="whitespace-nowrap">{t("sales.review")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.contract")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.additional")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.batch")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.sequence")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.include")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.productOrder")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numOp")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.purchaseOrder")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numPo")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.purchaseRequest")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("sales.numSc")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("sales.minDate")}</TableHead>
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
                <TableCell className="whitespace-nowrap">{row.review || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.contract || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.additional || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.batch || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.sequence || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.include || "-"}</TableCell>
                <TableCell className="whitespace-nowrap">{row.productOrder || "-"}</TableCell>
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

const AllocationCardView = ({ details, t }: { details: SalesElementItemDetails[]; t: (key: string) => string }) => (
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
              <TableHead className="whitespace-nowrap">{t("sales.minDate")}</TableHead>
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
                <TableCell className="whitespace-nowrap">{row.minDate || "-"}</TableCell>
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
          <p className="font-semibold text-sm mb-3 break-words whitespace-normal">
            {row.product} - {row.description}
          </p>

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

          {(row.nf || row.shippingObservations || row.logisticsObservations || row.offerObservations) && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <ObservationField label={t("sales.nf")} value={row.nf} />
              <ObservationField label={t("sales.shippingObservations")} value={row.shippingObservations} />
              <ObservationField label={t("sales.logisticsObservations")} value={row.logisticsObservations} />
              <ObservationField label={t("sales.offerObservations")} value={row.offerObservations} />
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    ))}
  </div>
);

export const AllocationDetailsTab = ({ details, isLoading }: AllocationDetailsTabProps) => {
  const { t } = useLocale();
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

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
        <AllocationCardView details={details} t={t} />
      ) : (
        <AllocationTableView details={details} t={t} />
      )}
    </div>
  );
};
