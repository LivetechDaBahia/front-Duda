import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FinancialHistory } from "@/types/credit";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/contexts/LocaleContext";

interface FinancialHistoryTableProps {
  data: FinancialHistory[];
  isLoading?: boolean;
}

export function FinancialHistoryTable({
  data,
  isLoading,
}: FinancialHistoryTableProps) {
  const { t } = useLocale();

  const formatCurrency = (value: number, currency: string) => {
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

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return "-";
    }
  };

  const getStatusVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes("baixado") || statusLower.includes("paid")) {
      return "secondary";
    }
    if (statusLower.includes("vencido") || statusLower.includes("overdue")) {
      return "destructive";
    }
    return "outline";
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("credit.noFinancialRecords")}
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("credit.status")}</TableHead>
            <TableHead>{t("credit.document")}</TableHead>
            <TableHead>{t("credit.type")}</TableHead>
            <TableHead>{t("credit.emission")}</TableHead>
            <TableHead>{t("credit.dueDate")}</TableHead>
            <TableHead>{t("credit.realDueDate")}</TableHead>
            <TableHead>{t("credit.lastPayment")}</TableHead>
            <TableHead className="text-right">{t("credit.value")}</TableHead>
            <TableHead className="text-right">{t("credit.balance")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <Badge variant={getStatusVariant(item.status)}>
                  {item.status}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-sm">
                {item.branch}-{item.prefix}/{item.number}-{item.parcel}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{item.type}</Badge>
              </TableCell>
              <TableCell>{formatDate(item.emission)}</TableCell>
              <TableCell>{formatDate(item.dueDate)}</TableCell>
              <TableCell>{formatDate(item.realDueDate)}</TableCell>
              <TableCell>{formatDate(item.lastPaymentDate)}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.value, item.currency)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(item.balance, item.currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
