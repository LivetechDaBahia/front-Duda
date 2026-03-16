import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";

interface SalesStageVariationsProps {
  variations: SalesElementItem[];
  stages: Stage[];
  compact?: boolean;
}

/**
 * Reusable component that displays the different stage occurrences of a single
 * sales item, showing processId, purchaseOrderId, and purchaseOrderBranch per stage.
 *
 * - compact=true  → simplified list (used inside Kanban cards)
 * - compact=false → full table (used inside expandable table rows)
 */
export const SalesStageVariations = ({
  variations,
  stages,
  compact = false,
}: SalesStageVariationsProps) => {
  const { t } = useLocale();

  if (variations.length <= 1) return null;

  if (compact) {
    return (
      <div className="space-y-1">
        {variations.map((v) => {
          const stage = stages.find((s) => s.id === v.stageId);
          return (
            <div
              key={`var-${v.id}-${v.stageId}`}
              className="flex items-center gap-2 text-xs"
            >
              {stage && (
                <Badge
                  variant={stage.final ? "success" : "outline"}
                  className="text-[10px] px-1.5 py-0 shrink-0"
                >
                  {stage.name}
                </Badge>
              )}
              <span className="text-muted-foreground truncate">
                {t("sales.variations.po")}: {v.purchaseOrderId || "-"}/
                {v.purchaseOrderBranch || "-"}
              </span>
              <span className="text-muted-foreground truncate">
                {t("sales.variations.process")}: {v.processId || "-"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead className="text-xs">
            {t("sales.variations.stage")}
          </TableHead>
          <TableHead className="text-xs">
            {t("sales.variations.purchaseOrderId")}
          </TableHead>
          <TableHead className="text-xs">
            {t("sales.variations.purchaseOrderBranch")}
          </TableHead>
          <TableHead className="text-xs">
            {t("sales.variations.processId")}
          </TableHead>
          <TableHead className="text-xs">
            {t("sales.variations.assignee")}
          </TableHead>
          <TableHead className="text-xs">
            {t("sales.variations.group")}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variations.map((v) => {
          const stage = stages.find((s) => s.id === v.stageId);
          return (
            <TableRow key={`var-${v.id}-${v.stageId}`} className="bg-muted/20">
              <TableCell className="text-xs py-1.5">
                {stage && (
                  <Badge
                    variant={stage.final ? "success" : "secondary"}
                    className="text-xs"
                  >
                    {stage.name}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-xs py-1.5">
                {v.purchaseOrderId || "-"}
              </TableCell>
              <TableCell className="text-xs py-1.5">
                {v.purchaseOrderBranch || "-"}
              </TableCell>
              <TableCell className="text-xs py-1.5">
                {v.processId || "-"}
              </TableCell>
              <TableCell className="text-xs py-1.5">{v.user || "-"}</TableCell>
              <TableCell className="text-xs py-1.5">{v.group || "-"}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
