import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SalesItem, SalesStatus } from "@/types/sales";

interface SalesCardProps {
  item: SalesItem;
  statuses: SalesStatus[];
  onClick: () => void;
}

const formatCurrency = (value: number, currency: string) => {
  const currencyMap: Record<string, string> = {
    R$: "BRL",
    US$: "USD",
    "€": "EUR",
  };
  const code = currencyMap[currency] || currency || "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: code }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesCard = ({ item, statuses, onClick }: SalesCardProps) => {
  const status = statuses.find((s) => s.id === item.statusId);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all w-full"
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-xs">Offer</span>
            <h3 className="font-semibold text-xs sm:text-sm truncate">
              {item.offer}
            </h3>
            <span className="text-muted-foreground text-xs">Client</span>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {item.client} - {item.clientName}
            </p>
          </div>
          {status && (
            <Badge
              variant={
                item.statusId === "completed"
                  ? "success"
                  : item.statusId === "cancelled"
                    ? "destructive"
                    : "secondary"
              }
              className="text-xs shrink-0"
            >
              {status.description}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-1.5 sm:space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">Value</span>
          <span className="font-medium">
            {formatCurrency(item.value, item.currency)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Seller</span>
          <span className="truncate ml-2">{item.sellerName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Type</span>
          <span className="truncate ml-2">{item.type}</span>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {item.date} • {item.paymentConditions}
        </div>
      </CardContent>
    </Card>
  );
};
