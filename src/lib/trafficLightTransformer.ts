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

// Map raw status string to workflow status
function mapStatusToWorkflow(
  statusValue: string,
  isCanceled: boolean
): TrafficLightStageStatus {
  if (isCanceled) {
    return "failed";
  }

  const normalizedValue = statusValue.trim().toLowerCase();

  // Empty or not started
  if (!normalizedValue || normalizedValue === "") {
    return "pending";
  }

  // Common completed indicators
  if (
    normalizedValue.includes("ok") ||
    normalizedValue.includes("concluído") ||
    normalizedValue.includes("concluido") ||
    normalizedValue.includes("finalizado") ||
    normalizedValue.includes("done") ||
    normalizedValue.includes("completed") ||
    normalizedValue.includes("aprovado") ||
    normalizedValue.includes("sim") ||
    normalizedValue === "s"
  ) {
    return "completed";
  }

  // In progress indicators
  if (
    normalizedValue.includes("andamento") ||
    normalizedValue.includes("processando") ||
    normalizedValue.includes("processing") ||
    normalizedValue.includes("aguardando") ||
    normalizedValue.includes("waiting") ||
    normalizedValue.includes("em processo")
  ) {
    return "in-progress";
  }

  // External action indicators
  if (
    normalizedValue.includes("externo") ||
    normalizedValue.includes("external") ||
    normalizedValue.includes("terceiro") ||
    normalizedValue.includes("pendente externo")
  ) {
    return "external-action";
  }

  // Failed indicators
  if (
    normalizedValue.includes("erro") ||
    normalizedValue.includes("error") ||
    normalizedValue.includes("falha") ||
    normalizedValue.includes("failed") ||
    normalizedValue.includes("cancelado") ||
    normalizedValue.includes("reprovado") ||
    normalizedValue.includes("não") ||
    normalizedValue === "n"
  ) {
    return "failed";
  }

  // If has any value, assume in-progress or needs attention
  return "in-progress";
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
        description: statusValue || stage.description,
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
