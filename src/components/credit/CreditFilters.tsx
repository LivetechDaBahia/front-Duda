import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/contexts/LocaleContext";
import type {
  CreditFilters as CreditFiltersType,
  CreditStatus,
} from "@/types/credit";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRange } from "@/components/shared/FilterDateRange";

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
      filters.maxValue !== undefined,
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
    </FilterContainer>
  );
};
