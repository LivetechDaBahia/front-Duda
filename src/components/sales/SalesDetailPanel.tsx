import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import type { SalesElementItem } from "@/types/sales";
import { useSalesDetails } from "@/hooks/useSalesDetails";
import { useSalesOrders } from "@/hooks/useSalesOrders";
import { AllocationDetailsTab } from "@/components/sales/AllocationDetailsTab";
import { SalesTrackingTab } from "@/components/sales/SalesTrackingTab";
import { SalesOrdersTab } from "@/components/sales/SalesOrdersTab";
import { DocumentsTab } from "@/components/shared/DocumentsTab";
import { useLocale } from "@/contexts/LocaleContext";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import type { CreditDocument, CreditClientDocument } from "@/types/credit";
import { useState, useEffect } from "react";

interface SalesDetailPanelProps {
  item: SalesElementItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAssignClick?: (item: SalesElementItem) => void;
  variations?: SalesElementItem[];
}

const formatCurrency = (value: number, currency: string = "BRL") => {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

export const SalesDetailPanel = ({
  item,
  isOpen,
  onClose,
  onAssignClick,
  variations = [],
}: SalesDetailPanelProps) => {
  const { t, locale } = useLocale();
  const { details, isLoading } = useSalesDetails(item ? item.key : null);
  const {
    orders,
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useSalesOrders(item ? item.key : null);
  const { canManageSales } = usePermissions();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const DOCUMENTS_BASE_PATH =
    import.meta.env.VITE_DOCUMENTS_SHARE_BASE_PATH || "";

  // Client documents pagination
  const [clientDocsPage, setClientDocsPage] = useState(1);
  const [clientDocsSize, setClientDocsSize] = useState(10);

  // Reset pagination when item changes
  useEffect(() => {
    setClientDocsPage(1);
  }, [item?.key]);

  // Helper to convert full UNC path to relative path
  const toRelativeSharePath = (uncPath: string, baseShare: string): string => {
    const norm = (s: string) =>
      s
        .replace(/[/\\]+/g, "\\")
        .replace(/^\\+/, "\\\\")
        .replace(/\\+$/, "")
        .trim();

    const u = norm(uncPath);
    const b = norm(baseShare);

    if (u.toLowerCase().startsWith(b.toLowerCase())) {
      let relative = u.slice(b.length);
      if (relative.startsWith("\\")) {
        relative = relative.slice(1);
      }
      return relative.replace(/\\/g, "/");
    }

    if (!/^\\\\/.test(u) && !/^[a-zA-Z]:[\\/]/.test(u) && !u.startsWith("/")) {
      return u.replace(/\\/g, "/");
    }

    throw new Error("Path must be inside the configured base share");
  };

  const openDocument = async (docObject: string, path: string) => {
    try {
      const relativePath = toRelativeSharePath(path, DOCUMENTS_BASE_PATH);
      const url = `${API_BASE_URL}/documents/open-share?path=${encodeURIComponent(relativePath)}`;
      const extension = docObject.toLowerCase().split(".").pop();
      const downloadExtensions = ["csv", "xlsx", "docx", "xls", "doc"];

      if (downloadExtensions.includes(extension || "")) {
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = docObject;
        a.click();
        URL.revokeObjectURL(blobUrl);
      } else {
        window.open(url, "_blank", "noopener");
      }
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  // Sales order documents
  const { data: documents, isLoading: isLoadingDocuments } = useQuery<
    CreditDocument[]
  >({
    queryKey: ["creditDocuments", item?.key],
    queryFn: () => creditService.getCreditDocuments(item!.key),
    enabled: !!item?.key,
  });

  // Client documents
  const { data: clientDocuments, isLoading: isLoadingClientDocs } = useQuery<
    CreditClientDocument[]
  >({
    queryKey: [
      "creditClientDocuments",
      item?.key,
      clientDocsPage,
      clientDocsSize,
    ],
    queryFn: () =>
      creditService.getClientDocuments(
        item!.key,
        clientDocsPage,
        clientDocsSize,
      ),
    enabled: !!item?.key,
  });

  const clientDocsTotalPages = Math.ceil(
    (clientDocuments || []).length / clientDocsSize,
  );

  return (
    <div className="h-full overflow-y-auto border-l bg-background">
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-6">
          <h2 className="text-lg font-semibold truncate">
            {item?.offer} - {item?.client}/{item?.clientBranch}
            {item?.clientName ? ` - ${item.clientName}` : ""}
          </h2>
          <div className="flex items-center gap-2 shrink-0">
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
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {item && (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">{t("sales.overview")}</TabsTrigger>
              <TabsTrigger value="salesOrder">
                {t("sales.internalOrder")}
              </TabsTrigger>
              <TabsTrigger value="documents">
                {t("credit.documents")}
              </TabsTrigger>
              <TabsTrigger value="allocation">
                {t("sales.allocationDetails")}
              </TabsTrigger>
              <TabsTrigger value="tracking">{t("sales.tracking")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{t("sales.overview")}</h3>
                  {item.vip === "Sim" && <Badge variant="default">VIP</Badge>}
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground text-sm">
                    {t("sales.assign.currentAssignee")}:
                  </span>
                  <p className="font-medium text-sm">
                    {item.user || t("sales.assign.unassigned")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.offer")}:
                    </span>
                    <p className="font-medium">{item.offer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.client")}:
                    </span>
                    <p className="font-medium">
                      {item.client}/{item.clientBranch}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.value")}:
                    </span>
                    <p className="font-medium">
                      {formatCurrency(item.value, item.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.currency")}:
                    </span>
                    <p className="font-medium">{item.currency}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.seller")}:
                    </span>
                    <p className="font-medium">{item.sellerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.sellerGroup")}:
                    </span>
                    <p className="font-medium">{item.sellerGroup}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.group")}:
                    </span>
                    <p className="font-medium">{item.groupName || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.type")}:
                    </span>
                    <p className="font-medium">{item.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.cnpj")}:
                    </span>
                    <p className="font-medium">{item.cnpj}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.tid")}:
                    </span>
                    <p className="font-medium">{item.tid || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.date")}:
                    </span>
                    <p className="font-medium">
                      {formatDate(item.date, locale)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.paymentCondition")}:
                    </span>
                    <p className="font-medium">
                      {item.paymentCondition || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.contract")}:
                    </span>
                    <p className="font-medium">{item.contract || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.additive")}:
                    </span>
                    <p className="font-medium">{item.additive || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.partial")}:
                    </span>
                    <p className="font-medium">{item.partial || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("sales.reinvoice")}:
                    </span>
                    <p className="font-medium">{item.reinvoice || "-"}</p>
                  </div>
                </div>

                {/* Current card PO details */}
                <div className="border-t pt-3 mt-3">
                  <h4 className="font-medium text-sm mb-2">
                    {t("sales.purchaseOrders")}
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {t("sales.variations.purchaseOrderId")}:
                      </span>
                      <p className="font-medium">
                        {item.purchaseOrderId || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("sales.variations.purchaseOrderBranch")}:
                      </span>
                      <p className="font-medium">
                        {item.purchaseOrderBranch || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {t("sales.variations.processId")}:
                      </span>
                      <p className="font-medium">{item.processId || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="salesOrder" className="space-y-4 mt-4">
              <SalesOrdersTab
                orders={orders}
                isLoading={isLoadingOrders}
                groupName={item.name}
                onObservationsChanged={() => refetchOrders()}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <DocumentsTab
                documents={documents || []}
                clientDocuments={clientDocuments || []}
                isLoadingDocuments={isLoadingDocuments}
                isLoadingClientDocs={isLoadingClientDocs}
                onOpenDocument={openDocument}
                clientDocsPage={clientDocsPage}
                clientDocsSize={clientDocsSize}
                clientDocsTotalPages={clientDocsTotalPages}
                onClientDocsPageChange={setClientDocsPage}
                onClientDocsSizeChange={(val) => {
                  setClientDocsSize(val);
                  setClientDocsPage(1);
                }}
              />
            </TabsContent>

            <TabsContent value="allocation" className="space-y-4 mt-4">
              <AllocationDetailsTab details={details} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4 mt-4">
              <SalesTrackingTab
                orderId={item.purchaseOrderId}
                orderBranch={item.purchaseOrderBranch}
                processId={item.processId}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};
