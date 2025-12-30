import { useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
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
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useTrafficLightList,
  useTrafficLightDetail,
} from "@/hooks/useTrafficLight";
import {
  transformDetailToWorkflow,
  getOverallStatus,
} from "@/lib/trafficLightTransformer";
import { TrafficLightSummary } from "@/types/trafficLight";

const nodeTypes = {
  workflow: WorkflowNode,
};

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

// Derive status from summary for list display
function getSummaryStatus(
  item: TrafficLightSummary
): "pending" | "in-progress" | "completed" | "failed" {
  if (item.finishedDate) {
    return "completed";
  }
  if (item.startDate) {
    return "in-progress";
  }
  return "pending";
}

export default function Workflow() {
  const { t } = useLocale();
  const { isAdmin } = usePermissions();
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch list of traffic lights
  const {
    items,
    total,
    isLoading: isListLoading,
    error: listError,
  } = useTrafficLightList({ page, pageSize });

  // Fetch detail when an item is selected
  const { detail, isLoading: isDetailLoading } = useTrafficLightDetail({
    id: selectedItemId,
  });

  // Transform detail to workflow nodes/edges
  const workflowData = detail ? transformDetailToWorkflow(detail) : null;

  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflowData?.nodes || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflowData?.edges || []
  );

  // Update nodes/edges when detail changes
  const handleSelectItem = (id: number) => {
    setSelectedItemId(id);
  };

  // When detail loads, update the flow
  if (
    detail &&
    workflowData &&
    (nodes.length === 0 || nodes[0]?.id !== workflowData.nodes[0]?.id)
  ) {
    setNodes(workflowData.nodes);
    setEdges(workflowData.edges);
  }

  const handleBack = () => {
    setSelectedItemId(null);
    setNodes([]);
    setEdges([]);
  };

  const totalPages = Math.ceil(total / pageSize);

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
  if (!selectedItemId) {
    return (
      <div className="h-screen w-full">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Traffic Light Status
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Select an item to view its workflow progress
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-6">
          {isListLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading...</span>
            </div>
          ) : listError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading traffic lights:{" "}
                {listError instanceof Error
                  ? listError.message
                  : "Unknown error"}
              </AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No traffic light items found.
            </div>
          ) : (
            <>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="grid gap-4">
                  {items.map((item) => {
                    const status = getSummaryStatus(item);
                    const config = statusConfig[status];
                    const StatusIcon = config.icon;

                    return (
                      <Card
                        key={item.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                          "border-l-4",
                          status === "completed" && "border-l-success",
                          status === "in-progress" && "border-l-primary",
                          status === "failed" && "border-l-destructive",
                          status === "pending" && "border-l-muted-foreground"
                        )}
                        onClick={() => handleSelectItem(item.id)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className={cn(
                                "p-2 rounded-lg shrink-0",
                                config.bgColor
                              )}
                            >
                              <FileText
                                className={cn("h-5 w-5", config.color)}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-foreground truncate">
                                Quote: {item.numQuote}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-0.5">
                                Sales Order: {item.salesOrderNumber}
                              </p>
                              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                                <span>Validity: {item.validityDate}</span>
                                {item.startDate && (
                                  <span>
                                    Started:{" "}
                                    {new Date(item.startDate).toLocaleDateString()}
                                  </span>
                                )}
                                {item.finishedDate && (
                                  <span>
                                    Finished:{" "}
                                    {new Date(
                                      item.finishedDate
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              "shrink-0 flex items-center gap-1.5",
                              config.color
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

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, total)} of {total} items
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-2">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Workflow View - Show when an item is selected
  const selectedItem = items.find((i) => i.id === selectedItemId);
  const overallStatus = detail ? getOverallStatus(detail) : "pending";
  const selectedConfig = statusConfig[overallStatus];

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
                  {detail?.poName || `Quote: ${selectedItem?.numQuote}`}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Sales Order: {detail?.salesOrderNumber || selectedItem?.salesOrderNumber}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 flex items-center gap-1.5",
                selectedConfig.color
              )}
            >
              <selectedConfig.icon className="h-3 w-3" />
              {selectedConfig.label}
            </Badge>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-120px)]">
        {isDetailLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              Loading workflow...
            </span>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                switch (node.data?.status) {
                  case "completed":
                    return "hsl(var(--success))";
                  case "in-progress":
                    return "hsl(var(--primary))";
                  case "failed":
                    return "hsl(var(--destructive))";
                  case "external-action":
                    return "hsl(var(--warning))";
                  default:
                    return "hsl(var(--muted-foreground))";
                }
              }}
              maskColor="hsl(var(--background) / 0.8)"
              className="!bg-card"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
