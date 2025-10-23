import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalendarIcon, X, ChevronDown, Filter } from "lucide-react";
import { format } from "date-fns";
import { useLocale } from "@/contexts/LocaleContext";
import type { CreditFilters as CreditFiltersType, CreditStatus } from "@/types/credit";
import { cn } from "@/lib/utils";

interface CreditFiltersProps {
  filters: CreditFiltersType;
  statuses: CreditStatus[];
  onFiltersChange: (filters: CreditFiltersType) => void;
}

export const CreditFilters = ({
  filters,
  statuses,
  onFiltersChange,
}: CreditFiltersProps) => {
  const { t } = useLocale();
  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof CreditFiltersType, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      group: "",
      user: "",
      currency: "",
      type: "",
      dateBegin: undefined,
      dateEnd: undefined,
      minValue: undefined,
      maxValue: undefined,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status !== "all" ||
    filters.group ||
    filters.user ||
    filters.currency ||
    filters.type ||
    filters.dateBegin ||
    filters.dateEnd ||
    filters.minValue !== undefined ||
    filters.maxValue !== undefined;

  return (
    <div className="space-y-4">
      {/* Search bar - always visible */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder={t("credit.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="w-full"
          />
        </div>
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              {showFilters ? t("hideFilters") : t("showFilters")}
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  showFilters && "rotate-180"
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-4 animate-slide-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    {t("status")}
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => updateFilter("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("allStatuses")}</SelectItem>
                      {statuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.description}
                          {status.destructive && " ⚠️"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    {t("startDate")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateBegin && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateBegin ? format(filters.dateBegin, "PPP") : t("startDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateBegin}
                        onSelect={(date) => updateFilter("dateBegin", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    {t("endDate")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateEnd && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateEnd ? format(filters.dateEnd, "PPP") : t("endDate")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateEnd}
                        onSelect={(date) => updateFilter("dateEnd", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Min Value */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    {t("credit.minValue")}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minValue || ""}
                    onChange={(e) =>
                      updateFilter(
                        "minValue",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </div>

                {/* Max Value */}
                <div className="space-y-2">
                  <label className="text-sm font-medium block">
                    {t("credit.maxValue")}
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.maxValue || ""}
                    onChange={(e) =>
                      updateFilter(
                        "maxValue",
                        e.target.value ? parseFloat(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="gap-2"
                  disabled={!hasActiveFilters}
                >
                  <X className="w-4 h-4" />
                  {t("clearFilters")}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};
