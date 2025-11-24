import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowStatus =
  | "completed"
  | "in-progress"
  | "pending"
  | "failed"
  | "external-action";

interface WorkflowNodeData {
  label: string;
  status: WorkflowStatus;
  description: string;
  timestamp: string | null;
}

interface WorkflowNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const statusConfig = {
  completed: {
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
    borderColor: "border-success",
    label: "Completed",
    pulse: false,
  },
  "in-progress": {
    icon: Clock,
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary",
    label: "In Progress",
    pulse: true,
  },
  pending: {
    icon: Clock,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    borderColor: "border-muted-foreground",
    label: "Pending",
    pulse: false,
  },
  failed: {
    icon: XCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    borderColor: "border-destructive",
    label: "Failed",
    pulse: false,
  },
  "external-action": {
    icon: ExternalLink,
    color: "text-warning",
    bgColor: "bg-warning/10",
    borderColor: "border-warning",
    label: "External Action",
    pulse: true,
  },
};

export const WorkflowNode = memo(({ data, selected }: WorkflowNodeProps) => {
  const config = statusConfig[data.status];
  const Icon = config.icon;

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />

      <Card
        className={cn(
          "w-[240px] transition-all duration-300",
          config.borderColor,
          "border-2",
          selected && "shadow-lg ring-2 ring-ring ring-offset-2 ring-offset-background"
        )}
      >
        {/* Semaphore Light Indicator */}
        <div className="flex items-center gap-3 p-3 border-b border-border">
          <div className="relative">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                config.bgColor,
                config.pulse && "animate-pulse"
              )}
            >
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            {config.pulse && (
              <>
                <div
                  className={cn(
                    "absolute inset-0 rounded-full animate-ping opacity-75",
                    config.bgColor
                  )}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-full",
                    "shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                  )}
                  style={{
                    boxShadow:
                      data.status === "in-progress"
                        ? "0 0 20px hsl(var(--primary) / 0.5)"
                        : "0 0 20px hsl(var(--warning) / 0.5)",
                  }}
                />
              </>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Badge
              variant="outline"
              className={cn("text-xs font-medium", config.color, config.borderColor)}
            >
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Node Content */}
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-sm text-foreground leading-tight">
            {data.label}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {data.description}
          </p>
          {data.timestamp && (
            <p className="text-xs text-muted-foreground font-mono">
              {data.timestamp}
            </p>
          )}
        </div>

        {/* Progress Indicator for In-Progress Status */}
        {data.status === "in-progress" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden rounded-b-md">
            <div className="h-full bg-primary animate-[shimmer_2s_ease-in-out_infinite]" />
          </div>
        )}
      </Card>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-primary !w-3 !h-3 !border-2 !border-background"
      />
    </div>
  );
});

WorkflowNode.displayName = "WorkflowNode";
