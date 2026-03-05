import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus } from "lucide-react";
import type { SalesElementItem } from "@/types/sales";
import { useSalesDetails } from "@/hooks/useSalesDetails";
import { useLocale } from "@/contexts/LocaleContext";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDate } from "@/lib/utils";

interface SalesDetailPanelProps {
  item: SalesElementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignClick?: (item: SalesElementItem) => void;
}

const formatCurrency = (value: number, currency: string = "BRL") => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesDetailPanel = ({ item, isOpen, onClose, onAssignClick }: SalesDetailPanelProps) => {
  const { t, locale } = useLocale();
  const { details, isLoading } = useSalesDetails(item ? String(item.id) : null);
  const { canManageSales } = usePermissions();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between gap-2">
            <SheetTitle>
              {item?.offer} - {item?.client}/{item?.clientBranch}
            </SheetTitle>
            {canManageSales && item && onAssignClick && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => onAssignClick(item)}
              >
                <UserPlus className="h-4 w-4" />
                {t("sales.assign.title")}
              </Button>
            )}
          </div>
        </SheetHeader>

        {item && (
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">{t("sales.overview")}</TabsTrigger>
              <TabsTrigger value="allocation">{t("sales.allocationDetails")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{t("sales.overview")}</h3>
                  {item.vip === "Sim" && <Badge variant="default">VIP</Badge>}
                </div>

                {/* Assignee info */}
                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground text-sm">{t("sales.assign.currentAssignee")}:</span>
                  <p className="font-medium text-sm">
                    {item.user || t("sales.assign.unassigned")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("sales.offer")}:</span>
                    <p className="font-medium">{item.offer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.client")}:</span>
                    <p className="font-medium">{item.client}/{item.clientBranch}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.value")}:</span>
                    <p className="font-medium">{formatCurrency(item.value, item.currency)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.currency")}:</span>
                    <p className="font-medium">{item.currency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.seller")}:</span>
                    <p className="font-medium">{item.sellerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.sellerGroup")}:</span>
                    <p className="font-medium">{item.sellerGroup}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.type")}:</span>
                    <p className="font-medium">{item.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.operation")}:</span>
                    <p className="font-medium">{item.oper}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.cnpj")}:</span>
                    <p className="font-medium">{item.cnpj}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.tid")}:</span>
                    <p className="font-medium">{item.tid || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.date")}:</span>
                    <p className="font-medium">{formatDate(item.date, locale)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.paymentCondition")}:</span>
                    <p className="font-medium">{item.paymentCondition || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.contract")}:</span>
                    <p className="font-medium">{item.contract || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.additive")}:</span>
                    <p className="font-medium">{item.additive || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.partial")}:</span>
                    <p className="font-medium">{item.partial || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("sales.reinvoice")}:</span>
                    <p className="font-medium">{item.reinvoice || "-"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4 mt-4">
              <h3 className="font-semibold">{t("sales.allocationDetails")}</h3>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : details.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("sales.noItems")}
                </p>
              ) : (
                <ScrollArea className="w-full">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap">{t("sales.branch")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.order")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.item")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.product")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.description")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.local")}</TableHead>
                          <TableHead className="whitespace-nowrap text-right">{t("sales.numAvailable")}</TableHead>
                          <TableHead className="whitespace-nowrap text-right">{t("sales.numReserved")}</TableHead>
                          <TableHead className="whitespace-nowrap">{t("sales.minDate")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.map((row, idx) => (
                          <TableRow key={`detail-${idx}`}>
                            <TableCell className="whitespace-nowrap">{row.branch}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.order}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.item}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.product}</TableCell>
                            <TableCell className="max-w-xs truncate">{row.description}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.local}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{row.numAvailable}</TableCell>
                            <TableCell className="whitespace-nowrap text-right">{row.numReserved}</TableCell>
                            <TableCell className="whitespace-nowrap">{row.minDate}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {details.map((row, idx) => (
                    <div key={`detail-card-${idx}`} className="mt-4 border rounded-md p-3">
                      <p className="font-medium text-sm mb-2">
                        {row.product} - {row.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">{t("sales.review")}:</span>
                          <p>{row.review || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.contract")}:</span>
                          <p>{row.contract || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.additional")}:</span>
                          <p>{row.additional || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.batch")}:</span>
                          <p>{row.batch || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.sequence")}:</span>
                          <p>{row.sequence || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.include")}:</span>
                          <p>{row.include || "-"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.productOrder")}:</span>
                          <p>{row.productOrder || "-"} ({t("sales.numOp")}: {row.numOp})</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.purchaseOrder")}:</span>
                          <p>{row.purchaseOrder || "-"} ({t("sales.numPo")}: {row.numPo})</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.purchaseRequest")}:</span>
                          <p>{row.purchaseRequest || "-"} ({t("sales.numSc")}: {row.numSc})</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">{t("sales.nf")}:</span>
                          <p>{row.nf || "-"}</p>
                        </div>
                        {row.shippingObservations && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{t("sales.shippingObservations")}:</span>
                            <p>{row.shippingObservations}</p>
                          </div>
                        )}
                        {row.logisticsObservations && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{t("sales.logisticsObservations")}:</span>
                            <p>{row.logisticsObservations}</p>
                          </div>
                        )}
                        {row.offerObservations && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">{t("sales.offerObservations")}:</span>
                            <p>{row.offerObservations}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};
