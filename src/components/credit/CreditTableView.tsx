import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, History, UserPlus, TrendingUp } from "lucide-react";
import type { CreditElementItem, CreditStatus } from "@/types/credit";
import { getCreditStatusById } from "@/lib/creditTransformer";
import { useLocale } from "@/contexts/LocaleContext";
import { usePermissions } from "@/hooks/usePermissions";

interface CreditTableViewProps {
  credits: CreditElementItem[];
  statuses: CreditStatus[];
  onCreditClick: (credit: CreditElementItem) => void;
  onStatusChange?: (
    creditId: number,
    offerId: string,
    newStatusId: string,
  ) => void;
  onActionsClick?: (credit: CreditElementItem, action: string) => void;
  loadingCreditId?: number | null;
}

export const CreditTableView = ({
  credits,
  statuses,
  onCreditClick,
  onStatusChange,
  onActionsClick,
  loadingCreditId,
}: CreditTableViewProps) => {
  const { t } = useLocale();
  const { hasMinimumLevel } = usePermissions();
  const isManager = hasMinimumLevel("Manager");

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
    <div className="rounded-md border overflow-x-auto">
      <Table className="w-full min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">
              {t("credit.offer")}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t("credit.client")}
            </TableHead>
            <TableHead className="whitespace-nowrap">
              {t("credit.value")}
            </TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">
              {t("credit.seller")}
            </TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              {t("credit.paymentConditions")}
            </TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">
              {t("credit.type")}
            </TableHead>
            <TableHead className="whitespace-nowrap">{t("status")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">
              {t("credit.user")}
            </TableHead>
            <TableHead className="whitespace-nowrap text-right">
              {t("table.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                {t("credit.noCredits")}
              </TableCell>
            </TableRow>
          ) : (
            credits.map((credit) => {
              const status = getCreditStatusById(credit.statusId, statuses);
              const isLoading = loadingCreditId === credit.id;
              return (
                <TableRow
                  key={`credit-table-${credit.id}`}
                  className={`cursor-pointer hover:bg-muted/50 relative ${isLoading ? "pointer-events-none opacity-60" : ""}`}
                  onClick={() => onCreditClick(credit)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary inline-block mr-2" />
                    )}
                    {credit.details.offer}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {credit.details.client}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(
                      credit.details.value,
                      credit.details.currency,
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    {credit.details.sellerName}
                  </TableCell>
                  <TableCell className="max-w-xs truncate hidden lg:table-cell">
                    {credit.details.paymentConditions}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    {credit.details.type}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {status && (
                      <Badge
                        variant={
                          credit.statusId === "S004"
                            ? "success"
                            : status.destructive
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {status.description}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">
                    {credit.user || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {(onActionsClick || onStatusChange) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            disabled={isLoading}
                          >
                            <span className="sr-only">{t("table.actions")}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50 bg-background">
                          <DropdownMenuLabel>{t("table.actions")}</DropdownMenuLabel>
                          {onActionsClick && (
                            <>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onActionsClick(credit, "view-logs");
                                }}
                              >
                                <History className="mr-2 h-4 w-4" />
                                {t("credit.viewLogs")}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />

                              {/* Assignment Options */}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onActionsClick(credit, "assign-to-me");
                                }}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                {t("credit.assign.self")}
                              </DropdownMenuItem>

                              {isManager && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onActionsClick(credit, "assign-item");
                                  }}
                                >
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  {t("credit.assignTo")}
                                </DropdownMenuItem>
                              )}

                              {isManager && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onActionsClick(credit, "set-credit-limit");
                                    }}
                                  >
                                    <TrendingUp className="mr-2 h-4 w-4" />
                                    {t("credit.limit.setLimit")}
                                  </DropdownMenuItem>
                                </>
                              )}
                            </>
                          )}

                          {onStatusChange && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                  {t("credit.changeStatus")}
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {statuses.map((s) => (
                                    <DropdownMenuItem
                                      key={s.id}
                                      disabled={s.id === credit.statusId}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (s.id !== credit.statusId) {
                                          onStatusChange(
                                            credit.id,
                                            credit.details.offer,
                                            s.id,
                                          );
                                        }
                                      }}
                                    >
                                      <Badge
                                        variant={
                                          s.id === "S004"
                                            ? "success"
                                            : s.destructive
                                              ? "destructive"
                                              : "secondary"
                                        }
                                        className="text-xs mr-2"
                                      >
                                        {s.description}
                                      </Badge>
                                      {s.description}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
