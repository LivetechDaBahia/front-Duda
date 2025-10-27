import { apiClient } from "@/lib/apiClient";
import type {
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
} from "@/types/credit";

export const creditService = {
  async getCreditElements(): Promise<CreditElementItem[]> {
    return apiClient.get("/credit/creditElement");
  },

  async getCreditStatuses(): Promise<CreditStatus[]> {
    return apiClient.get("/credit/creditElement/status");
  },

  async getCreditElementDetails(id: string): Promise<CreditElementDetails[]> {
    console.log("getCreditElementDetails", id);
    return apiClient.get(`/credit/creditElement/${id}`);
  },

  async getCreditDocuments(id: string): Promise<CreditDocument[]> {
    return apiClient.get(`/credit/creditElement/documents/${id}`);
  },

  async getQuoteDocuments(id: string): Promise<CreditQuoteDocuments[]> {
    return apiClient.get(`/credit/creditElement/quoteDocuments/${id}`);
  },

  async getClientDocuments(id: string): Promise<CreditClientDocument[]> {
    return apiClient.get(`/credit/creditElement/documents/client/${id}`);
  },

  async getClientDetails(
    branch: string,
    id: string,
  ): Promise<CreditClientDetails> {
    return apiClient.get(`/credit/creditElement/clientDetails/${branch}/${id}`);
  },

  async getClientHistory(
    branch: string,
    id: string,
  ): Promise<FinancialHistory[]> {
    return apiClient.get(`/credit/creditElement/history/${branch}/${id}`);
  },

  async getLinkedClients(
    id: string,
    branch: string,
  ): Promise<CreditLinkedClient[]> {
    return apiClient.get(`/credit/creditElement/linkedClients/${branch}/${id}`);
  },

  async updateCreditStatus(id: number, newStatusId: string): Promise<void> {
    return apiClient.patch(`/credit/creditElement/${id}/status`, {
      statusId: newStatusId,
    });
  },

  async getCreditLogs(id: number): Promise<CreditLog[]> {
    return apiClient.get(`/credit/creditElement/${id}/logs`);
  },
};
