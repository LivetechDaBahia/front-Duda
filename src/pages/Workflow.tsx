import { useState } from "react";
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
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShieldAlert,
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nodeTypes = {
  workflow: WorkflowNode,
};

// Types for workflow items
interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "failed";
  createdAt: string;
  nodes: Node[];
  edges: Edge[];
}

// Mock workflow items - this would come from your API
const mockWorkflowItems: WorkflowItem[] = [
  {
    id: "1",
    title: "Credit Request #CR-2024-001",
    description: "Credit limit increase for Client ABC",
    status: "in-progress",
    createdAt: "2025-11-20",
    nodes: [
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
        position: { x: 350, y: 100 },
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
        position: { x: 650, y: 100 },
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
        position: { x: 950, y: 100 },
        data: {
          label: "Final Approval",
          status: "pending",
          description: "Awaiting final approval",
          timestamp: null,
        },
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--success))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--success))",
        },
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
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--primary))",
        },
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
    ],
  },
  {
    id: "2",
    title: "Purchase Order #PO-2024-089",
    description: "Equipment purchase for IT Department",
    status: "completed",
    createdAt: "2025-11-18",
    nodes: [
      {
        id: "1",
        type: "workflow",
        position: { x: 50, y: 100 },
        data: {
          label: "Order Created",
          status: "completed",
          description: "Purchase order submitted",
          timestamp: "2025-11-18 09:00",
        },
      },
      {
        id: "2",
        type: "workflow",
        position: { x: 350, y: 100 },
        data: {
          label: "Budget Approval",
          status: "completed",
          description: "Budget verified and approved",
          timestamp: "2025-11-18 14:30",
        },
      },
      {
        id: "3",
        type: "workflow",
        position: { x: 650, y: 100 },
        data: {
          label: "Final Approval",
          status: "completed",
          description: "Order approved for processing",
          timestamp: "2025-11-19 10:00",
        },
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--success))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--success))",
        },
      },
      {
        id: "e2-3",
        source: "2",
        target: "3",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--success))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--success))",
        },
      },
    ],
  },
  {
    id: "3",
    title: "Credit Request #CR-2024-002",
    description: "New credit line for Client XYZ",
    status: "failed",
    createdAt: "2025-11-15",
    nodes: [
      {
        id: "1",
        type: "workflow",
        position: { x: 50, y: 100 },
        data: {
          label: "Request Submitted",
          status: "completed",
          description: "Initial request created",
          timestamp: "2025-11-15 11:00",
        },
      },
      {
        id: "2",
        type: "workflow",
        position: { x: 350, y: 100 },
        data: {
          label: "Risk Assessment",
          status: "failed",
          description: "Risk threshold exceeded",
          timestamp: "2025-11-16 09:00",
        },
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--destructive))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--destructive))",
        },
      },
    ],
  },
  {
    id: "4",
    title: "Purchase Order #PO-2024-090",
    description: "Office supplies for Marketing",
    status: "pending",
    createdAt: "2025-11-22",
    nodes: [
      {
        id: "1",
        type: "workflow",
        position: { x: 50, y: 100 },
        data: {
          label: "Order Created",
          status: "completed",
          description: "Purchase order submitted",
          timestamp: "2025-11-22 08:30",
        },
      },
      {
        id: "2",
        type: "workflow",
        position: { x: 350, y: 100 },
        data: {
          label: "Manager Review",
          status: "pending",
          description: "Awaiting manager review",
          timestamp: null,
        },
      },
      {
        id: "3",
        type: "workflow",
        position: { x: 650, y: 100 },
        data: {
          label: "Budget Check",
          status: "pending",
          description: "Pending budget verification",
          timestamp: null,
        },
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--muted-foreground))",
        },
      },
      {
        id: "e2-3",
        source: "2",
        target: "3",
        type: "smoothstep",
        animated: false,
        style: { stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "hsl(var(--muted-foreground))",
        },
      },
    ],
  },
];

const statusConfig = {
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Pending",
  },
  "in-progress": {
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: "In Progress",
  },
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    label: "Completed",
  },
  failed: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Failed",
  },
};

export default function Workflow() {
  const { t } = useLocale();
  const { isAdmin } = usePermissions();
  const [selectedItem, setSelectedItem] = useState<WorkflowItem | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    selectedItem?.nodes || [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    selectedItem?.edges || [],
  );

  const handleSelectItem = (item: WorkflowItem) => {
    setSelectedItem(item);
    setNodes(item.nodes);
    setEdges(item.edges);
  };

  const handleBack = () => {
    setSelectedItem(null);
  };

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

  // List View - Show when no item is selected
  if (!selectedItem) {
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
                  Select an item to view its workflow progress
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-6">
          <ScrollArea className="h-[calc(100vh-180px)]">
            <div className="grid gap-4">
              {mockWorkflowItems.map((item) => {
                const config = statusConfig[item.status];
                const StatusIcon = config.icon;

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                      "border-l-4",
                      item.status === "completed" && "border-l-success",
                      item.status === "in-progress" && "border-l-primary",
                      item.status === "failed" && "border-l-destructive",
                      item.status === "pending" && "border-l-muted-foreground",
                    )}
                    onClick={() => handleSelectItem(item)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "p-2 rounded-lg shrink-0",
                            config.bgColor,
                          )}
                        >
                          <FileText className={cn("h-5 w-5", config.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-foreground truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {item.createdAt}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 flex items-center gap-1.5",
                          config.color,
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Workflow View - Show when an item is selected
  const selectedConfig = statusConfig[selectedItem.status];

  return (
    <div className="h-screen w-full">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {selectedItem.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedItem.description}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 flex items-center gap-1.5",
                selectedConfig.color,
              )}
            >
              <selectedConfig.icon className="h-3 w-3" />
              {selectedConfig.label}
            </Badge>
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
