import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
import { usePermissions } from "@/hooks/usePermissions";

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

  // Permissions for assignee filter visibility
  const { hasMinimumLevel } = usePermissions();
  const isManagerOrAdmin = hasMinimumLevel("Manager");

  // Calculate min/max values from all credits for slider bounds
  const valueRange = useMemo(() => {
    if (credits.length === 0) return { min: 0, max: 100000 };

    const values = credits.map((c) => c.details.value);
    const min = Math.floor(Math.min(...values));
    const max = Math.ceil(Math.max(...values));

    return { min, max };
  }, [credits]);

  // Extract unique types from details
  const availableTypes = useMemo(() => {
    const types = new Set(credits.map((c) => c.details.type).filter(Boolean));
    return Array.from(types).sort();
  }, [credits]);

  // Extract unique financial statuses from details
  const availableFinancials = useMemo(() => {
    const financials = new Set(
      credits.map((c) => c.details.financial).filter(Boolean),
    );
    return Array.from(financials).sort();
  }, [credits]);

  // Extract unique operations from details
  const availableOperations = useMemo(() => {
    const operations = new Set(
      credits.map((c) => c.details.operation).filter(Boolean),
    );
    return Array.from(operations).sort();
  }, [credits]);

  // Extract unique assignees from credits (emails)
  const availableAssignees = useMemo(() => {
    const users = new Set(
      credits.map((c) => (c.user ? c.user.trim() : "")).filter((u) => !!u),
    );
    return Array.from(users).sort((a, b) => a.localeCompare(b));
  }, [credits]);

  // Initialize slider value range
  const sliderValue = filters.valueRange || [valueRange.min, valueRange.max];

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
      valueRange: undefined,
      badges: undefined,
      financial: undefined,
      operation: undefined,
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
      filters.valueRange !== undefined ||
      (filters.badges && filters.badges.length > 0) ||
      filters.financial ||
      filters.operation,
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
            <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.description}
                {status.destructive && " ⚠️"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignee Filter */}
      <div className="space-y-2">
        <Label>{t("credit.assign.currentAssignee") || "Assignee"}</Label>
        <Select
          value={filters.user || "all"}
          onValueChange={(value) => updateFilter("user", value === "all" ? "" : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("credit.assign.currentAssignee")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{"All"}</SelectItem>
            <SelectItem value="me">{t("credit.assign.self")}</SelectItem>
            <SelectItem value="unassigned">{t("credit.assign.unassigned")}</SelectItem>
            {isManagerOrAdmin &&
              availableAssignees.map((email) => (
                <SelectItem key={email} value={email}>
                  {email}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type Filter */}
      {availableTypes.length > 0 && (
        <div className="space-y-2">
          <Label>{t("credit.filterByType")}</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(value) =>
              updateFilter("type", value === "all" ? "" : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("credit.selectType")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("credit.allTypes")}</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Financial Filter */}
      {availableFinancials.length > 0 && (
        <div className="space-y-2">
          <Label>{t("credit.filterByFinancial")}</Label>
          <Select
            value={filters.financial || "all"}
            onValueChange={(value) =>
              updateFilter("financial", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("credit.selectFinancial")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("credit.allFinancials")}</SelectItem>
              {availableFinancials.map((financial) => (
                <SelectItem key={financial} value={financial}>
                  {financial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Operation Filter */}
      {availableOperations.length > 0 && (
        <div className="space-y-2">
          <Label>{t("credit.filterByOperation")}</Label>
          <Select
            value={filters.operation || "all"}
            onValueChange={(value) =>
              updateFilter("operation", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("credit.selectOperation")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("credit.allOperations")}</SelectItem>
              {availableOperations.map((operation) => (
                <SelectItem key={operation} value={operation}>
                  {operation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <FilterDateRange
        dateFrom={filters.dateBegin}
        dateTo={filters.dateEnd}
        onDateFromChange={(date) => updateFilter("dateBegin", date)}
        onDateToChange={(date) => updateFilter("dateEnd", date)}
        dateFromLabel={t("startDate")}
        dateToLabel={t("endDate")}
        selectDateLabel={t("startDate")}
      />

      {/* Value Range Slider */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{t("credit.valueRange")}</Label>
          <div className="pt-2">
            <Slider
              value={sliderValue}
              onValueChange={(value) => {
                // Only update if the value changed from default range
                const isDefaultRange =
                  value[0] === valueRange.min && value[1] === valueRange.max;

                updateFilter(
                  "valueRange",
                  isDefaultRange ? undefined : (value as [number, number]),
                );
              }}
              min={valueRange.min}
              max={valueRange.max}
              step={Math.max(
                1,
                Math.floor((valueRange.max - valueRange.min) / 1000),
              )}
              className="w-full"
            />
          </div>
          {/* Display current range values */}
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(sliderValue[0])}
            </span>
            <span>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(sliderValue[1])}
            </span>
          </div>
        </div>
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
                    updateFilter(
                      "badges",
                      updated.length > 0 ? updated : undefined,
                    );
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
