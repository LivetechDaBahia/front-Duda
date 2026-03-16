import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SalesOrderDetailsTab } from "@/components/shared/SalesOrderDetailsTab";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle, Upload } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCreditDetails } from "@/hooks/useCreditDetails";
import { useLocale } from "@/contexts/LocaleContext";
import type { CreditElementItem } from "@/types/credit";
import { Badge } from "@/components/ui/badge";
import { FinancialHistoryFilters } from "@/components/credit/FinancialHistoryFilters";
import { FinancialHistorySummary } from "@/components/credit/FinancialHistorySummary";
import { FinancialHistoryTable } from "@/components/credit/FinancialHistoryTable";
import { ItemsPerPageSelector } from "@/components/shared/ItemsPerPageSelector";
import { DocumentUploadDialog } from "@/components/credit/DocumentUploadDialog";
import { formatDate } from "@/lib/utils";
import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import { usePermissions } from "@/hooks/usePermissions";

interface CreditDetailPanelProps {
  credit: CreditElementItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreditDetailPanel = ({
  credit,
  isOpen,
  onClose,
}: CreditDetailPanelProps) => {
  const { t, locale } = useLocale();
  const { canManageCredit } = usePermissions();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Client documents pagination
  const [clientDocsPage, setClientDocsPage] = useState(1);
  const [clientDocsSize, setClientDocsSize] = useState(10);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const DOCUMENTS_BASE_PATH = import.meta.env.VITE_DOCUMENTS_SHARE_BASE_PATH;

  if (!DOCUMENTS_BASE_PATH) {
    throw new Error("DOCUMENTS_BASE_PATH must be set in .env");
  }

  // Helper to convert full UNC path to relative path for the /documents/open-share endpoint
  const toRelativeSharePath = (uncPath: string, baseShare: string): string => {
    // Normalize: collapse multiple slashes/backslashes to single backslash, trim
    const norm = (s: string) =>
      s
        .replace(/[/\\]+/g, "\\")
        .replace(/^\\+/, "\\\\") // Preserve UNC prefix (\\server)
        .replace(/\\+$/, "") // Remove trailing slashes
        .trim();

    const u = norm(uncPath);
    const b = norm(baseShare);

    console.log("UNC Path normalized:", u);
    console.log("Base Share normalized:", b);

    // Check if the path starts with the base share
    if (u.toLowerCase().startsWith(b.toLowerCase())) {
      // Get the relative part after the base, removing leading separator
      let relative = u.slice(b.length);
      if (relative.startsWith("\\")) {
        relative = relative.slice(1);
      }
      const result = relative.replace(/\\/g, "/"); // use forward slashes for URLs
      console.log("Relative path:", result);
      return result;
    }

    // If it already looks relative (no UNC prefix, no drive letter, no leading slash), return as-is
    if (!/^\\\\/.test(u) && !/^[a-zA-Z]:[\\/]/.test(u) && !u.startsWith("/")) {
      return u.replace(/\\/g, "/");
    }

    console.error("Path conversion failed. UNC:", u, "Base:", b);
    throw new Error("Path must be inside the configured base share");
  };

  // Helper function to open or download documents from the backend
  // Uses the new /documents/open-share endpoint with relative path
  const openDocument = async (docObject: string, path: string) => {
    try {
      // Convert full UNC path to relative path
      const relativePath = toRelativeSharePath(path, DOCUMENTS_BASE_PATH);

      // Build URL with query parameter for the new endpoint
      const url = `${API_BASE_URL}/documents/open-share?path=${encodeURIComponent(relativePath)}`;

      const extension = docObject.toLowerCase().split(".").pop();

      // Download these file types instead of opening inline
      const downloadExtensions = ["csv", "xlsx", "docx", "xls", "doc"];

      if (downloadExtensions.includes(extension || "")) {
        // Download the file as blob
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
        // Open inline in new tab (PDF, images, etc.)
        // The endpoint sets Content-Disposition: inline, so the browser will display it
        window.open(url, "_blank", "noopener");
      }
    } catch (error) {
      console.error("Error opening document:", error);
    }
  };

  const {
    elementDetailsList,
    documents,
    quoteDocuments,
    rentalDocuments,
    clientDocuments,
    clientDocumentsTotal,
    isLoadingClientDocs,
    clientDetails,
    clientHistory,
    linkedClients,
    contracts,
    isLoadingContracts,
    isLoading,
  } = useCreditDetails({
    creditId: credit?.key || null,
    clientBranch: credit?.details.clientBranch || undefined,
    clientId: credit?.details.client || undefined,
    proposalId: credit?.details.offer || undefined,
    clientDocsPage,
    clientDocsSize,
  });

  // Reset client docs page when credit changes
  useEffect(() => {
    setClientDocsPage(1);
  }, [credit?.key]);

  const clientDocsTotalPages = Math.ceil(clientDocumentsTotal / clientDocsSize);

  // Fetch credit limit data
  const { data: creditLimit, isLoading: isLoadingLimit } = useQuery({
    queryKey: [
      "credit-limit",
      credit?.details.client,
      credit?.details.clientBranch,
    ],
    queryFn: () =>
      creditService.getCreditLimit(
        credit?.details.client || "",
        credit?.details.clientBranch || "",
      ),
    enabled: !!credit?.details.client && !!credit?.details.clientBranch,
  });

  // Financial history filters and pagination state
  const [financialFilters, setFinancialFilters] = useState<{
    statuses: string[];
    types: string[];
  }>({ statuses: [], types: [] });

  const [financialPage, setFinancialPage] = useState(1);
  const [financialItemsPerPage, setFinancialItemsPerPage] = useState(10);

  // Extract unique statuses and types
  const availableStatuses = useMemo(() => {
    const statuses = new Set(clientHistory.map((item) => item.status));
    return Array.from(statuses).sort();
  }, [clientHistory]);

  const availableTypes = useMemo(() => {
    const types = new Set(clientHistory.map((item) => item.type));
    return Array.from(types).sort();
  }, [clientHistory]);

  // Filter data
  const filteredFinancialHistory = useMemo(() => {
    let filtered = [...clientHistory];

    // Status filter (multi-select OR logic)
    if (financialFilters.statuses.length > 0) {
      filtered = filtered.filter((item) =>
        financialFilters.statuses.includes(item.status),
      );
    }

    // Type filter (multi-select OR logic)
    if (financialFilters.types.length > 0) {
      filtered = filtered.filter((item) =>
        financialFilters.types.includes(item.type),
      );
    }

    return filtered;
  }, [clientHistory, financialFilters]);

  // Calculate totals
  const financialTotals = useMemo(() => {
    const totalValue = filteredFinancialHistory.reduce(
      (sum, item) => sum + item.value,
      0,
    );
    const totalBalance = filteredFinancialHistory.reduce(
      (sum, item) => sum + item.balance,
      0,
    );
    return { totalValue, totalBalance };
  }, [filteredFinancialHistory]);

  // Paginate
  const paginatedFinancialHistory = useMemo(() => {
    const start = (financialPage - 1) * financialItemsPerPage;
    const end = start + financialItemsPerPage;
    return filteredFinancialHistory.slice(start, end);
  }, [filteredFinancialHistory, financialPage, financialItemsPerPage]);

  const totalPages = Math.ceil(
    filteredFinancialHistory.length / financialItemsPerPage,
  );

  // Reset page when filters change
  const handleFiltersChange = (newFilters: typeof financialFilters) => {
    setFinancialFilters(newFilters);
    setFinancialPage(1);
  };

  const handleClearFilters = () => {
    setFinancialFilters({ statuses: [], types: [] });
    setFinancialPage(1);
  };

  const formatCurrency = (value: number, currency: string = "BRL") => {
    // Map currency symbols to ISO codes
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
      // Fallback if currency code is invalid
      return `${currency} ${value.toFixed(2)}`;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {credit?.details.offer} - {credit?.details.client}
          </SheetTitle>
        </SheetHeader>

        {credit && (
          <Tabs defaultValue="client" className="mt-6">
            <TabsList className="h-13 grid w-full grid-cols-3 grid-rows-2 gap-4 border-b border-muted-foreground pb-2 mb-2">
              <TabsTrigger value="client">{t("credit.clientInfo")}</TabsTrigger>
              <TabsTrigger value="documents">
                {t("credit.documents")}
              </TabsTrigger>
              <TabsTrigger value="overview">
                {t("credit.salesOrder")}
              </TabsTrigger>
              <TabsTrigger value="linkedClients">
                {t("credit.linkedClients")}
              </TabsTrigger>
              <TabsTrigger value="financialHistory">
                {t("credit.financialHistory")}
              </TabsTrigger>
              <TabsTrigger value="contracts">
                {t("credit.contracts")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h3 className="font-semibold">{t("credit.elementInfo")}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.offer")}:
                    </span>
                    <p className="font-medium">{credit.details.offer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.client")}:
                    </span>
                    <p className="font-medium">{credit.details.client}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.value")}:
                    </span>
                    <p className="font-medium">
                      {formatCurrency(
                        credit.details.value,
                        credit.details.currency,
                      )}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.seller")}:
                    </span>
                    <p className="font-medium">{credit.details.sellerName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.paymentConditions")}:
                    </span>
                    <p className="font-medium">
                      {credit.details.paymentConditions}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.tid")}:
                    </span>
                    <p className="font-medium">{credit.details.tid}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.type")}:
                    </span>
                    <p className="font-medium">{credit.details.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      {t("credit.group")}:
                    </span>
                    <p className="font-medium">{credit.details.sellerGroup}</p>
                  </div>
                </div>
              </div>

              <SalesOrderDetailsTab
                details={elementDetailsList}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              {/* Upload Button - only visible for users with update permission */}
              {canManageCredit && credit?.details.offer && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadDialogOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {t("credit.upload.title")}
                  </Button>
                </div>
              )}

              <Tabs defaultValue="sales" className="w-full">
                <TabsList>
                  <TabsTrigger value="sales">
                    {t("credit.salesDocuments")} ({documents.length})
                  </TabsTrigger>
                  <TabsTrigger value="quote">
                    {t("credit.quoteDocuments")} (
                    {quoteDocuments.length + rentalDocuments.length})
                  </TabsTrigger>
                  <TabsTrigger value="client">
                    {t("credit.clientDocuments")} ({clientDocuments.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sales">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t("credit.noDocuments")}
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("credit.docTitle")}</TableHead>
                          <TableHead>{t("credit.docDescription")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((doc, idx) => (
                          <TableRow
                            key={idx}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() =>
                              openDocument(doc.docObject, doc.path)
                            }
                          >
                            <TableCell>{doc.docTitle}</TableCell>
                            <TableCell>{doc.docDescription}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="quote">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : quoteDocuments.length === 0 &&
                    rentalDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t("credit.noDocuments")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {quoteDocuments.length > 0 && (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t("credit.docTitle")}</TableHead>
                              <TableHead>
                                {t("credit.docDescription")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {quoteDocuments.map((doc, idx) => (
                              <TableRow
                                key={idx}
                                className="cursor-pointer hover:bg-muted/50"
                                onClick={() =>
                                  openDocument(doc.docObject, doc.path)
                                }
                              >
                                <TableCell>{doc.docTitle}</TableCell>
                                <TableCell>{doc.docDescription}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                      {rentalDocuments.length > 0 && (
                        <>
                          <h4 className="font-medium text-sm text-muted-foreground pt-2">
                            {t("credit.rentalDocuments")}
                          </h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>{t("credit.docTitle")}</TableHead>
                                <TableHead>
                                  {t("credit.docDescription")}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {rentalDocuments.map((doc, idx) => (
                                <TableRow
                                  key={`rental-${idx}`}
                                  className="cursor-pointer hover:bg-muted/50"
                                  onClick={() =>
                                    openDocument(doc.docObject, doc.path)
                                  }
                                >
                                  <TableCell>{doc.docTitle}</TableCell>
                                  <TableCell>{doc.docDescription}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="client">
                  {isLoadingClientDocs ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : clientDocuments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {t("credit.noDocuments")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("credit.docTitle")}</TableHead>
                            <TableHead>{t("credit.docDescription")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientDocuments.map((doc, idx) => (
                            <TableRow
                              key={idx}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() =>
                                openDocument(doc.docObject, doc.path)
                              }
                            >
                              <TableCell>{doc.docTitle}</TableCell>
                              <TableCell>{doc.docDescription}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination controls */}
                      <div className="flex items-center justify-between">
                        <ItemsPerPageSelector
                          value={clientDocsSize}
                          onChange={(val) => {
                            setClientDocsSize(val);
                            setClientDocsPage(1);
                          }}
                        />
                        {clientDocsTotalPages > 1 && (
                          <Pagination>
                            <PaginationContent>
                              <PaginationItem>
                                <PaginationPrevious
                                  onClick={() =>
                                    setClientDocsPage(
                                      Math.max(1, clientDocsPage - 1),
                                    )
                                  }
                                  className={
                                    clientDocsPage <= 1
                                      ? "pointer-events-none opacity-50"
                                      : "cursor-pointer"
                                  }
                                />
                              </PaginationItem>
                              {Array.from(
                                { length: Math.min(5, clientDocsTotalPages) },
                                (_, i) => {
                                  let pageNum: number;
                                  if (clientDocsTotalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (clientDocsPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (
                                    clientDocsPage >=
                                    clientDocsTotalPages - 2
                                  ) {
                                    pageNum = clientDocsTotalPages - 4 + i;
                                  } else {
                                    pageNum = clientDocsPage - 2 + i;
                                  }
                                  return (
                                    <PaginationItem key={pageNum}>
                                      <PaginationLink
                                        onClick={() =>
                                          setClientDocsPage(pageNum)
                                        }
                                        isActive={clientDocsPage === pageNum}
                                        className="cursor-pointer"
                                      >
                                        {pageNum}
                                      </PaginationLink>
                                    </PaginationItem>
                                  );
                                },
                              )}
                              <PaginationItem>
                                <PaginationNext
                                  onClick={() =>
                                    setClientDocsPage(
                                      Math.min(
                                        clientDocsTotalPages,
                                        clientDocsPage + 1,
                                      ),
                                    )
                                  }
                                  className={
                                    clientDocsPage >= clientDocsTotalPages
                                      ? "pointer-events-none opacity-50"
                                      : "cursor-pointer"
                                  }
                                />
                              </PaginationItem>
                            </PaginationContent>
                          </Pagination>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="client" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : clientDetails ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">
                      {t("credit.clientDetails")}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.clientName")}:
                        </span>
                        <p className="font-medium">{clientDetails.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.cpfCnpj")}:
                        </span>
                        <p className="font-medium">{clientDetails.cpfCnpj}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.fantasyName")}:
                        </span>
                        <p className="font-medium">
                          {clientDetails.fantasyName}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.vip")}:
                        </span>
                        <p className="font-medium">
                          {clientDetails.vip == true
                            ? t("common.yes")
                            : t("common.no")}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">
                          {t("credit.address")}:
                        </span>
                        <p className="font-medium">
                          {clientDetails.billingAddress},{" "}
                          {clientDetails.district}
                          <br />
                          {clientDetails.state} - {clientDetails.zipCode}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.foundation")}:
                        </span>
                        <p className="font-medium">
                          {formatDate(clientDetails.foundationDate, locale)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.isSN")}:
                        </span>
                        <Badge variant="outline">
                          {clientDetails.isSN == true
                            ? t("common.yes")
                            : t("common.no")}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.firstPurchase")}:
                        </span>
                        <p className="font-medium">
                          {formatDate(clientDetails.firstPurchase, locale)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.lastPurchase")}:
                        </span>
                        <p className="font-medium">
                          {formatDate(clientDetails.lastPurchase, locale)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.biggestPurchase")}:
                        </span>
                        <p className="font-medium">
                          {formatCurrency(clientDetails.biggestPurchase)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.purchases")}:
                        </span>
                        <p className="font-medium">{clientDetails.purchases}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.averageDelay")}:
                        </span>
                        <p className="font-medium">
                          {clientDetails.averageDelay}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.biggestDelay")}:
                        </span>
                        <p className="font-medium">
                          {clientDetails.biggestDelay}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.limit")}:
                        </span>
                        <p className="font-medium">
                          {formatCurrency(clientDetails.creditLimit)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.risk")}:
                        </span>
                        <Badge variant="outline">{clientDetails.risk}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.dueDate")}:
                        </span>
                        <p className="font-medium">
                          {formatDate(clientDetails.dueDate, locale)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.secondaryLimit")}:
                        </span>
                        <p className="font-medium">
                          {formatCurrency(clientDetails.secondaryCreditLimit)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.warrantyInfo")}:
                        </span>
                        <p className="font-medium">{clientDetails.warranty}</p>
                      </div>
                    </div>
                  </div>

                  {/* Credit Limit Pie Chart */}
                  <div className="space-y-3">
                    <h3 className="font-semibold">
                      {t("credit.limit.chartTitle")}
                    </h3>
                    {isLoadingLimit ? (
                      <Skeleton className="h-64 w-full" />
                    ) : creditLimit ? (
                      (() => {
                        // Total credit limit includes base limit + RA + NCC + open contract balances
                        const totalCreditLimit =
                          creditLimit.creditLimit +
                          creditLimit.raBalance +
                          creditLimit.nccBalance +
                          creditLimit.openContractBalance;
                        const pieData = [
                          {
                            name: t("credit.limit.pendingValue"),
                            value: Math.abs(creditLimit.pendingValue),
                            color: "hsl(var(--warning))",
                          },
                          {
                            name: t("credit.limit.approvedItems"),
                            value: Math.abs(creditLimit.approvedItemsValue),
                            color: "hsl(var(--success))",
                          },
                          // Only show open contract balance if positive
                          ...(creditLimit.openContractBalance > 0
                            ? [
                                {
                                  name: t("credit.limit.openContractBalance"),
                                  value: creditLimit.openContractBalance,
                                  color: "hsl(var(--chart-4))",
                                },
                              ]
                            : []),
                          // Only show available balance if it's positive
                          ...(creditLimit.availableBalance > 0
                            ? [
                                {
                                  name: t("credit.limit.availableBalance"),
                                  value: creditLimit.availableBalance,
                                  color: "hsl(var(--accent))",
                                },
                              ]
                            : []),
                        ];
                        const filteredData = pieData.filter(
                          (item) => item.value > 0,
                        );
                        const isInsufficientCredit =
                          creditLimit.availableBalance < 0;
                        return (
                          <div>
                            <div className="text-sm text-muted-foreground">
                              {t("credit.limit.totalCreditLimit")}:{" "}
                              <span className="font-medium">
                                {formatCurrency(totalCreditLimit)}
                              </span>
                              {(creditLimit.raBalance > 0 ||
                                creditLimit.nccBalance > 0 ||
                                creditLimit.openContractBalance > 0) && (
                                <span className="text-xs ml-2">
                                  ({t("credit.limit.creditLimit")}:{" "}
                                  {formatCurrency(creditLimit.creditLimit)}
                                  {creditLimit.raBalance > 0 &&
                                    ` + ${t("credit.limit.raBalance")}: ${formatCurrency(creditLimit.raBalance)}`}
                                  {creditLimit.nccBalance > 0 &&
                                    ` + ${t("credit.limit.nccBalance")}: ${formatCurrency(creditLimit.nccBalance)}`}
                                  {creditLimit.openContractBalance > 0 &&
                                    ` + ${t("credit.limit.openContractBalance")}: ${formatCurrency(creditLimit.openContractBalance)}`}
                                  )
                                </span>
                              )}
                            </div>
                            {isInsufficientCredit && (
                              <div className="flex items-center gap-2 mt-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                                <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                                <div className="text-sm">
                                  <p className="font-medium text-destructive">
                                    {t("credit.limit.insufficientCredit")}
                                  </p>
                                  <p className="text-muted-foreground">
                                    {t(
                                      "credit.limit.insufficientCreditDetail",
                                    ).replace(
                                      "{value}",
                                      formatCurrency(
                                        Math.abs(creditLimit.availableBalance),
                                      ),
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                            {filteredData.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-8">
                                {t("credit.limit.noData")}
                              </p>
                            ) : (
                              <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={filteredData}
                                      dataKey="value"
                                      nameKey="name"
                                      cx="50%"
                                      cy="50%"
                                      outerRadius={80}
                                      label={(entry) =>
                                        `${entry.name}: ${formatCurrency(entry.value)}`
                                      }
                                    >
                                      {filteredData.map((entry, index) => (
                                        <Cell
                                          key={`cell-${index}`}
                                          fill={entry.color}
                                        />
                                      ))}
                                    </Pie>
                                    <RechartsTooltip
                                      formatter={(value: number) =>
                                        formatCurrency(value)
                                      }
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                              </div>
                            )}
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        {t("credit.limit.noData")}
                      </p>
                    )}
                  </div>

                  {/* Default Probability Indicator */}
                  {clientHistory &&
                    clientHistory.length > 0 &&
                    (() => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const pendingItems = clientHistory.filter(
                        (item) => item.status && item.status == "A vencer",
                      );
                      const dueItems = clientHistory.filter(
                        (item) => item.status && item.status == "Vencido",
                      );

                      const pendingCount = pendingItems.length;
                      const dueCount = dueItems.length;
                      const pendingValue = pendingItems.reduce(
                        (sum, item) => sum + Math.abs(item.balance),
                        0,
                      );
                      const dueValue = dueItems.reduce(
                        (sum, item) => sum + Math.abs(item.balance),
                        0,
                      );

                      const totalValue = pendingValue + dueValue;
                      const defaultProbability =
                        totalValue > 0
                          ? ((dueValue / totalValue) * 100).toFixed(2)
                          : "0.00";

                      return (
                        <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                          <h3 className="font-semibold text-base">
                            {t("credit.defaultProbability.title")}
                          </h3>
                          <div className="grid grid-cols-1 gap-4">
                            {/* Probability Display */}
                            <div className="flex items-center justify-between p-3 bg-background rounded-md border">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {t("credit.defaultProbability.probability")}
                                </span>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <p className="text-sm">
                                        {t(
                                          "credit.defaultProbability.explanation",
                                        )}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <span
                                className={`text-2xl font-bold ${
                                  parseFloat(defaultProbability) > 50
                                    ? "text-destructive"
                                    : parseFloat(defaultProbability) > 25
                                      ? "text-warning"
                                      : "text-success"
                                }`}
                              >
                                {defaultProbability}%
                              </span>
                            </div>

                            {/* Pending Items */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-background rounded-md border">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {t("credit.defaultProbability.pendingItems")}
                                </div>
                                <div className="text-lg font-semibold">
                                  {pendingCount}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {formatCurrency(pendingValue)}
                                </div>
                              </div>

                              {/* Due Items */}
                              <div className="p-3 bg-background rounded-md border">
                                <div className="text-xs text-muted-foreground mb-1">
                                  {t("credit.defaultProbability.dueItems")}
                                </div>
                                <div className="text-lg font-semibold text-destructive">
                                  {dueCount}
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                  {formatCurrency(dueValue)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("credit.noClientInfo")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="linkedClients" className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : linkedClients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("credit.noLinkedClients")}
                </p>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    {t("credit.linkedClientsInfo")}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("credit.id")}</TableHead>
                        <TableHead>{t("credit.store")}</TableHead>
                        <TableHead>{t("credit.lc")}</TableHead>
                        <TableHead>{t("credit.dueDate")}</TableHead>
                        <TableHead>{t("credit.risk")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {linkedClients.map((client, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{client.id}</TableCell>
                          <TableCell>{client.branch}</TableCell>
                          <TableCell>{formatCurrency(client.lc)}</TableCell>
                          <TableCell>
                            {formatDate(client.dueDate, locale)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{client.risk}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value={"financialHistory"} className="space-y-4 mt-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : clientDetails ? (
                <div className="space-y-4">
                  {clientHistory.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">
                        {t("credit.financialHistory")}
                      </h3>

                      {/* Filters */}
                      <FinancialHistoryFilters
                        availableStatuses={availableStatuses}
                        availableTypes={availableTypes}
                        selectedStatuses={financialFilters.statuses}
                        selectedTypes={financialFilters.types}
                        onStatusChange={(statuses) =>
                          handleFiltersChange({ ...financialFilters, statuses })
                        }
                        onTypeChange={(types) =>
                          handleFiltersChange({ ...financialFilters, types })
                        }
                        onClearFilters={handleClearFilters}
                      />

                      {/* Summary Cards */}
                      <FinancialHistorySummary
                        totalValue={financialTotals.totalValue}
                        totalBalance={financialTotals.totalBalance}
                        currency={clientHistory[0]?.currency || "R$"}
                        itemCount={filteredFinancialHistory.length}
                      />

                      {/* Table */}
                      <FinancialHistoryTable
                        data={paginatedFinancialHistory}
                        isLoading={isLoading}
                      />

                      {/* Pagination Controls */}
                      {filteredFinancialHistory.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                          <div className="text-sm text-muted-foreground">
                            {t("credit.showingItems")}{" "}
                            {(financialPage - 1) * financialItemsPerPage + 1}{" "}
                            {t("credit.toItems")}{" "}
                            {Math.min(
                              financialPage * financialItemsPerPage,
                              filteredFinancialHistory.length,
                            )}{" "}
                            {t("credit.ofItems")}{" "}
                            {filteredFinancialHistory.length}
                          </div>

                          <div className="flex items-center gap-4">
                            <ItemsPerPageSelector
                              value={financialItemsPerPage}
                              onChange={setFinancialItemsPerPage}
                              options={[5, 10, 20, 50]}
                            />

                            <Pagination>
                              <PaginationContent>
                                <PaginationItem>
                                  <PaginationPrevious
                                    onClick={() =>
                                      setFinancialPage(
                                        Math.max(1, financialPage - 1),
                                      )
                                    }
                                    className={
                                      financialPage === 1
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                    }
                                  />
                                </PaginationItem>

                                {Array.from(
                                  { length: totalPages },
                                  (_, i) => i + 1,
                                )
                                  .filter((page) => {
                                    // Show first, last, current, and neighbors
                                    return (
                                      page === 1 ||
                                      page === totalPages ||
                                      Math.abs(page - financialPage) <= 1
                                    );
                                  })
                                  .map((page, idx, array) => (
                                    <React.Fragment key={page}>
                                      {idx > 0 &&
                                        array[idx - 1] !== page - 1 && (
                                          <PaginationItem>
                                            <span className="px-2">...</span>
                                          </PaginationItem>
                                        )}
                                      <PaginationItem>
                                        <PaginationLink
                                          onClick={() => setFinancialPage(page)}
                                          isActive={page === financialPage}
                                          className="cursor-pointer"
                                        >
                                          {page}
                                        </PaginationLink>
                                      </PaginationItem>
                                    </React.Fragment>
                                  ))}

                                <PaginationItem>
                                  <PaginationNext
                                    onClick={() =>
                                      setFinancialPage(
                                        Math.min(totalPages, financialPage + 1),
                                      )
                                    }
                                    className={
                                      financialPage === totalPages
                                        ? "pointer-events-none opacity-50"
                                        : "cursor-pointer"
                                    }
                                  />
                                </PaginationItem>
                              </PaginationContent>
                            </Pagination>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("credit.noClientInfo")}
                </p>
              )}
            </TabsContent>

            <TabsContent value="contracts" className="space-y-4 mt-4">
              {isLoadingContracts ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : contracts.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("credit.contract")}</TableHead>
                        <TableHead>{t("credit.additive")}</TableHead>
                        <TableHead>{t("credit.effectiveDate")}</TableHead>
                        <TableHead className="text-right">
                          {t("credit.contractValue")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("credit.billValue")}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("credit.balance")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract, idx) => (
                        <TableRow
                          key={`${contract.contract}-${contract.additive}-${idx}`}
                        >
                          <TableCell className="font-medium">
                            {contract.contract}
                          </TableCell>
                          <TableCell>{contract.additive}</TableCell>
                          <TableCell>
                            {formatDate(contract.efctDate, locale)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(contract.contractValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(contract.billValue)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(contract.balance)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("credit.noContracts")}
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Document Upload Dialog */}
        {credit?.details.offer && (
          <DocumentUploadDialog
            isOpen={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            proposalId={credit.details.offer}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
