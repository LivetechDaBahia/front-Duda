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
    isLoadingClientDocs ||
    isLoadingClientDetails ||
    isLoadingClientHistory ||
    isLoadingLinkedClients;

  const error =
    detailsError ||
    documentsError ||
    quoteDocsError ||
    clientDocsError ||
    clientDetailsError ||
    clientHistoryError ||
    linkedClientsError;

  return {
    elementDetails: elementDetails?.[0] || null,
    documents: documents || [],
    quoteDocuments: quoteDocuments || [],
    clientDocuments: clientDocuments || [],
    clientDetails: clientDetails || null,
    clientHistory: clientHistory || [],
    linkedClients: linkedClients || [],
    isLoading,
    error,
  };
};
