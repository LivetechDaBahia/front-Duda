import { PurchaseOrderItem, OrderStatus } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface TableViewProps {
  orders: PurchaseOrderItem[];
  onOrderClick: (order: PurchaseOrderItem) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  processing: "bg-info/10 text-info border-info/20",
  completed:
    "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  approved:
    "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
  declined: "bg-destructive/10 text-destructive border-destructive/20",
};

type SortField =
  | "document"
  | "supplier"
  | "coinValue"
  | "statusDescription"
  | "emission";

const allStatuses: OrderStatus[] = [
  "pending",
  "processing",
  "approved",
  "completed",
  "declined",
  "cancelled",
];

// Best-effort mapping from item status fields to UI OrderStatus
const mapStatus = (item: PurchaseOrderItem): OrderStatus => {
  const s = `${item.statusCode ?? ""} ${item.statusDescription ?? ""}`
    .toLowerCase()
    .trim();
  if (s.includes("approved") || s.includes("aprov")) return "approved";
  if (s.includes("declined") || s.includes("reprov")) return "declined";
  if (s.includes("cancel")) return "cancelled";
  if (s.includes("complete") || s.includes("finaliz") || s.includes("done"))
    return "completed";
  if (s.includes("process") || s.includes("em and") || s.includes("ongoing"))
    return "processing";
  return "pending";
};

export const TableView = ({
  orders,
  onOrderClick,
  onStatusChange,
}: TableViewProps) => {
  const { t } = useLocale();
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const multiplier = sortDirection === "asc" ? 1 : -1;

    if (sortField === "coinValue") {
      return (a.coinValue - b.coinValue) * multiplier;
    }

    if (sortField === "emission") {
      return (
        (new Date(a.emission).getTime() - new Date(b.emission).getTime()) *
        multiplier
      );
    }

    return (
      String((a as any)[sortField]).localeCompare(
        String((b as any)[sortField]),
      ) * multiplier
    );
  });

  return (
    <div className="bg-card rounded-lg border shadow-sm animate-fade-in overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <button
                onClick={() => handleSort("document")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.orderID")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("supplier")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.client")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("coinValue")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.value")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>{t("table.items")}</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("statusDescription")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.status")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>{t("table.actions")}</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("emission")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.dueDate")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow
              key={order.document}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell
                className="font-medium cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {order.document}
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                {order.supplier}
              </TableCell>
              <TableCell
                className="font-semibold cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {order.coinSymbol}
                {order.coinValue.toLocaleString()}
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                {order.items}
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                <Badge className={statusColors[order.status]}>
                  {t(`status.${order.status}`)}
                </Badge>
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                {new Date(order.dueDate).toLocaleDateString()}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t("status.changeStatus")}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {allStatuses
                      .filter((s) => s !== order.status)
                      .map((statusOption) => (
                        <DropdownMenuItem
                          key={statusOption}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(order.id, statusOption);
                          }}
                        >
                          <Badge
                            className={`${statusColors[statusOption]} mr-2`}
                          >
                            {t(`status.${statusOption}`)}
                          </Badge>
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
