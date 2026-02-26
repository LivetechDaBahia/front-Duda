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
  CreditContract,
} from "@/types/credit";

interface UseCreditDetailsParams {
  creditId: string | null;
  clientBranch?: string;
  clientId?: string;
  proposalId?: string;
  clientDocsPage?: number;
  clientDocsSize?: number;
}

/**
 * Extract clean proposal ID from full format "XX-NNNNNN/RR"
 * where XX is branch, NNNNNN is proposal ID, RR is revision
 * Returns just NNNNNN for the API
 */
const extractProposalId = (fullProposalId: string): string => {
  // Format: "01-825295/00" -> extract "825295"
  const afterBranch = fullProposalId.split("-")[1] || fullProposalId;
  const beforeRevision = afterBranch.split("/")[0] || afterBranch;
  return beforeRevision.trim();
};

export const useCreditDetails = ({
  creditId,
  clientBranch,
  clientId,
  proposalId,
  clientDocsPage = 1,
  clientDocsSize = 10,
}: UseCreditDetailsParams) => {
  const cleanProposalId = proposalId
    ? extractProposalId(proposalId)
    : undefined;
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
    queryKey: ["creditRentalDocuments", cleanProposalId],
    queryFn: async () => {
      return creditService.getRentalDocuments(cleanProposalId!);
    },
    enabled: !!cleanProposalId,
  });

  const {
    data: clientDocuments,
    isLoading: isLoadingClientDocs,
    error: clientDocsError,
  } = useQuery<CreditClientDocument[]>({
    queryKey: [
      "creditClientDocuments",
      creditId,
      clientDocsPage,
      clientDocsSize,
    ],
    queryFn: async () => {
      return creditService.getClientDocuments(
        creditId!,
        clientDocsPage,
        clientDocsSize,
      );
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

  const {
    data: contracts,
    isLoading: isLoadingContracts,
    error: contractsError,
  } = useQuery<CreditContract[]>({
    queryKey: ["creditContracts", clientBranch, clientId],
    queryFn: async () => {
      return creditService.getClientContracts(clientId!, clientBranch!);
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
    isLoadingLinkedClients ||
    isLoadingContracts;

  const error =
    detailsError ||
    documentsError ||
    quoteDocsError ||
    rentalDocsError ||
    clientDocsError ||
    clientDetailsError ||
    clientHistoryError ||
    linkedClientsError ||
    contractsError;

  return {
    // Full list as returned by API
    elementDetailsList: elementDetails || [],
    // Backward-compatible: first item (kept for older consumers)
    elementDetails: elementDetails?.[0] || null,
    documents: documents || [],
    quoteDocuments: quoteDocuments || [],
    rentalDocuments: rentalDocuments || [],
    clientDocuments: clientDocuments || [],
    clientDocumentsTotal: (clientDocuments || []).length, // Will be updated when backend returns total
    isLoadingClientDocs,
    clientDetails: clientDetails || null,
    clientHistory: clientHistory || [],
    linkedClients: linkedClients || [],
    contracts: contracts || [],
    isLoadingContracts,
    isLoading,
    error,
  };
};
