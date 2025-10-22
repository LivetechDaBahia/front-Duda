import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import type {
  CreditElementDetails,
  CreditDocument,
  CreditQuoteDocuments,
  CreditClientDocument,
  CreditClientDetails,
  FinancialHistory,
} from "@/types/credit";

interface UseCreditDetailsParams {
  creditId: string | null;
  clientBranch?: string;
  clientId?: string;
}

export const useCreditDetails = ({
  creditId,
  clientBranch,
  clientId,
}: UseCreditDetailsParams) => {
  const {
    data: elementDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery<CreditElementDetails[]>({
    queryKey: ["creditDetails", creditId],
    queryFn: () => creditService.getCreditElementDetails(creditId!),
    enabled: !!creditId,
  });

  const {
    data: documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useQuery<CreditDocument[]>({
    queryKey: ["creditDocuments", creditId],
    queryFn: () => creditService.getCreditDocuments(creditId!),
    enabled: !!creditId,
  });

  const {
    data: quoteDocuments,
    isLoading: isLoadingQuoteDocs,
    error: quoteDocsError,
  } = useQuery<CreditQuoteDocuments[]>({
    queryKey: ["creditQuoteDocuments", creditId],
    queryFn: () => creditService.getQuoteDocuments(creditId!),
    enabled: !!creditId,
  });

  const {
    data: clientDocuments,
    isLoading: isLoadingClientDocs,
    error: clientDocsError,
  } = useQuery<CreditClientDocument[]>({
    queryKey: ["creditClientDocuments", creditId],
    queryFn: () => creditService.getClientDocuments(creditId!),
    enabled: !!creditId,
  });

  const {
    data: clientDetails,
    isLoading: isLoadingClientDetails,
    error: clientDetailsError,
  } = useQuery<CreditClientDetails>({
    queryKey: ["creditClientDetails", clientBranch, clientId],
    queryFn: () => creditService.getClientDetails(clientBranch!, clientId!),
    enabled: !!clientBranch && !!clientId,
  });

  const {
    data: clientHistory,
    isLoading: isLoadingClientHistory,
    error: clientHistoryError,
  } = useQuery<FinancialHistory[]>({
    queryKey: ["creditClientHistory", clientBranch, clientId],
    queryFn: () => creditService.getClientHistory(clientBranch!, clientId!),
    enabled: !!clientBranch && !!clientId,
  });

  const isLoading =
    isLoadingDetails ||
    isLoadingDocuments ||
    isLoadingQuoteDocs ||
    isLoadingClientDocs ||
    isLoadingClientDetails ||
    isLoadingClientHistory;

  const error =
    detailsError ||
    documentsError ||
    quoteDocsError ||
    clientDocsError ||
    clientDetailsError ||
    clientHistoryError;

  return {
    elementDetails: elementDetails?.[0] || null,
    documents: documents || [],
    quoteDocuments: quoteDocuments || [],
    clientDocuments: clientDocuments || [],
    clientDetails: clientDetails || null,
    clientHistory: clientHistory || [],
    isLoading,
    error,
  };
};
