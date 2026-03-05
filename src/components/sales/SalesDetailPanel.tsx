import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import type { SalesElementItem } from "@/types/sales";
import { useSalesDetails } from "@/hooks/useSalesDetails";
import { AllocationDetailsTab } from "@/components/sales/AllocationDetailsTab";
import { SalesOrderDetailsTab } from "@/components/shared/SalesOrderDetailsTab";
import { DocumentsTab } from "@/components/shared/DocumentsTab";
import { useLocale } from "@/contexts/LocaleContext";
import { usePermissions } from "@/hooks/usePermissions";
import { formatDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import type { CreditElementDetails, CreditDocument, CreditClientDocument } from "@/types/credit";
import { useState, useEffect } from "react";

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
  const { details, isLoading } = useSalesDetails(item ? item.key : null);
  const { canManageSales } = usePermissions();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const DOCUMENTS_BASE_PATH = import.meta.env.VITE_DOCUMENTS_SHARE_BASE_PATH || "";

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

  // Credit element details (sales order)
  const {
    data: creditElementDetails,
    isLoading: isLoadingCreditDetails,
  } = useQuery<CreditElementDetails[]>({
    queryKey: ["creditDetails", item?.key],
    queryFn: () => creditService.getCreditElementDetails(item!.key),
    enabled: !!item?.key,
  });

  // Sales order documents
  const {
    data: documents,
    isLoading: isLoadingDocuments,
  } = useQuery<CreditDocument[]>({
    queryKey: ["creditDocuments", item?.key],
    queryFn: () => creditService.getCreditDocuments(item!.key),
    enabled: !!item?.key,
  });

  // Client documents
  const {
    data: clientDocuments,
    isLoading: isLoadingClientDocs,
  } = useQuery<CreditClientDocument[]>({
    queryKey: ["creditClientDocuments", item?.key, clientDocsPage, clientDocsSize],
    queryFn: () => creditService.getClientDocuments(item!.key, clientDocsPage, clientDocsSize),
    enabled: !!item?.key,
  });

  const clientDocsTotalPages = Math.ceil((clientDocuments || []).length / clientDocsSize);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-[50%] overflow-y-auto">
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t("sales.overview")}</TabsTrigger>
              <TabsTrigger value="salesOrder">{t("credit.salesOrder")}</TabsTrigger>
              <TabsTrigger value="documents">{t("credit.documents")}</TabsTrigger>
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

            <TabsContent value="salesOrder" className="space-y-4 mt-4">
              <SalesOrderDetailsTab
                details={creditElementDetails || []}
                isLoading={isLoadingCreditDetails}
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
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};
