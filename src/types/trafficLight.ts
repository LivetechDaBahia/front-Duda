// TrafficLight API Types

export interface TrafficLightSummary {
  id: number;
  numQuote: string;
  salesOrderNumber: string;
  validityDate: string;
  startDate: string | null;
  finishedDate: string | null;
  canceled08?: string;
  lvts: string;
  poName: string;
  invoiceNumber: string;
  pause: boolean;
  erro: boolean;
}

export interface TrafficLightDetail {
  id: number;
  numQuote: string;
  poName: string;
  validityDate: string;
  salesOrderNumber: string;
  si01: string;
  po02: string;
  customsClearance03: string;
  cfoAppropriation04: string;
  generatePreNote05: string;
  closeCustomsClearance06: string;
  invoicing07: string;
  canceled08: string;
  startDate: string | null;
  finishedDate: string | null;
  lastUpdate: string | null;
  invoiceNumber: string;
}

export interface TrafficLightListResponse {
  data: TrafficLightSummary[];
  total: number;
  page: number | string;
  pageSize: number | string;
}

// Workflow stage definition for transforming detail to nodes
export interface WorkflowStage {
  key: keyof Pick<
    TrafficLightDetail,
    | "si01"
    | "po02"
    | "customsClearance03"
    | "cfoAppropriation04"
    | "generatePreNote05"
    | "closeCustomsClearance06"
    | "invoicing07"
    | "canceled08"
  >;
  label: string;
  description: string;
}

// Status mapping for traffic light stages
export type TrafficLightStageStatus =
  | "completed"
  | "in-progress"
  | "pending"
  | "failed"
  | "external-action";
