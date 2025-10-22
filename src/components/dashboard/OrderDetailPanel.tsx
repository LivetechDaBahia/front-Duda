import { PurchaseOrder, ApprovalLevel, CostCenter, Product } from "@/types/order";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  DollarSign,
  Mail,
  MapPin,
  Package,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  CreditCard,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useOrderDetails } from "@/hooks/useOrderDetails";

interface OrderDetailPanelProps {
  order: PurchaseOrder | null;
  open: boolean;
  onClose: () => void;
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

const getApprovalIcon = (status: string) => {
  switch (status) {
    case '03':
    case '05':
      return <CheckCircle className="h-6 w-6 text-[hsl(var(--success))]" />;
    case '06':
    case '07':
      return <XCircle className="h-6 w-6 text-destructive" />;
    case '01':
    case '02':
      return <Clock className="h-6 w-6 text-warning" />;
    default:
      return <AlertCircle className="h-6 w-6 text-muted-foreground" />;
  }
};

export const OrderDetailPanel = ({
  order,
  open,
  onClose,
}: OrderDetailPanelProps) => {
  const { t } = useLocale();
  
  const {
    orderDetails,
    approvalLevels,
    costCenters,
    isLoadingOrder,
    isLoadingApprovals,
    isLoadingCostCenters,
    error,
  } = useOrderDetails({
    orderId: order?.id || "",
    branch: order?.branch || "",
    enabled: open && !!order,
  });

  if (!order) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl">{order.id}</SheetTitle>
              <p className="text-muted-foreground mt-1">
                {t("orderDetail.title")}
              </p>
            </div>
            <Badge className={statusColors[order.status as keyof typeof statusColors]}>
              {t(`status.${order.status}`)}
            </Badge>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t("orderDetail.tabs.overview")}</TabsTrigger>
            <TabsTrigger value="products">{t("orderDetail.tabs.products")}</TabsTrigger>
            <TabsTrigger value="approvals">{t("orderDetail.tabs.approvals")}</TabsTrigger>
            <TabsTrigger value="costCenters">{t("orderDetail.tabs.costCenters")}</TabsTrigger>
          </TabsList>

          {/* Tab 1: Overview */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Supplier Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">
                {t("orderDetail.supplierInfo")}
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {t("orderDetail.supplierName")}
                    </p>
                    <p className="font-medium">{order.supplierName}</p>
                  </div>
                </div>
                {order.supplierEmail && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("orderDetail.email")}
                      </p>
                      <p className="font-medium">{order.supplierEmail}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Order Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">
                {t("orderDetail.orderDetails")}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm">{t("orderDetail.totalValue")}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    ${order.value.toLocaleString()}
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm">{t("orderDetail.totalItems")}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {order.items}
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {t("orderDetail.createdDate")}
                    </p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {t("orderDetail.dueDate")}
                    </p>
                    <p className="font-medium">
                      {new Date(order.dueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">
                {t("orderDetail.description")}
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-foreground leading-relaxed">
                  {order.description}
                </p>
              </div>
            </div>

            <Separator />

            {/* Branch Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">
                {t("orderDetail.branch")}
              </h3>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("orderDetail.branchCode")}
                    </p>
                    <p className="font-medium">{order.branch}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details from API */}
            {orderDetails && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">
                    {t("orderDetail.additionalInfo")}
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("orderDetail.buyer")}
                        </p>
                        <p className="font-medium">{orderDetails.buyerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {t("orderDetail.payment")}
                        </p>
                        <p className="font-medium">{orderDetails.paymentDescription}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Tab 2: Products */}
          <TabsContent value="products" className="space-y-4 mt-6">
            {isLoadingOrder ? (
              <ProductsSkeleton />
            ) : error ? (
              <ErrorAlert error={error} />
            ) : orderDetails?.items && orderDetails.items.length > 0 ? (
              <ProductsTable products={orderDetails.items} coinSymbol={orderDetails.coinSymbol} t={t} />
            ) : (
              <EmptyState message={t("orderDetail.noProducts")} />
            )}
          </TabsContent>

          {/* Tab 3: Approval Levels */}
          <TabsContent value="approvals" className="space-y-4 mt-6">
            {isLoadingApprovals ? (
              <ApprovalsSkeleton />
            ) : error ? (
              <ErrorAlert error={error} />
            ) : approvalLevels && approvalLevels.length > 0 ? (
              <ApprovalsTimeline levels={approvalLevels} t={t} />
            ) : (
              <EmptyState message={t("orderDetail.noApprovals")} />
            )}
          </TabsContent>

          {/* Tab 4: Cost Centers */}
          <TabsContent value="costCenters" className="space-y-4 mt-6">
            {isLoadingCostCenters ? (
              <CostCentersSkeleton />
            ) : error ? (
              <ErrorAlert error={error} />
            ) : costCenters && costCenters.length > 0 ? (
              <CostCentersGrid costCenters={costCenters} coinSymbol={orderDetails?.coinSymbol || "$"} t={t} />
            ) : (
              <EmptyState message={t("orderDetail.noCostCenters")} />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

// Component for Products Table
const ProductsTable = ({ products, coinSymbol, t }: { products: Product[]; coinSymbol: string; t: (key: string) => string }) => (
  <div className="border rounded-lg overflow-hidden">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("orderDetail.product.item")}</TableHead>
          <TableHead>{t("orderDetail.product.description")}</TableHead>
          <TableHead>{t("orderDetail.product.partNumber")}</TableHead>
          <TableHead>{t("orderDetail.product.unit")}</TableHead>
          <TableHead className="text-right">{t("orderDetail.product.quantity")}</TableHead>
          <TableHead className="text-right">{t("orderDetail.product.unitPrice")}</TableHead>
          <TableHead className="text-right">{t("orderDetail.product.total")}</TableHead>
          <TableHead>{t("orderDetail.product.costCenter")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{product.item}</TableCell>
            <TableCell className="max-w-[200px] truncate">{product.description}</TableCell>
            <TableCell>{product.partNumber}</TableCell>
            <TableCell>{product.unit}</TableCell>
            <TableCell className="text-right">{product.amount}</TableCell>
            <TableCell className="text-right">{coinSymbol}{product.unitValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            <TableCell className="text-right font-semibold">{coinSymbol}{product.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
            <TableCell>{product.costCenter}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Component for Approval Timeline
const ApprovalsTimeline = ({ levels, t }: { levels: ApprovalLevel[]; t: (key: string) => string }) => (
  <div className="space-y-4">
    {levels.map((level, index) => (
      <Card key={index}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              {getApprovalIcon(level.status)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-semibold">
                  {t("orderDetail.approval.level")} {level.level} - {level.role}
                </h4>
                <Badge variant="outline">{level.statusDescription}</Badge>
              </div>
              {level.date && (
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date(level.date).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Component for Cost Centers Grid
const CostCentersGrid = ({ costCenters, coinSymbol, t }: { costCenters: CostCenter[]; coinSymbol: string; t: (key: string) => string }) => (
  <div className="grid gap-4">
    {costCenters.map((center, index) => (
      <Card key={index}>
        <CardHeader>
          <CardTitle className="text-base">{center.description}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("orderDetail.costCenter.code")}: {center.id}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">{t("orderDetail.costCenter.totalValue")}:</span>
              <span className="font-semibold">{coinSymbol}{center.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">{t("orderDetail.costCenter.percentage")}:</span>
              <span className="font-semibold">{center.percentage.toFixed(2)}%</span>
            </div>
            <Progress value={center.percentage} className="mt-2" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Loading Skeletons
const ProductsSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
);

const ApprovalsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const CostCentersSkeleton = () => (
  <div className="grid gap-4">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

// Error Alert
const ErrorAlert = ({ error }: { error: Error }) => (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>
      {error.message || "Failed to load data. Please try again."}
    </AlertDescription>
  </Alert>
);

// Empty State
const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Package className="h-12 w-12 text-muted-foreground mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);
