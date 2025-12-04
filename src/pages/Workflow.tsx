import { useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { useLocale } from "@/contexts/LocaleContext";
import { WorkflowNode } from "@/components/workflow/WorkflowNode";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const nodeTypes = {
  workflow: WorkflowNode,
};

// Mock workflow data - this would come from your API
const initialNodes: Node[] = [
  {
    id: "1",
    type: "workflow",
    position: { x: 50, y: 100 },
    data: {
      label: "Request Submitted",
      status: "completed",
      description: "Initial request created",
      timestamp: "2025-11-20 10:30",
    },
  },
  {
    id: "2",
    type: "workflow",
    position: { x: 300, y: 100 },
    data: {
      label: "Document Verification",
      status: "completed",
      description: "All documents verified",
      timestamp: "2025-11-21 14:15",
    },
  },
  {
    id: "3",
    type: "workflow",
    position: { x: 550, y: 100 },
    data: {
      label: "Manager Approval",
      status: "in-progress",
      description: "Waiting for manager review",
      timestamp: null,
    },
  },
  {
    id: "4",
    type: "workflow",
    position: { x: 800, y: 100 },
    data: {
      label: "Financial Review",
      status: "pending",
      description: "Pending financial analysis",
      timestamp: null,
    },
  },
  {
    id: "5",
    type: "workflow",
    position: { x: 300, y: 300 },
    data: {
      label: "External Action Required",
      status: "external-action",
      description: "Client signature needed",
      timestamp: null,
    },
  },
  {
    id: "6",
    type: "workflow",
    position: { x: 550, y: 300 },
    data: {
      label: "Risk Assessment Failed",
      status: "failed",
      description: "Risk threshold exceeded",
      timestamp: "2025-11-22 09:00",
    },
  },
  {
    id: "7",
    type: "workflow",
    position: { x: 1050, y: 100 },
    data: {
      label: "Final Approval",
      status: "pending",
      description: "Awaiting final approval",
      timestamp: null,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "smoothstep",
    animated: false,
    style: { stroke: "hsl(var(--success))", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--success))" },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "smoothstep",
    animated: true,
    style: {
      stroke: "hsl(var(--primary))",
      strokeWidth: 2,
      strokeDasharray: "5,5",
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--primary))" },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "smoothstep",
    animated: false,
    style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "hsl(var(--muted-foreground))",
    },
  },
  {
    id: "e2-5",
    source: "2",
    target: "5",
    type: "smoothstep",
    animated: false,
    style: {
      stroke: "hsl(var(--warning))",
      strokeWidth: 2,
      strokeDasharray: "5,5",
    },
    markerEnd: { type: MarkerType.ArrowClosed, color: "hsl(var(--warning))" },
  },
  {
    id: "e3-6",
    source: "3",
    target: "6",
    type: "smoothstep",
    animated: false,
    style: { stroke: "hsl(var(--destructive))", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "hsl(var(--destructive))",
    },
  },
  {
    id: "e4-7",
    source: "4",
    target: "7",
    type: "smoothstep",
    animated: false,
    style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "hsl(var(--muted-foreground))",
    },
  },
];

export default function Workflow() {
  const { t } = useLocale();
  const { isAdmin } = usePermissions();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this page. Only administrators
            can view workflows.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Workflow Status
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Track your item progress through the approval pipeline
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-120px)] w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-background"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={16}
            size={1}
            className="opacity-30"
          />
          <Controls className="bg-card border border-border rounded-lg shadow-md" />
          <MiniMap
            className="bg-card border border-border rounded-lg shadow-md"
            nodeColor={(node) => {
              const status = node.data.status;
              if (status === "completed") return "hsl(var(--success))";
              if (status === "in-progress") return "hsl(var(--primary))";
              if (status === "failed") return "hsl(var(--destructive))";
              if (status === "external-action") return "hsl(var(--warning))";
              return "hsl(var(--muted-foreground))";
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
