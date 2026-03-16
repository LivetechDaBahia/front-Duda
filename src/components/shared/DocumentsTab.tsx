import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ItemsPerPageSelector } from "@/components/shared/ItemsPerPageSelector";
import { useLocale } from "@/contexts/LocaleContext";
import type { CreditDocument, CreditClientDocument } from "@/types/credit";

interface DocumentsTabProps {
  documents: CreditDocument[];
  clientDocuments: CreditClientDocument[];
  isLoadingDocuments: boolean;
  isLoadingClientDocs: boolean;
  onOpenDocument: (docObject: string, path: string) => void;
  clientDocsPage: number;
  clientDocsSize: number;
  clientDocsTotalPages: number;
  onClientDocsPageChange: (page: number) => void;
  onClientDocsSizeChange: (size: number) => void;
}

export const DocumentsTab = ({
  documents,
  clientDocuments,
  isLoadingDocuments,
  isLoadingClientDocs,
  onOpenDocument,
  clientDocsPage,
  clientDocsSize,
  clientDocsTotalPages,
  onClientDocsPageChange,
  onClientDocsSizeChange,
}: DocumentsTabProps) => {
  const { t } = useLocale();

  return (
    <Tabs defaultValue="sales" className="w-full">
      <TabsList>
        <TabsTrigger value="sales">
          {t("credit.salesDocuments")} ({documents.length})
        </TabsTrigger>
        <TabsTrigger value="client">
          {t("credit.clientDocuments")} ({clientDocuments.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sales">
        {isLoadingDocuments ? (
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
                  onClick={() => onOpenDocument(doc.docObject, doc.path)}
                >
                  <TableCell>{doc.docTitle}</TableCell>
                  <TableCell>{doc.docDescription}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                    onClick={() => onOpenDocument(doc.docObject, doc.path)}
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
                  onClientDocsSizeChange(val);
                }}
              />
              {clientDocsTotalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          onClientDocsPageChange(
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
                        } else if (clientDocsPage >= clientDocsTotalPages - 2) {
                          pageNum = clientDocsTotalPages - 4 + i;
                        } else {
                          pageNum = clientDocsPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => onClientDocsPageChange(pageNum)}
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
                          onClientDocsPageChange(
                            Math.min(clientDocsTotalPages, clientDocsPage + 1),
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
  );
};
