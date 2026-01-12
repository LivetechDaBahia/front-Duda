import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRangeSingle } from "@/components/shared/FilterDateRangeSingle";
import { format } from "date-fns";

const STORAGE_KEY = "workflowFilters";

export type WorkflowStatusFilter = "all" | "pending" | "in-progress" | "completed" | "failed";

export interface WorkflowFilterValues {
  search: string;
  status: WorkflowStatusFilter;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface StoredFilters {
  search: string;
  status: WorkflowStatusFilter;
  dateFrom: string | null;
  dateTo: string | null;
}

interface WorkflowFiltersProps {
  onFilterChange: (filters: WorkflowFilterValues) => void;
}

const loadFiltersFromStorage = (): Partial<StoredFilters> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveFiltersToStorage = (filters: StoredFilters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Ignore storage errors
  }
};

export const WorkflowFilters = ({ onFilterChange }: WorkflowFiltersProps) => {
  const { t } = useLocale();

  // Load initial values from localStorage
  const storedFilters = loadFiltersFromStorage();

  const [search, setSearch] = useState(storedFilters.search || "");
  const [status, setStatus] = useState<WorkflowStatusFilter>(
    storedFilters.status || "all"
  );
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    storedFilters.dateFrom ? new Date(storedFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    storedFilters.dateTo ? new Date(storedFilters.dateTo) : undefined
  );

  const hasActiveFilters = Boolean(
    search || status !== "all" || dateFrom || dateTo
  );

  const [showFilters, setShowFilters] = useState(hasActiveFilters);

  // Keep panel expanded when there are active filters
  useEffect(() => {
    if (hasActiveFilters) {
      setShowFilters(true);
    }
  }, [hasActiveFilters]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    saveFiltersToStorage({
      search,
      status,
      dateFrom: dateFrom ? dateFrom.toISOString() : null,
      dateTo: dateTo ? dateTo.toISOString() : null,
    });
  }, [search, status, dateFrom, dateTo]);

  // Apply stored filters on initial mount
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (!hasInitialized && hasActiveFilters) {
      setHasInitialized(true);
      onFilterChange({
        search,
        status,
        dateFrom,
        dateTo,
      });
    }
  }, [hasInitialized, hasActiveFilters]);

  const handleApplyFilters = () => {
    const effectiveDateTo = dateFrom && !dateTo ? new Date() : dateTo;
    onFilterChange({
      search,
      status,
      dateFrom,
      dateTo: effectiveDateTo,
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange({
      search: "",
      status: "all",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case "search":
        setSearch("");
        break;
      case "status":
        setStatus("all");
        break;
      case "dateRange":
        setDateFrom(undefined);
        setDateTo(undefined);
        break;
    }
  };

  const getStatusLabel = (s: WorkflowStatusFilter) => {
    switch (s) {
      case "pending":
        return t("workflow.status.pending");
      case "in-progress":
        return t("workflow.status.inProgress");
      case "completed":
        return t("workflow.status.completed");
      case "failed":
        return t("workflow.status.failed");
      default:
        return s;
    }
  };

  return (
    <div className="space-y-3">
      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("workflow.filters.search")}: {search}
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("workflow.filters.status")}: {getStatusLabel(status)}
              <button
                onClick={() => removeFilter("status")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {(dateFrom || dateTo) && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("workflow.filters.dateRange")}:{" "}
              {dateFrom && dateTo
                ? `${format(dateFrom, "dd/MM/yyyy")} - ${format(dateTo, "dd/MM/yyyy")}`
                : dateFrom
                  ? `${format(dateFrom, "dd/MM/yyyy")} - ...`
                  : `... - ${format(dateTo!, "dd/MM/yyyy")}`}
              <button
                onClick={() => removeFilter("dateRange")}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <FilterContainer
        searchValue={search}
        searchPlaceholder={t("workflow.filters.searchPlaceholder")}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        filterButtonLabel={t("workflow.filters.filters")}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        clearButtonLabel={t("workflow.filters.clear")}
        applyButtonLabel={t("workflow.filters.apply")}
        hasActiveFilters={hasActiveFilters}
        onSearchKeyDown={(e) => {
          if (e.key === "Enter") handleApplyFilters();
        }}
      >
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>{t("workflow.filters.status")}</Label>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as WorkflowStatusFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("workflow.filters.allStatuses")}</SelectItem>
              <SelectItem value="pending">{t("workflow.status.pending")}</SelectItem>
              <SelectItem value="in-progress">{t("workflow.status.inProgress")}</SelectItem>
              <SelectItem value="completed">{t("workflow.status.completed")}</SelectItem>
              <SelectItem value="failed">{t("workflow.status.failed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <FilterDateRangeSingle
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateRangeChange={(from, to) => {
            setDateFrom(from);
            setDateTo(to);
          }}
          label={t("workflow.filters.dateRange")}
          selectLabel={t("workflow.filters.selectDate")}
          numberOfMonths={2}
        />
      </FilterContainer>
    </div>
  );
};
