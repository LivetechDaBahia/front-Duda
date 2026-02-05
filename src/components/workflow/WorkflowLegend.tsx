import { useLocale } from "@/contexts/LocaleContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const WORKFLOW_STEPS = [
  { labelKey: "workflow.steps.si", descKey: "workflow.steps.siDesc" },
  { labelKey: "workflow.steps.po", descKey: "workflow.steps.poDesc" },
  {
    labelKey: "workflow.steps.customsClearance",
    descKey: "workflow.steps.customsClearanceDesc",
  },
  {
    labelKey: "workflow.steps.cfoAppropriation",
    descKey: "workflow.steps.cfoAppropriationDesc",
  },
  {
    labelKey: "workflow.steps.generatePreBilling",
    descKey: "workflow.steps.generatePreBillingDesc",
  },
  {
    labelKey: "workflow.steps.closeCustoms",
    descKey: "workflow.steps.closeCustomsDesc",
  },
  { labelKey: "workflow.steps.invoice", descKey: "workflow.steps.invoiceDesc" },
];

const STATUS_ITEMS = [
  {
    key: "pending",
    icon: Clock,
    colorClass: "text-muted-foreground",
    bgClass: "bg-muted",
  },
  {
    key: "inProgress",
    icon: Clock,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    key: "completed",
    icon: CheckCircle2,
    colorClass: "text-success",
    bgClass: "bg-success/10",
  },
  {
    key: "failed",
    icon: XCircle,
    colorClass: "text-destructive",
    bgClass: "bg-destructive/10",
  },
];

export function WorkflowLegend() {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent"
          >
            <span className="font-medium text-sm">
              {t("workflow.legend.title")}
            </span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-4">
          {/* Status Legend */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t("workflow.legend.statuses")}
            </h4>
            <div className="flex flex-wrap gap-2">
              {STATUS_ITEMS.map((status) => {
                const Icon = status.icon;
                return (
                  <Badge
                    key={status.key}
                    variant="outline"
                    className={cn(
                      "flex items-center gap-1.5",
                      status.colorClass,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {t(`workflow.status.${status.key}`)}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Steps Legend */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {t("workflow.legend.steps")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {WORKFLOW_STEPS.map((step, index) => (
                <div
                  key={step.labelKey}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="font-medium text-foreground">
                      {t(step.labelKey)}
                    </span>
                    <span className="text-muted-foreground ml-1 hidden sm:inline">
                      - {t(step.descKey)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
