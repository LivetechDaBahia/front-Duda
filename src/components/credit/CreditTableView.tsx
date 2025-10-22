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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("credit.offer")}</TableHead>
            <TableHead>{t("credit.client")}</TableHead>
            <TableHead>{t("credit.value")}</TableHead>
            <TableHead>{t("credit.currency")}</TableHead>
            <TableHead>{t("credit.seller")}</TableHead>
            <TableHead>{t("credit.paymentConditions")}</TableHead>
            <TableHead>{t("credit.type")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("credit.group")}</TableHead>
            <TableHead>{t("credit.user")}</TableHead>
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
                  <TableCell className="font-medium">
                    {credit.details.offer}
                  </TableCell>
                  <TableCell>{credit.details.client}</TableCell>
                  <TableCell>
                    {formatCurrency(credit.details.value, credit.details.currency)}
                  </TableCell>
                  <TableCell>{credit.details.currency}</TableCell>
                  <TableCell>{credit.details.sellerName}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {credit.details.paymentConditions}
                  </TableCell>
                  <TableCell>{credit.details.type}</TableCell>
                  <TableCell>
                    {status && (
                      <Badge
                        variant={status.destructive ? "destructive" : "secondary"}
                      >
                        {status.description}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{credit.group}</TableCell>
                  <TableCell>{credit.user || "-"}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
