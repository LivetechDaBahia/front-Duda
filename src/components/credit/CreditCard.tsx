import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, History } from "lucide-react";
import type { CreditElementItem, CreditStatus } from "@/types/credit";
import { getCreditStatusById } from "@/lib/creditTransformer";

interface CreditCardProps {
  credit: CreditElementItem;
  statuses: CreditStatus[];
  onClick: () => void;
  onDragStart?: (e: React.DragEvent, creditId: number) => void;
  onDragEnd?: () => void;
  onActionsClick?: (credit: CreditElementItem, action: string) => void;
  isDragging?: boolean;
}

export const CreditCard = ({
  credit,
  statuses,
  onClick,
  onDragStart,
  onDragEnd,
  onActionsClick,
  isDragging,
}: CreditCardProps) => {
  const status = getCreditStatusById(credit.statusId, statuses);

  const formatCurrency = (value: number, currency: string) => {
    // Map currency symbols to ISO codes
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
      // Fallback if currency code is invalid
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  return (
    <Card
      className={`cursor-pointer hover:shadow-md transition-all border-l-4 border-r-4 w-full ${
        onDragStart ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "opacity-50 scale-95" : ""}`}
      style={{
        borderLeftColor: credit.borders.left,
        borderRightColor: credit.borders.right,
        ...(credit.background && { backgroundColor: credit.background }),
      }}
      onClick={onClick}
      draggable={!!onDragStart}
      onDragStart={onDragStart ? (e) => onDragStart(e, credit.id) : undefined}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs sm:text-sm truncate">
              {credit.details.offer}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {credit.details.client}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {status && (
              <Badge
                variant={status.destructive ? "destructive" : "secondary"}
                className="text-xs"
              >
                {status.description}
              </Badge>
            )}
            {onActionsClick && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span className="sr-only">Actions</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionsClick(credit, "view-logs");
                    }}
                  >
                    <History className="mr-2 h-4 w-4" />
                    View Logs
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
        {credit.badges && credit.badges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {credit.badges.map((badge) => (
              <Badge
                key={badge.id}
                variant={badge.variant || "outline"}
                className="text-xs"
                style={
                  badge.color
                    ? { borderColor: badge.color, color: badge.color }
                    : undefined
                }
              >
                {badge.label}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
