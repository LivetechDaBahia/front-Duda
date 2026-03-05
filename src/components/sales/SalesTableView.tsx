import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";

interface SalesTableViewProps {
  items: SalesElementItem[];
  stages: Stage[];
  onItemClick: (item: SalesElementItem) => void;
}

const formatCurrency = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesTableView = ({
  items,
  stages,
  onItemClick,
}: SalesTableViewProps) => {
  const { t, locale } = useLocale();

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="w-full min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t("sales.offer")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("sales.client")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("sales.value")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("sales.seller")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">{t("sales.type")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.paymentCondition")}</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.cnpj")}</TableHead>
            <TableHead className="whitespace-nowrap">{t("status")}</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">VIP</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">{t("sales.date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                {t("sales.noItems")}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const stage = stages.find((s) => s.id === item.stageId);
              return (
                <TableRow
                  key={`sales-table-${item.id}`}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onItemClick(item)}
                >
                  <TableCell className="font-medium whitespace-nowrap">{item.offer}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.client}/{item.clientBranch}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatCurrency(item.value, item.currency)}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{item.sellerName}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{item.type}</TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">{item.paymentCondition || "-"}</TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">{item.cnpj}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {stage && (
                      <Badge variant={stage.final ? "success" : "secondary"} className="text-xs">
                        {stage.name}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">
                    {item.vip === "Sim" && <Badge variant="default" className="text-xs">VIP</Badge>}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">
                    {formatDate(item.date, locale)}
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
