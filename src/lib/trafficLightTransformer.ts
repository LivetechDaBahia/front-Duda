import { Node, Edge, MarkerType } from "reactflow";
import {
  TrafficLightDetail,
  TrafficLightStageStatus,
  WorkflowStage,
} from "@/types/trafficLight";

// Define the workflow stages in order
const WORKFLOW_STAGES: WorkflowStage[] = [
  { key: "si01", label: "SI", description: "Sales Invoice creation" },
  { key: "po02", label: "PO", description: "Purchase Order processing" },
  {
    key: "customsClearance03",
    label: "Customs Clearance",
    description: "Customs clearance processing",
  },
  {
    key: "cfoAppropriation04",
    label: "CFO Appropriation",
    description: "CFO budget appropriation",
  },
  {
    key: "generatePreNote05",
    label: "Generate Pre-Note",
    description: "Pre-note generation",
  },
  {
    key: "closeCustomsClearance06",
    label: "Close Customs",
    description: "Close customs clearance",
  },
  { key: "invoicing07", label: "Invoicing", description: "Final invoicing" },
];

// Status codes from API
const STATUS_CODES = {
  COMPLETED: "C001",
  IN_EXECUTION: "C002",
  ERROR: "C003",
} as const;

// Get human-readable status label from code (for use with translation function)
export function getStatusLabelKey(code: string): string {
  const c = code.trim().toUpperCase();
  switch (c) {
    case STATUS_CODES.COMPLETED:
      return "workflow.status.completed";
    case STATUS_CODES.IN_EXECUTION:
      return "workflow.status.inExecution";
    case STATUS_CODES.ERROR:
      return "workflow.status.error";
    case "":
      return "workflow.status.pending";
    default:
      return code || "workflow.status.pending";
  }
}

// Map raw status code to workflow status
function mapStatusToWorkflow(
  statusValue: string,
  isCanceled: boolean
): TrafficLightStageStatus {
  if (isCanceled) {
    return "failed";
  }

  const code = statusValue.trim().toUpperCase();

  // Empty = not started
  if (!code || code === "") {
    return "pending";
  }

  // Map status codes
  switch (code) {
    case STATUS_CODES.COMPLETED:
      return "completed";
    case STATUS_CODES.IN_EXECUTION:
      return "in-progress";
    case STATUS_CODES.ERROR:
      return "failed";
    default:
      // Handle legacy color-based values if they exist
      if (code === "VERDE") return "completed";
      if (code === "AMARELO") return "in-progress";
      if (code === "VERMELHO") return "failed";
      // Unknown code with value - assume in-progress
      return "in-progress";
  }
}

// Get edge style based on status
function getEdgeStyle(
  sourceStatus: TrafficLightStageStatus,
  targetStatus: TrafficLightStageStatus
): { style: Edge["style"]; animated: boolean; color: string } {
  if (sourceStatus === "completed" && targetStatus === "completed") {
    return {
      style: { stroke: "hsl(var(--success))", strokeWidth: 2 },
      animated: false,
      color: "hsl(var(--success))",
    };
  }

  if (sourceStatus === "completed" && targetStatus === "in-progress") {
    return {
      style: {
        stroke: "hsl(var(--primary))",
        strokeWidth: 2,
        strokeDasharray: "5,5",
      },
      animated: true,
      color: "hsl(var(--primary))",
    };
  }

  if (sourceStatus === "failed" || targetStatus === "failed") {
    return {
      style: { stroke: "hsl(var(--destructive))", strokeWidth: 2 },
      animated: false,
      color: "hsl(var(--destructive))",
    };
  }

  return {
    style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
    animated: false,
    color: "hsl(var(--muted-foreground))",
  };
}

// Transform TrafficLightDetail to ReactFlow nodes and edges
export function transformDetailToWorkflow(detail: TrafficLightDetail): {
  nodes: Node[];
  edges: Edge[];
} {
  const isCanceled = detail.canceled08.trim().toLowerCase() !== "";

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Create nodes for each stage
  WORKFLOW_STAGES.forEach((stage, index) => {
    const statusValue = detail[stage.key];
    const status = mapStatusToWorkflow(statusValue, isCanceled && index > 0);

    nodes.push({
      id: `node-${index + 1}`,
      type: "workflow",
      position: { x: 50 + index * 300, y: 100 },
      data: {
        label: stage.label,
        status,
        description: statusValue ? getStatusLabelKey(statusValue) : stage.description,
        timestamp: detail.lastUpdate,
      },
    });
  });

  // Create edges between consecutive nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    const sourceStatus = nodes[i].data.status as TrafficLightStageStatus;
    const targetStatus = nodes[i + 1].data.status as TrafficLightStageStatus;
    const edgeConfig = getEdgeStyle(sourceStatus, targetStatus);

    edges.push({
      id: `edge-${i + 1}-${i + 2}`,
      source: `node-${i + 1}`,
      target: `node-${i + 2}`,
      type: "smoothstep",
      animated: edgeConfig.animated,
      style: edgeConfig.style,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edgeConfig.color,
      },
    });
  }

  // Add canceled node if applicable
  if (isCanceled) {
    const canceledIndex = nodes.length;
    nodes.push({
      id: `node-canceled`,
      type: "workflow",
      position: { x: 50 + canceledIndex * 300, y: 100 },
      data: {
        label: "Canceled",
        status: "failed" as TrafficLightStageStatus,
        description: detail.canceled08 || "Process was canceled",
        timestamp: detail.lastUpdate,
      },
    });

    // Add edge to canceled node from last stage
    const lastNode = nodes[nodes.length - 2];
    edges.push({
      id: `edge-to-canceled`,
      source: lastNode.id,
      target: `node-canceled`,
      type: "smoothstep",
      animated: false,
      style: { stroke: "hsl(var(--destructive))", strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "hsl(var(--destructive))",
      },
    });
  }

  return { nodes, edges };
}

// Get overall status from detail
export function getOverallStatus(
  detail: TrafficLightDetail
): "pending" | "in-progress" | "completed" | "failed" {
  // Check if canceled
  if (detail.canceled08.trim() !== "") {
    return "failed";
  }

  // Check if finished
  if (detail.finishedDate) {
    return "completed";
  }

  // Check if started
  if (detail.startDate) {
    return "in-progress";
  }

  return "pending";
}
