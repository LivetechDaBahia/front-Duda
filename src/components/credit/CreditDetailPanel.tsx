import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDate } from "@/lib/utils";
import React, { useState, useMemo } from "react";

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

  const {
    elementDetails,
    elementDetailsList,
    documents,
    quoteDocuments,
    clientDocuments,
    clientDetails,
    clientHistory,
    linkedClients,
    isLoading,
  } = useCreditDetails({
    creditId: credit?.key || null,
    clientBranch: credit?.details.clientBranch || undefined,
    clientId: credit?.details.client || undefined,
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
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">{t("credit.overview")}</TabsTrigger>
              <TabsTrigger value="documents">
                {t("credit.documents")}
              </TabsTrigger>
              <TabsTrigger value="client">{t("credit.clientInfo")}</TabsTrigger>
              <TabsTrigger value="linkedClients">
                {t("credit.linkedClients")}
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
                  <div className="col-span-2">
                    <span className="text-muted-foreground">
                      {t("credit.paymentConditions")}:
                    </span>
                    <p className="font-medium">
                      {credit.details.paymentConditions}
                    </p>
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

              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : elementDetailsList && elementDetailsList.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">
                    {t("credit.salesOrderDetails")}
                  </h3>
                  {elementDetailsList.map((el, idx) => (
                    <div
                      key={`${el.branch}-${el.id}-${idx}`}
                      className="grid grid-cols-2 gap-3 text-sm border rounded-md p-3"
                    >
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.branch")}:
                        </span>
                        <p className="font-medium">{el.branch}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.id")}:
                        </span>
                        <p className="font-medium">{el.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.emissionDate")}:
                        </span>
                        <p className="font-medium">
                          {formatDate(el.emissionDate, locale)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.value")}:
                        </span>
                        <p className="font-medium">
                          {formatCurrency(el.value)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.shippingType")}:
                        </span>
                        <p className="font-medium">{el.shippingType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          {t("credit.shippingCost")}:
                        </span>
                        <p className="font-medium">
                          {formatCurrency(el.shippingCost)}
                        </p>
                      </div>
                      {(el.message1 || el.message2 || el.standardMessage) && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            {t("credit.message")}:
                          </span>
                          {el.message1 && (
                            <p className="font-medium">{el.message1}</p>
                          )}
                          {el.message2 && (
                            <p className="font-medium">{el.message2}</p>
                          )}
                          {el.standardMessage && (
                            <p className="font-medium">{el.standardMessage}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 mt-4">
              <Tabs defaultValue="sales" className="w-full">
                <TabsList>
                  <TabsTrigger value="sales">
                    {t("credit.salesDocuments")} ({documents.length})
                  </TabsTrigger>
                  <TabsTrigger value="quote">
                    {t("credit.quoteDocuments")} ({quoteDocuments.length})
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
                          <TableRow key={idx}>
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
                  ) : quoteDocuments.length === 0 ? (
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
                        {quoteDocuments.map((doc, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{doc.docTitle}</TableCell>
                            <TableCell>{doc.docDescription}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="client">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : clientDocuments.length === 0 ? (
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
                        {clientDocuments.map((doc, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{doc.docTitle}</TableCell>
                            <TableCell>{doc.docDescription}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                          {t("credit.foundation")}:
                        </span>
                        <p className="font-medium">
                          {formatDate(clientDetails.foundationDate, locale)}
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
                          {t("credit.risk")}:
                        </span>
                        <Badge variant="outline">{clientDetails.risk}</Badge>
                      </div>
                      <div></div>
                    </div>
                  </div>

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
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};
