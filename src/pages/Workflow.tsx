import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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
import { WorkflowFilters, WorkflowFilterValues } from "@/components/workflow/WorkflowFilters";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/shared/AccessDenied";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  List,
  LayoutGrid,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { WorkflowKanbanView } from "@/components/workflow/WorkflowKanbanView";
import { cn } from "@/lib/utils";
import { WorkflowLegend } from "@/components/workflow/WorkflowLegend";
import {
  useTrafficLightList,
  useTrafficLightDetail,
} from "@/hooks/useTrafficLight";
import {
  transformDetailToWorkflow,
  getOverallStatus,
  getStatusLabelKey,
} from "@/lib/trafficLightTransformer";
import { TrafficLightSummary } from "@/types/trafficLight";
import { TrafficLightFilters } from "@/services/trafficLightService";
import { format } from "date-fns";

const nodeTypes = {
  workflow: WorkflowNode,
};

// Check if item is expired based on validityDate (due date)
function isExpired(validityDate: string | undefined): boolean {
  if (!validityDate) return false;
  try {
    const dueDate = new Date(validityDate);
    // Check if it's a valid date
    if (isNaN(dueDate.getTime())) return false;
    return dueDate < new Date();
  } catch {
    return false;
  }
}

// Status config uses translation keys
const getStatusConfig = (t: (key: string) => string) => ({
  expired: {
    icon: AlertCircle,
    color: "text-warning",
    bgColor: "bg-warning/10",
    label: t("workflow.status.expired"),
  },
  "in-progress": {
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    label: t("workflow.status.inExecution"),
  },
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    label: t("workflow.status.completed"),
  },
  failed: {
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: t("workflow.status.failed"),
  },
});

// Derive status from summary for list display
function getSummaryStatus(
  item: TrafficLightSummary
): "expired" | "in-progress" | "completed" | "failed" {
  if (item.finishedDate) {
    return "completed";
  }
  // Check if expired (past due date)
  if (isExpired(item.validityDate)) {
    return "expired";
  }
  // Default: in execution (no pending state)
  return "in-progress";
}

export default function Workflow() {
  const { t } = useLocale();
  const { canViewTrafficLight } = usePermissions();
  const statusConfig = getStatusConfig(t);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Filter state
  const [filters, setFilters] = useState<WorkflowFilterValues>({
    search: "",
    status: "all",
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Convert filter values to API format (search is handled client-side)
  const apiFilters: TrafficLightFilters = useMemo(() => ({
    status: filters.status !== "all" ? filters.status : undefined,
    dateFrom: filters.dateFrom ? format(filters.dateFrom, "yyyy-MM-dd") : undefined,
    dateTo: filters.dateTo ? format(filters.dateTo, "yyyy-MM-dd") : undefined,
  }), [filters.status, filters.dateFrom, filters.dateTo]);

  // Client-side search filtering by quote, sales order, or LVTS number
  const filterItemsBySearch = useCallback((items: TrafficLightSummary[], searchTerm: string): TrafficLightSummary[] => {
    if (!searchTerm.trim()) return items;
    const term = searchTerm.toLowerCase().trim();
    return items.filter((item) => {
      const quote = (item.numQuote || "").toLowerCase();
      const salesOrder = (item.salesOrderNumber || "").toLowerCase();
      const lvts = (item.lvts || "").toLowerCase();
      return quote.includes(term) || salesOrder.includes(term) || lvts.includes(term);
    });
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: WorkflowFilterValues) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  // Fetch list of traffic lights
  const {
    items: rawItems,
    total,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
  } = useTrafficLightList({ page, pageSize, filters: apiFilters });

  // Apply client-side search filter
  const items = useMemo(() => filterItemsBySearch(rawItems, filters.search), [rawItems, filters.search, filterItemsBySearch]);

  // Track if currently refreshing
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchList();
    setIsRefreshing(false);
  };

  // Fetch detail when an item is selected
  const { detail, isLoading: isDetailLoading } = useTrafficLightDetail({
    id: selectedItemId,
  });

  // Transform detail to workflow nodes/edges
  const workflowData = detail ? transformDetailToWorkflow(detail) : null;

  // Layout cache to persist user-customized node positions
  const layoutCache = useRef<Map<number, { nodes: Node[]; edges: Edge[] }>>(new Map());
  // Track which item we've loaded to prevent re-running effect
  const loadedItemRef = useRef<number | null>(null);

  const [nodes, setNodes, onNodesChangeBase] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Custom nodes change handler to cache layout after drag ends
  const onNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChangeBase>[0]) => {
      onNodesChangeBase(changes);

      // Check if any node finished dragging
      const hasDragEnd = changes.some(
        (change) => change.type === "position" && change.dragging === false
      );

      if (hasDragEnd && selectedItemId !== null) {
        // Use setTimeout to get updated nodes after state update
        setTimeout(() => {
          setNodes((currentNodes) => {
            setEdges((currentEdges) => {
              layoutCache.current.set(selectedItemId, {
                nodes: [...currentNodes],
                edges: [...currentEdges],
              });
              return currentEdges;
            });
            return currentNodes;
          });
        }, 0);
      }
    },
    [onNodesChangeBase, selectedItemId, setNodes, setEdges]
  );

  // Handle selecting an item - save current layout first
  const handleSelectItem = useCallback(
    (id: number) => {
      // Save current layout before switching
      if (selectedItemId !== null && nodes.length > 0) {
        layoutCache.current.set(selectedItemId, {
          nodes: [...nodes],
          edges: [...edges],
        });
      }
      loadedItemRef.current = null; // Reset so the new item gets loaded
      setSelectedItemId(id);
    },
    [selectedItemId, nodes, edges]
  );

  // When detail loads, restore cached layout or use fresh data
  useEffect(() => {
    // Only load if we have data and haven't loaded this item yet
    if (
      detail &&
      workflowData &&
      selectedItemId !== null &&
      loadedItemRef.current !== selectedItemId
    ) {
      loadedItemRef.current = selectedItemId;
      
      const cached = layoutCache.current.get(selectedItemId);
      if (cached) {
        // Merge cached positions with fresh status data
        const mergedNodes = workflowData.nodes.map((node) => {
          const cachedNode = cached.nodes.find((n) => n.id === node.id);
          return cachedNode
            ? { ...node, position: cachedNode.position }
            : node;
        });
        setNodes(mergedNodes);
        setEdges(workflowData.edges);
      } else {
        setNodes(workflowData.nodes);
        setEdges(workflowData.edges);
      }
    }
  }, [detail, selectedItemId, workflowData, setNodes, setEdges]);

  const handleBack = useCallback(() => {
    // Save current layout before navigating away
    if (selectedItemId !== null && nodes.length > 0) {
      layoutCache.current.set(selectedItemId, {
        nodes: [...nodes],
        edges: [...edges],
      });
    }
    loadedItemRef.current = null;
    setSelectedItemId(null);
    setNodes([]);
    setEdges([]);
  }, [selectedItemId, nodes, edges, setNodes, setEdges]);

  const totalPages = Math.ceil(total / pageSize);

  if (!canViewTrafficLight) {
    return <AccessDenied />;
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
                  {t("workflow.title")}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {t("workflow.subtitle")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ToggleGroup
                  type="single"
                  value={viewMode}
                  onValueChange={(value) => value && setViewMode(value as "list" | "kanban")}
                  className="border rounded-md"
                >
                  <ToggleGroupItem value="list" aria-label={t("workflow.view.list")} className="px-3">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="kanban" aria-label={t("workflow.view.kanban")} className="px-3">
                    <LayoutGrid className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || isListLoading}
                  className="shrink-0"
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  {t("workflow.refresh")}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Legend */}
          <WorkflowLegend />

          {/* Filters */}
          <WorkflowFilters onFilterChange={handleFilterChange} />

          {isListLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">{t("workflow.loading")}</span>
            </div>
          ) : listError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("workflow.errorLoading")}:{" "}
                {listError instanceof Error
                  ? listError.message
                  : "Unknown error"}
              </AlertDescription>
            </Alert>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("workflow.noItems")}
            </div>
          ) : (
            <>
              {viewMode === "kanban" ? (
                <WorkflowKanbanView
                  items={items}
                  onItemClick={(item) => handleSelectItem(item.id)}
                />
              ) : (
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
                            status === "expired" && "border-l-warning"
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
                                  {t("workflow.quote")}: {item.numQuote}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground mt-0.5">
                                  <span>{t("workflow.salesOrder")}: {item.salesOrderNumber}</span>
                                  {item.lvts && (
                                    <span>{t("workflow.lvts")}: {item.lvts}</span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "text-xs",
                                      status === "expired"
                                        ? "bg-warning/20 text-warning"
                                        : "bg-muted text-muted-foreground"
                                    )}
                                  >
                                    {t("workflow.dueDate")}: {item.validityDate}
                                  </Badge>
                                  {item.startDate && (
                                    <span>
                                      {t("workflow.started")}:{" "}
                                      {new Date(item.startDate).toLocaleDateString()}
                                    </span>
                                  )}
                                  {item.finishedDate && (
                                    <span>
                                      {t("workflow.finished")}:{" "}
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
              )}

              {/* Pagination - only show in list view */}
              {viewMode === "list" && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    {t("workflow.showing")} {(page - 1) * pageSize + 1} {t("workflow.to")}{" "}
                    {Math.min(page * pageSize, total)} {t("workflow.of")} {total} {t("workflow.items")}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t("workflow.previous")}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                      {t("workflow.page")} {page} {t("workflow.of")} {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      {t("workflow.next")}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  // Workflow View - Show when an item is selected
  const selectedItem = items.find((i) => i.id === selectedItemId);
  const overallStatus = detail ? getOverallStatus(detail) : "in-progress";
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
                  {detail?.poName || `${t("workflow.quote")}: ${selectedItem?.numQuote}`}
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("workflow.salesOrder")}: {detail?.salesOrderNumber || selectedItem?.salesOrderNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedItemId !== null && workflowData) {
                    layoutCache.current.delete(selectedItemId);
                    setNodes(workflowData.nodes);
                    setEdges(workflowData.edges);
                  }
                }}
                className="shrink-0"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t("workflow.resetLayout")}
              </Button>
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
        </div>
      </header>

      <div className="h-[calc(100vh-120px)]">
        {isDetailLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">
              {t("workflow.loadingWorkflow")}
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
