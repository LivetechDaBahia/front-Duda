import { apiClient } from "@/lib/apiClient";
import { addUIBreadcrumb } from "@/lib/sentry";
import {
  CreditElementItem,
  CreditStatus,
  CreditElementDetails,
  CreditDocument,
  CreditQuoteDocuments,
  CreditClientDocument,
  CreditClientDetails,
  FinancialHistory,
  CreditLinkedClient,
  CreditLog,
  UpdateCreditStatusDto,
  CreditLimit,
  BranchCreditIndicators,
  CreditContract,
} from "@/types/credit";

export const creditService = {
  async getCreditElements(): Promise<CreditElementItem[]> {
    addUIBreadcrumb("getCreditElements", "creditService");
    return apiClient.get("/credit/creditElement");
  },

  async getCreditStatuses(): Promise<CreditStatus[]> {
    addUIBreadcrumb("getCreditStatuses", "creditService");
    return apiClient.get("/credit/creditElement/status");
  },

  async getCreditElementDetails(id: string): Promise<CreditElementDetails[]> {
    addUIBreadcrumb("getCreditElementDetails", "creditService", { id });
    return apiClient.get(`/credit/creditElement/${id}`);
  },

  async getCreditDocuments(id: string): Promise<CreditDocument[]> {
    addUIBreadcrumb("getCreditDocuments", "creditService", { id });
    return apiClient.get(`/credit/creditElement/documents/${id}`);
  },

  async getQuoteDocuments(id: string): Promise<CreditQuoteDocuments[]> {
    addUIBreadcrumb("getQuoteDocuments", "creditService", { id });
    return apiClient.get(`/credit/creditElement/quoteDocuments/${id}`);
  },

  async getClientDocuments(
    id: string,
    page: number = 1,
    size: number = 10,
  ): Promise<CreditClientDocument[]> {
    addUIBreadcrumb("getClientDocuments", "creditService", { id, page, size });
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });
    return apiClient.get(
      `/credit/creditElement/documents/client/${id}?${params}`,
    );
  },

  async getClientDetails(
    branch: string,
    id: string,
  ): Promise<CreditClientDetails> {
    addUIBreadcrumb("getClientDetails", "creditService", { branch, id });
    return apiClient.get(`/credit/creditElement/clientDetails/${branch}/${id}`);
  },

  async getClientHistory(
    branch: string,
    id: string,
  ): Promise<FinancialHistory[]> {
    addUIBreadcrumb("getClientHistory", "creditService", { branch, id });
    return apiClient.get(`/credit/creditElement/history/${branch}/${id}`);
  },

  async getLinkedClients(
    id: string,
    branch: string,
  ): Promise<CreditLinkedClient[]> {
    addUIBreadcrumb("getLinkedClients", "creditService", { id, branch });
    return apiClient.get(`/credit/creditElement/linkedClients/${branch}/${id}`);
  },

  async updateCreditStatus(payload: UpdateCreditStatusDto): Promise<void> {
    addUIBreadcrumb("updateCreditStatus", "creditService", {
      id: payload.item.id,
      newStatus: payload.status,
      type: payload.type
    });
    return apiClient.patch(`/credit/creditElement/${payload.item.id}/status`, {
      payload,
    });
  },

  async getCreditLogs(id: number): Promise<CreditLog[]> {
    addUIBreadcrumb("getCreditLogs", "creditService", { id });
    return apiClient.get(`/credit/creditElement/logs/${id}`);
  },

  async assignCreditItem(payload: {
    itemId: string;
    assigneeEmail?: string;
    flowId?: string;
    key?: string;
  }): Promise<void> {
    addUIBreadcrumb("assignCreditItem", "creditService", {
      itemId: payload.itemId,
      assigneeEmail: payload.assigneeEmail,
    });
    return apiClient.post("/credit/creditElement/assign", payload);
  },

  async getCreditLimit(clientId: string, branch: string): Promise<CreditLimit> {
    addUIBreadcrumb("getCreditLimit", "creditService", { clientId, branch });
    return apiClient.get(`/credit/creditElement/limit/${clientId}/${branch}`);
  },

  async setCreditLimit(payload: {
    cnpj: string;
    limit: number;
    risk: string;
    dueDate: Date;
    observation: string;
  }): Promise<void> {
    addUIBreadcrumb("setCreditLimit", "creditService", {
      cnpj: payload.cnpj,
      limit: payload.limit,
    });
    return apiClient.post("/credit/creditElement/limit", payload);
  },

  async uploadDocument(payload: {
    base64: string;
    name: string;
    type: string;
    proposal: string;
  }): Promise<{ message: string }> {
    addUIBreadcrumb("uploadDocument", "creditService", {
      name: payload.name,
      type: payload.type,
      proposal: payload.proposal,
    });
    return apiClient.post("/documents/uploadFile", payload);
  },

  // Fetch indicators for dashboard
  async getIndicators(userEmail: string): Promise<BranchCreditIndicators[]> {
    addUIBreadcrumb("getIndicators", "creditService");
    const params = new URLSearchParams({ userEmail: userEmail });
    return apiClient.get(`/credit/indicators?${params}`);
  },

  async getClientContracts(
    clientId: string,
    branch: string,
  ): Promise<CreditContract[]> {
    addUIBreadcrumb("getClientContracts", "creditService", {
      clientId,
      branch,
    });
    const params = new URLSearchParams({ clientId, branch });
    return apiClient.get(`/credit/contracts?${params}`);
  },

  async getRentalDocuments(proposalId: string): Promise<CreditDocument[]> {
    addUIBreadcrumb("getRentalDocuments", "creditService", { proposalId });
    const params = new URLSearchParams({ proposalId });
    return apiClient.get(`/credit/rentalDocuments?${params}`);
  },
};
