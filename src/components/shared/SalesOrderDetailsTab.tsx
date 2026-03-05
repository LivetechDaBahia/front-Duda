import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { LayoutGrid, TableIcon } from "lucide-react";
import type { CreditElementDetails } from "@/types/credit";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";

interface SalesOrderDetailsTabProps {
  details: CreditElementDetails[];
  isLoading: boolean;
}

const formatCurrency = (value: number, currency: string = "BRL") => {
  const currencyMap: Record<string, string> = {
    "R$": "BRL",
    "US$": "USD",
    "€": "EUR",
  };
  const currencyCode = currencyMap[currency] || currency || "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currencyCode }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const CardView = ({ details, locale, t }: { details: CreditElementDetails[]; locale: string; t: (key: string) => string }) => (
  <div className="space-y-3">
    {details.map((el, idx) => (
      <div
        key={`${el.branch}-${el.id}-${idx}`}
        className="grid grid-cols-2 gap-3 text-sm border rounded-md p-3"
      >
        <div>
          <span className="text-muted-foreground">{t("credit.branch")}:</span>
          <p className="font-medium">{el.branch}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t("credit.id")}:</span>
          <p className="font-medium">{el.id}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t("credit.emissionDate")}:</span>
          <p className="font-medium">{formatDate(el.emissionDate, locale)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t("credit.value")}:</span>
          <p className="font-medium">{formatCurrency(el.value)}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t("credit.shippingType")}:</span>
          <p className="font-medium">{el.shippingType}</p>
        </div>
        <div>
          <span className="text-muted-foreground">{t("credit.shippingCost")}:</span>
          <p className="font-medium">{formatCurrency(el.shippingCost)}</p>
        </div>
        {(el.message1 || el.message2 || el.standardMessage) && (
          <div className="col-span-2">
            <span className="text-muted-foreground">{t("credit.message")}:</span>
            {el.message1 && <p className="font-medium">{el.message1}</p>}
            {el.message2 && <p className="font-medium">{el.message2}</p>}
            {el.standardMessage && <p className="font-medium">{el.standardMessage}</p>}
          </div>
        )}
      </div>
    ))}
  </div>
);

const ObservationsSection = ({ details, t }: { details: CreditElementDetails[]; t: (key: string) => string }) => {
  const hasObservations = details.some(el => el.message1 || el.message2 || el.standardMessage);
  if (!hasObservations) return null;

  // Collect unique observation sets
  const seen = new Set<string>();
  const observations: { message1?: string; message2?: string; standardMessage?: string }[] = [];
  for (const el of details) {
    if (!el.message1 && !el.message2 && !el.standardMessage) continue;
    const key = `${el.message1 || ""}|${el.message2 || ""}|${el.standardMessage || ""}`;
    if (!seen.has(key)) {
      seen.add(key);
      observations.push({ message1: el.message1, message2: el.message2, standardMessage: el.standardMessage });
    }
  }

  if (observations.length === 0) return null;

  return (
    <div className="border rounded-md p-3 space-y-2">
      <span className="text-sm font-semibold">{t("credit.message")}</span>
      {observations.map((obs, idx) => (
        <div key={idx} className="text-sm space-y-0.5">
          {obs.message1 && <p className="text-muted-foreground">{obs.message1}</p>}
          {obs.message2 && <p className="text-muted-foreground">{obs.message2}</p>}
          {obs.standardMessage && <p className="text-muted-foreground">{obs.standardMessage}</p>}
        </div>
      ))}
    </div>
  );
};

const TableView = ({ details, locale, t }: { details: CreditElementDetails[]; locale: string; t: (key: string) => string }) => (
  <div className="space-y-3">
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">{t("credit.branch")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("credit.id")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("credit.emissionDate")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("credit.value")}</TableHead>
              <TableHead className="whitespace-nowrap">{t("credit.shippingType")}</TableHead>
              <TableHead className="whitespace-nowrap text-right">{t("credit.shippingCost")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {details.map((el, idx) => (
              <TableRow key={`${el.branch}-${el.id}-${idx}`}>
                <TableCell className="whitespace-nowrap">{el.branch}</TableCell>
                <TableCell className="whitespace-nowrap">{el.id}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDate(el.emissionDate, locale)}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{formatCurrency(el.value)}</TableCell>
                <TableCell className="whitespace-nowrap">{el.shippingType}</TableCell>
                <TableCell className="whitespace-nowrap text-right">{formatCurrency(el.shippingCost)}</TableCell>
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

export const SalesOrderDetailsTab = ({ details, isLoading }: SalesOrderDetailsTabProps) => {
  const { t, locale } = useLocale();
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!details || details.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {t("credit.noSalesOrderDetails") || "No sales order details available."}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t("credit.salesOrderDetails")}</h3>
        <div className="flex items-center gap-1 border rounded-md p-0.5">
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === "cards" ? (
        <CardView details={details} locale={locale} t={t} />
      ) : (
        <TableView details={details} locale={locale} t={t} />
      )}
    </div>
  );
};
