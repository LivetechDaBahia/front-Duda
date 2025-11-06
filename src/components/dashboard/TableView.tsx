import { PurchaseOrder, UIOrderStatus, isOrderLocked } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpDown,
  CheckCircle,
  XCircle,
  RotateCcw,
  Lock,
} from "lucide-react";
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
import { formatDateDDMMYYYY } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TableViewProps {
  orders: PurchaseOrder[];
  onOrderClick: (order: PurchaseOrder) => void;
  onStatusChange: (orderId: string, newStatus: UIOrderStatus) => void;
  onRevertOrder: (orderId: string) => void;
}

const statusColors = {
  pending: "bg-warning/10 text-warning border-warning/20",
  approved:
    "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] border-[hsl(var(--success))]/20",
  declined: "bg-destructive/10 text-destructive border-destructive/20",
};

type SortField = "id" | "supplierName" | "value" | "status" | "createdAt";

export const TableView = ({
  orders,
  onOrderClick,
  onStatusChange,
  onRevertOrder,
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

    if (sortField === "value") {
      return ((a.value || 0) - (b.value || 0)) * multiplier;
    }

    if (sortField === "createdAt") {
      return (
        (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
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
    <div className="bg-card rounded-lg border shadow-sm animate-fade-in overflow-x-auto">
      <Table className="w-full min-w-max">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>
              <button
                onClick={() => handleSort("id")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.orderID")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("supplierName")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.supplier")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>{t("table.branch")}</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("value")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.value")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>{t("table.items")}</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("status")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.status")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
            <TableHead>{t("table.actions")}</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort("createdAt")}
                className="flex items-center gap-1 font-semibold hover:text-primary transition-colors"
              >
                {t("table.creationDate")}
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow
              key={order.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell
                className="font-medium cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {order.id}
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                {order.supplierName}
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                {order.branch}
              </TableCell>
              <TableCell
                className="font-semibold cursor-pointer"
                onClick={() => onOrderClick(order)}
              >
                {order.coinSymbol}
                {(order.value || 0).toLocaleString()}
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
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      statusColors[order.status as keyof typeof statusColors]
                    }
                  >
                    {t(`status.${order.status}`)}
                  </Badge>
                  {isOrderLocked(order) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className="bg-muted text-muted-foreground border-muted-foreground/20">
                            <Lock className="w-3 h-3" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("order.lockedTooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={(e) => e.stopPropagation()}
                      disabled={isOrderLocked(order)}
                    >
                      {t("table.actions")}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Show revert option for approved/declined orders */}
                    {(order.status === "approved" ||
                      order.status === "declined") && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevertOrder(order.id);
                        }}
                        className="text-warning"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t("order.revertToPending")}
                      </DropdownMenuItem>
                    )}

                    {/* Show approve option for pending/declined orders */}
                    {(order.status === "pending" ||
                      order.status === "declined") && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(order.id, "approved");
                        }}
                        className="text-[hsl(var(--success))]"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("order.approve")}
                      </DropdownMenuItem>
                    )}

                    {/* Show decline option for pending/approved orders */}
                    {(order.status === "pending" ||
                      order.status === "approved") && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(order.id, "declined");
                        }}
                        className="text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t("order.decline")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
              <TableCell
                onClick={() => onOrderClick(order)}
                className="cursor-pointer"
              >
                {formatDateDDMMYYYY(order.dueDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
