import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface FinancialHistoryFiltersProps {
  availableStatuses: string[];
  availableTypes: string[];
  selectedStatuses: string[];
  selectedTypes: string[];
  onStatusChange: (statuses: string[]) => void;
  onTypeChange: (types: string[]) => void;
  onClearFilters: () => void;
}

export function FinancialHistoryFilters({
  availableStatuses,
  availableTypes,
  selectedStatuses,
  selectedTypes,
  onStatusChange,
  onTypeChange,
  onClearFilters,
}: FinancialHistoryFiltersProps) {
  const { t } = useLocale();
  const hasActiveFilters = selectedStatuses.length > 0 || selectedTypes.length > 0;

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      onStatusChange(selectedStatuses.filter((s) => s !== status));
    } else {
      onStatusChange([...selectedStatuses, status]);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypeChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypeChange([...selectedTypes, type]);
    }
  };

  return (
    <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("credit.filterByStatus")}</Label>
        <div className="flex flex-wrap gap-2">
          {availableStatuses.map((status) => {
            const isSelected = selectedStatuses.includes(status);
            return (
              <Badge
                key={status}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleStatus(status)}
              >
                {status}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Type Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">{t("credit.filterByType")}</Label>
        <div className="flex flex-wrap gap-2">
          {availableTypes.map((type) => {
            const isSelected = selectedTypes.includes(type);
            return (
              <Badge
                key={type}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => toggleType(type)}
              >
                {type}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            {t("credit.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
