import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { SalesItem, SalesStatus } from "@/types/sales";

interface SalesTableViewProps {
  items: SalesItem[];
  statuses: SalesStatus[];
  onItemClick: (item: SalesItem) => void;
}

const formatCurrency = (value: number, currency: string) => {
  const currencyMap: Record<string, string> = { R$: "BRL", US$: "USD", "€": "EUR" };
  const code = currencyMap[currency] || currency || "BRL";
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: code }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesTableView = ({
  items,
  statuses,
  onItemClick,
}: SalesTableViewProps) => {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table className="w-full min-w-max">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Offer</TableHead>
            <TableHead className="whitespace-nowrap">Client</TableHead>
            <TableHead className="whitespace-nowrap">Value</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Seller</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">Payment</TableHead>
            <TableHead className="whitespace-nowrap hidden md:table-cell">Type</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="whitespace-nowrap hidden lg:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No sales items found
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const status = statuses.find((s) => s.id === item.statusId);
              return (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onItemClick(item)}
                >
                  <TableCell className="font-medium whitespace-nowrap">{item.offer}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.client} - {item.clientName}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatCurrency(item.value, item.currency)}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{item.sellerName}</TableCell>
                  <TableCell className="max-w-xs truncate hidden lg:table-cell">{item.paymentConditions}</TableCell>
                  <TableCell className="whitespace-nowrap hidden md:table-cell">{item.type}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {status && (
                      <Badge
                        variant={
                          item.statusId === "completed" ? "success" : item.statusId === "cancelled" ? "destructive" : "secondary"
                        }
                        className="text-xs"
                      >
                        {status.description}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap hidden lg:table-cell">{item.date}</TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
