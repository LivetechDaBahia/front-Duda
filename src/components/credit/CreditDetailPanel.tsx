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
import { useCreditDetails } from "@/hooks/useCreditDetails";
import { useLocale } from "@/contexts/LocaleContext";
import type { CreditElementItem } from "@/types/credit";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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
  const { t } = useLocale();

  // For now, we'll use statusId as creditId since that's what the API expects
  const { elementDetails, documents, quoteDocuments, clientDocuments, clientDetails, clientHistory, isLoading } =
    useCreditDetails({
      creditId: credit?.statusId || null,
      clientBranch: undefined, // Would need to extract from element details
      clientId: undefined, // Would need to extract from element details
    });

  const formatCurrency = (value: number, currency: string = "BRL") => {
    // Map currency symbols to ISO codes
    const currencyMap: Record<string, string> = {
      "R$": "BRL",
      "US$": "USD",
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

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return format(date, "PPP");
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">{t("credit.overview")}</TabsTrigger>
              <TabsTrigger value="documents">{t("credit.documents")}</TabsTrigger>
              <TabsTrigger value="client">{t("credit.clientInfo")}</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="space-y-3">
                <h3 className="font-semibold">{t("credit.elementInfo")}</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("credit.offer")}:</span>
                    <p className="font-medium">{credit.details.offer}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("credit.client")}:</span>
                    <p className="font-medium">{credit.details.client}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("credit.value")}:</span>
                    <p className="font-medium">
                      {formatCurrency(credit.details.value, credit.details.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("credit.seller")}:</span>
                    <p className="font-medium">{credit.details.sellerName}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">{t("credit.paymentConditions")}:</span>
                    <p className="font-medium">{credit.details.paymentConditions}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("credit.type")}:</span>
                    <p className="font-medium">{credit.details.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("credit.group")}:</span>
                    <p className="font-medium">{credit.group}</p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : elementDetails ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">{t("credit.salesOrderDetails")}</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t("credit.branch")}:</span>
                      <p className="font-medium">{elementDetails.branch}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("credit.emissionDate")}:</span>
                      <p className="font-medium">{formatDate(elementDetails.emissionDate)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("credit.shippingType")}:</span>
                      <p className="font-medium">{elementDetails.shippingType}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t("credit.shippingCost")}:</span>
                      <p className="font-medium">{formatCurrency(elementDetails.shippingCost)}</p>
                    </div>
                    {elementDetails.message1 && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">{t("credit.message")}:</span>
                        <p className="font-medium">{elementDetails.message1}</p>
                      </div>
                    )}
                  </div>
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
                    <h3 className="font-semibold">{t("credit.clientDetails")}</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("credit.clientName")}:</span>
                        <p className="font-medium">{clientDetails.name}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("credit.cgc")}:</span>
                        <p className="font-medium">{clientDetails.cgc}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">{t("credit.address")}:</span>
                        <p className="font-medium">
                          {clientDetails.billingAddress}, {clientDetails.district}
                          <br />
                          {clientDetails.state} - {clientDetails.zipCode}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("credit.risk")}:</span>
                        <Badge variant="outline">{clientDetails.risk}</Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("credit.lc")}:</span>
                        <p className="font-medium">
                          {formatCurrency(clientDetails.lc, clientDetails.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {clientHistory.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold">{t("credit.financialHistory")}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("credit.number")}</TableHead>
                            <TableHead>{t("credit.value")}</TableHead>
                            <TableHead>{t("credit.emission")}</TableHead>
                            <TableHead>{t("credit.expiration")}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientHistory.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{item.number}</TableCell>
                              <TableCell>{formatCurrency(item.value)}</TableCell>
                              <TableCell>{formatDate(item.emission)}</TableCell>
                              <TableCell>{formatDate(item.expiration)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("credit.noClientInfo")}
                </p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
};
