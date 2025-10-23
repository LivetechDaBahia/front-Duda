import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CreditElementItem, CreditStatus } from "@/types/credit";
import { getCreditStatusById } from "@/lib/creditTransformer";

interface CreditCardProps {
  credit: CreditElementItem;
  statuses: CreditStatus[];
  onClick: () => void;
}

export const CreditCard = ({ credit, statuses, onClick }: CreditCardProps) => {
  const status = getCreditStatusById(credit.statusId, statuses);
  
  const formatCurrency = (value: number, currency: string) => {
    // Map currency symbols to ISO codes
    const currencyMap: Record<string, string> = {
      "R$": "BRL",
      "US$": "USD",
      "€": "EUR",
    };
    
    const currencyCode = currencyMap[currency] || currency || "BRL";
    
    try {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: currencyCode,
      }).format(value);
    } catch (error) {
      // Fallback if currency code is invalid
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: credit.color }}
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm truncate">{credit.details.offer}</h3>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {credit.details.client}
            </p>
          </div>
          {status && (
            <Badge
              variant={status.destructive ? "destructive" : "secondary"}
              className="shrink-0 text-xs"
            >
              {status.description}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Value:</span>
          <span className="font-medium">
            {formatCurrency(credit.details.value, credit.details.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Seller:</span>
          <span className="truncate ml-2">{credit.details.sellerName}</span>
        </div>
        {credit.details.paymentConditions && (
          <div className="text-xs text-muted-foreground truncate">
            {credit.details.paymentConditions}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
