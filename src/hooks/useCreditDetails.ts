import { useQuery } from "@tanstack/react-query";
import { creditService } from "@/services/creditService";
import type {
  CreditElementDetails,
  CreditDocument,
  CreditQuoteDocuments,
  CreditClientDocument,
  CreditClientDetails,
  FinancialHistory,
  CreditLinkedClient,
} from "@/types/credit";

interface UseCreditDetailsParams {
  creditId: string | null;
  clientBranch?: string;
  clientId?: string;
  proposalId?: string;
}

export const useCreditDetails = ({
  creditId,
  clientBranch,
  clientId,
  proposalId,
}: UseCreditDetailsParams) => {
  const {
    data: elementDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useQuery<CreditElementDetails[]>({
    queryKey: ["creditDetails", creditId],
    queryFn: async () => {
      return creditService.getCreditElementDetails(creditId!);
    },
    enabled: !!creditId,
  });

  const {
    data: documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
  } = useQuery<CreditDocument[]>({
    queryKey: ["creditDocuments", creditId],
    queryFn: async () => {
      return creditService.getCreditDocuments(creditId!);
    },
    enabled: !!creditId,
  });

  const {
    data: quoteDocuments,
    isLoading: isLoadingQuoteDocs,
    error: quoteDocsError,
  } = useQuery<CreditQuoteDocuments[]>({
    queryKey: ["creditQuoteDocuments", creditId],
    queryFn: async () => {
      return creditService.getQuoteDocuments(creditId!);
    },
    enabled: !!creditId,
  });

  const {
    data: rentalDocuments,
    isLoading: isLoadingRentalDocs,
    error: rentalDocsError,
  } = useQuery<CreditDocument[]>({
    queryKey: ["creditRentalDocuments", proposalId],
    queryFn: async () => {
      return creditService.getRentalDocuments(proposalId!);
    },
    enabled: !!proposalId,
  });

  const {
    data: clientDocuments,
    isLoading: isLoadingClientDocs,
    error: clientDocsError,
  } = useQuery<CreditClientDocument[]>({
    queryKey: ["creditClientDocuments", creditId],
    queryFn: async () => {
      return creditService.getClientDocuments(creditId!);
    },
    enabled: !!creditId,
  });

  const {
    data: clientDetails,
    isLoading: isLoadingClientDetails,
    error: clientDetailsError,
  } = useQuery<CreditClientDetails>({
    queryKey: ["creditClientDetails", clientBranch, clientId],
    queryFn: async () => {
      return creditService.getClientDetails(clientBranch!, clientId!);
    },
    enabled: !!clientBranch && !!clientId,
  });

  const {
    data: clientHistory,
    isLoading: isLoadingClientHistory,
    error: clientHistoryError,
  } = useQuery<FinancialHistory[]>({
    queryKey: ["creditClientHistory", clientBranch, clientId],
    queryFn: async () => {
      return creditService.getClientHistory(clientBranch!, clientId!);
    },
    enabled: !!clientBranch && !!clientId,
  });

  const {
    data: linkedClients,
    isLoading: isLoadingLinkedClients,
    error: linkedClientsError,
  } = useQuery<CreditLinkedClient[]>({
    queryKey: ["creditLinkedClients", clientBranch, clientId],
    queryFn: async () => {
      return creditService.getLinkedClients(clientId!, clientBranch!);
    },
    enabled: !!clientBranch && !!clientId,
  });

  const isLoading =
    isLoadingDetails ||
    isLoadingDocuments ||
    isLoadingQuoteDocs ||
    isLoadingRentalDocs ||
    isLoadingClientDocs ||
    isLoadingClientDetails ||
    isLoadingClientHistory ||
    isLoadingLinkedClients;

  const error =
    detailsError ||
    documentsError ||
    quoteDocsError ||
    rentalDocsError ||
    clientDocsError ||
    clientDetailsError ||
    clientHistoryError ||
    linkedClientsError;

  return {
    // Full list as returned by API
    elementDetailsList: elementDetails || [],
    // Backward-compatible: first item (kept for older consumers)
    elementDetails: elementDetails?.[0] || null,
    documents: documents || [],
    quoteDocuments: quoteDocuments || [],
    rentalDocuments: rentalDocuments || [],
    clientDocuments: clientDocuments || [],
    clientDetails: clientDetails || null,
    clientHistory: clientHistory || [],
    linkedClients: linkedClients || [],
    isLoading,
    error,
  };
};
