import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/contexts/LocaleContext";
import { X } from "lucide-react";
import type {
  CreditFilters as CreditFiltersType,
  CreditStatus,
  CreditElementItem,
  CreditBadge,
} from "@/types/credit";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRange } from "@/components/shared/FilterDateRange";

interface CreditFiltersProps {
  filters: CreditFiltersType;
  statuses: CreditStatus[];
  credits?: CreditElementItem[];
  onFiltersChange: (filters: CreditFiltersType) => void;
}

export const CreditFilters = ({
  filters,
  statuses,
  credits = [],
  onFiltersChange,
}: CreditFiltersProps) => {
  const { t } = useLocale();
  const [showFilters, setShowFilters] = useState(false);

  const availableBadges = useMemo(() => {
    const badgeMap = new Map<string, CreditBadge>();
    credits.forEach((credit) => {
      credit.badges?.forEach((badge) => {
        if (!badgeMap.has(badge.id)) {
          badgeMap.set(badge.id, badge);
        }
      });
    });
    return Array.from(badgeMap.values());
  }, [credits]);

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
      badges: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status !== "all" ||
      filters.group ||
      filters.user ||
      filters.currency ||
      filters.type ||
      filters.dateBegin ||
      filters.dateEnd ||
      filters.minValue !== undefined ||
      filters.maxValue !== undefined ||
      (filters.badges && filters.badges.length > 0),
  );

  return (
    <FilterContainer
      searchValue={filters.search}
      searchPlaceholder={t("credit.searchPlaceholder")}
      onSearchChange={(value) => updateFilter("search", value)}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filterButtonLabel={showFilters ? t("hideFilters") : t("filters.filters")}
      onClearFilters={clearFilters}
      clearButtonLabel={t("clearFilters")}
      hasActiveFilters={hasActiveFilters}
    >
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>{t("status")}</Label>
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

      <FilterDateRange
        dateFrom={filters.dateBegin}
        dateTo={filters.dateEnd}
        onDateFromChange={(date) => updateFilter("dateBegin", date)}
        onDateToChange={(date) => updateFilter("dateEnd", date)}
        dateFromLabel={t("startDate")}
        dateToLabel={t("endDate")}
        selectDateLabel={t("startDate")}
      />

      {/* Min Value */}
      <div className="space-y-2">
        <Label>{t("credit.minValue")}</Label>
        <Input
          type="number"
          placeholder="0"
          value={filters.minValue || ""}
          onChange={(e) =>
            updateFilter(
              "minValue",
              e.target.value ? parseFloat(e.target.value) : undefined,
            )
          }
        />
      </div>

      {/* Max Value */}
      <div className="space-y-2">
        <Label>{t("credit.maxValue")}</Label>
        <Input
          type="number"
          placeholder="0"
          value={filters.maxValue || ""}
          onChange={(e) =>
            updateFilter(
              "maxValue",
              e.target.value ? parseFloat(e.target.value) : undefined,
            )
          }
        />
      </div>

      {/* Badge Filter */}
      {availableBadges.length > 0 && (
        <div className="space-y-2">
          <Label>{t("credit.filterByBadges") || "Filter by Tags"}</Label>
          <div className="flex flex-wrap gap-2">
            {availableBadges.map((badge) => {
              const isSelected = filters.badges?.includes(badge.id);
              return (
                <Badge
                  key={badge.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => {
                    const current = filters.badges || [];
                    const updated = isSelected
                      ? current.filter((id) => id !== badge.id)
                      : [...current, badge.id];
                    updateFilter("badges", updated.length > 0 ? updated : undefined);
                  }}
                >
                  {badge.label}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </FilterContainer>
  );
};
