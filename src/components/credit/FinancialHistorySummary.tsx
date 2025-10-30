import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface FinancialHistorySummaryProps {
  totalValue: number;
  totalBalance: number;
  currency: string;
  itemCount: number;
}

export function FinancialHistorySummary({
  totalValue,
  totalBalance,
  currency,
  itemCount,
}: FinancialHistorySummaryProps) {
  const { t } = useLocale();

  const formatCurrency = (value: number) => {
    const currencyMap: Record<string, string> = {
      R$: "BRL",
      US$: "USD",
      "€": "EUR",
    };

    const currencyCode = currencyMap[currency] || currency || "BRL";

    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currencyCode,
      }).format(value);
    } catch (error) {
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Total Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("credit.totalValue")}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {itemCount} {itemCount === 1 ? t("credit.item") : t("credit.items")}
          </p>
        </CardContent>
      </Card>

      {/* Total Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("credit.totalBalance")}
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t("credit.outstandingAmount")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
