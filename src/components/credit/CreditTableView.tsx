import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { CreditElementItem, CreditStatus } from "@/types/credit";
import { getCreditStatusById } from "@/lib/creditTransformer";
import { useLocale } from "@/contexts/LocaleContext";

interface CreditTableViewProps {
  credits: CreditElementItem[];
  statuses: CreditStatus[];
  onCreditClick: (credit: CreditElementItem) => void;
}

export const CreditTableView = ({
  credits,
  statuses,
  onCreditClick,
}: CreditTableViewProps) => {
  const { t } = useLocale();

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
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t("credit.offer")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("credit.client")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("credit.value")}</TableHead>
            <TableHead className="whitespace-nowrap hidden sm:table-cell">{t("credit.currency")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("credit.seller")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("credit.paymentConditions")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("credit.type")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("status")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("credit.group")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("credit.user")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {credits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                {t("credit.noCredits")}
              </TableCell>
            </TableRow>
          ) : (
            credits.map((credit) => {
              const status = getCreditStatusById(credit.statusId, statuses);
              return (
                <TableRow
                  key={`credit-table-${credit.id}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onCreditClick(credit)}
                >
                  <TableCell className="font-medium whitespace-nowrap">
                    {credit.details.offer}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{credit.details.client}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(credit.details.value, credit.details.currency)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden sm:table-cell">{credit.details.currency}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{credit.details.sellerName}</TableCell>
                  <TableCell className="max-w-xs truncate hidden lg:table-cell">
                    {credit.details.paymentConditions}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{credit.details.type}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {status && (
                      <Badge
                        variant={status.destructive ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {status.description}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">{credit.group}</TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">{credit.user || "-"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
