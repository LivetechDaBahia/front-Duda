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
import { CalendarIcon, X } from "lucide-react";
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("filters")}</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            {t("clearFilters")}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {t("search")}
          </label>
          <Input
            placeholder={t("credit.searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1.5 block">
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

        <div>
          <label className="text-sm font-medium mb-1.5 block">
            {t("credit.dateRange")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateBegin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateBegin
                    ? format(filters.dateBegin, "PPP")
                    : t("startDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateBegin}
                  onSelect={(date) => updateFilter("dateBegin", date)}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !filters.dateEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateEnd ? format(filters.dateEnd, "PPP") : t("endDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateEnd}
                  onSelect={(date) => updateFilter("dateEnd", date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
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
          <div>
            <label className="text-sm font-medium mb-1.5 block">
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
      </div>
    </div>
  );
};
