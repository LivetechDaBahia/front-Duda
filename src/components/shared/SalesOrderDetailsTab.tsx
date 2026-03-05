import { Skeleton } from "@/components/ui/skeleton";
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

export const SalesOrderDetailsTab = ({ details, isLoading }: SalesOrderDetailsTabProps) => {
  const { t, locale } = useLocale();

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
      <h3 className="font-semibold">{t("credit.salesOrderDetails")}</h3>
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
};
