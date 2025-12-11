import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { UIOrderStatus, Branch } from "@/types/order";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRange } from "@/components/shared/FilterDateRange";
import { format } from "date-fns";

const STORAGE_KEY = "orderFilters";

interface StoredFilters {
  search: string;
  status: UIOrderStatus | "all";
  branch: string;
  dateFrom: string | null;
  dateTo: string | null;
  showInBRL: boolean;
}

interface OrderFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  branches: Branch[];
  isLoadingBranches?: boolean;
  selectedBranch?: string;
}

export interface FilterValues {
  search: string;
  status: UIOrderStatus | "all";
  branch: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  showInBRL?: boolean;
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

export const OrderFilters = ({
  onFilterChange,
  branches,
  isLoadingBranches = false,
  selectedBranch,
}: OrderFiltersProps) => {
  const { t } = useLocale();
  
  // Load initial values from localStorage
  const storedFilters = loadFiltersFromStorage();
  
  const [search, setSearch] = useState(storedFilters.search || "");
  const [status, setStatus] = useState<UIOrderStatus | "all">(storedFilters.status || "all");
  const [branch, setBranch] = useState(storedFilters.branch || "");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    storedFilters.dateFrom ? new Date(storedFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    storedFilters.dateTo ? new Date(storedFilters.dateTo) : undefined
  );
  const [showInBRL, setShowInBRL] = useState(storedFilters.showInBRL || false);

  const hasActiveFilters = Boolean(
    search || status !== "all" || dateFrom || dateTo || showInBRL,
  );

  // Filters panel starts collapsed, but stays expanded if there are active filters
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
      branch,
      dateFrom: dateFrom ? dateFrom.toISOString() : null,
      dateTo: dateTo ? dateTo.toISOString() : null,
      showInBRL,
    });
  }, [search, status, branch, dateFrom, dateTo, showInBRL]);

  // Apply stored filters on initial mount (after branches load)
  const [hasInitialized, setHasInitialized] = useState(false);
  useEffect(() => {
    if (branches.length > 0 && !hasInitialized && hasActiveFilters) {
      setHasInitialized(true);
      const storedBranch = storedFilters.branch && branches.some(b => b.code === storedFilters.branch)
        ? storedFilters.branch
        : branches[0].code;
      onFilterChange({
        search,
        status,
        branch: storedBranch,
        dateFrom,
        dateTo,
        showInBRL,
      });
    }
  }, [branches, hasInitialized, hasActiveFilters]);

  // Keep local branch in sync with selectedBranch and choose sensible default
  useEffect(() => {
    if (branches.length === 0) return;

    // If parent provides a selectedBranch
    if (selectedBranch) {
      const exists = branches.some((b) => b.code === selectedBranch);
      if (exists) {
        // Sync local state to prop, but do not notify parent (source of truth)
        if (branch !== selectedBranch) {
          setBranch(selectedBranch);
        }
        return;
      }
      // If selectedBranch is invalid (not in list), fall back to first and notify parent
      const firstBranch = branches[0].code;
      setBranch(firstBranch);
      onFilterChange({
        search,
        status,
        branch: firstBranch,
        dateFrom,
        dateTo,
      });
      return;
    }

    // No selectedBranch from parent and local branch empty: default to first and notify parent
    if (!branch) {
      const firstBranch = branches[0].code;
      setBranch(firstBranch);
      onFilterChange({
        search,
        status,
        branch: firstBranch,
        dateFrom,
        dateTo,
      });
    }
  }, [branches, selectedBranch]);

  const handleApplyFilters = () => {
    // If dateFrom is set but dateTo is not, default dateTo to current date
    const effectiveDateTo = dateFrom && !dateTo ? new Date() : dateTo;

    onFilterChange({
      search,
      status,
      branch,
      dateFrom,
      dateTo: effectiveDateTo,
      showInBRL,
    });
  };

  const handleClearFilters = () => {
    const firstBranch = branches.length > 0 ? branches[0].code : "";
    setSearch("");
    setStatus("all");
    setBranch(firstBranch);
    setDateFrom(undefined);
    setDateTo(undefined);
    setShowInBRL(false);
    onFilterChange({
      search: "",
      status: "all",
      branch: firstBranch,
      dateFrom: undefined,
      dateTo: undefined,
      showInBRL: false,
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
      case "dateFrom":
        setDateFrom(undefined);
        break;
      case "dateTo":
        setDateTo(undefined);
        break;
      case "showInBRL":
        setShowInBRL(false);
        break;
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case "pending": return t("status.pending");
      case "approved": return t("status.approved");
      case "declined": return t("status.declined");
      default: return s;
    }
  };

  return (
    <div className="space-y-3">
      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("filters.searchPlaceholder")}: {search}
              <button onClick={() => removeFilter("search")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {status !== "all" && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("filters.status")}: {getStatusLabel(status)}
              <button onClick={() => removeFilter("status")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateFrom && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("filters.dateFrom")}: {format(dateFrom, "dd/MM/yyyy")}
              <button onClick={() => removeFilter("dateFrom")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateTo && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("filters.dateTo")}: {format(dateTo, "dd/MM/yyyy")}
              <button onClick={() => removeFilter("dateTo")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {showInBRL && (
            <Badge variant="secondary" className="gap-1 pr-1">
              {t("filters.showInBRL")}
              <button onClick={() => removeFilter("showInBRL")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      <FilterContainer
        searchValue={search}
        searchPlaceholder={t("filters.searchPlaceholder")}
        onSearchChange={setSearch}
        showFilters={showFilters}
        onShowFiltersChange={setShowFilters}
        filterButtonLabel={t("filters.filters")}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        clearButtonLabel={t("filters.clear")}
        applyButtonLabel={t("filters.apply")}
        hasActiveFilters={hasActiveFilters}
        onSearchKeyDown={(e) => {
          if (e.key === "Enter") handleApplyFilters();
        }}
      >
      {/* Status Filter */}
      <div className="space-y-2">
        <Label>{t("filters.status")}</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as UIOrderStatus | "all")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("status.pending")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="declined">{t("status.declined")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Branch Filter */}
      <div className="space-y-2">
        <Label>{t("order.branch")}</Label>
        <Select
          value={branch}
          onValueChange={(value) => {
            setBranch(value);
            onFilterChange({
              search,
              status,
              branch: value,
              dateFrom,
              dateTo,
            });
          }}
          disabled={isLoadingBranches}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("order.filterByBranch")} />
          </SelectTrigger>
          <SelectContent>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.code}>
                {b.name} ({b.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <FilterDateRange
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        dateFromLabel={t("filters.dateFrom")}
        dateToLabel={t("filters.dateTo")}
        selectDateLabel={t("filters.selectDate")}
      />

      {/* Currency Toggle */}
      <div className="flex items-center justify-between space-x-2 pt-2">
        <Label htmlFor="currency-toggle" className="flex-1">
          {t("filters.showInBRL")}
        </Label>
        <Switch
          id="currency-toggle"
          checked={showInBRL}
          onCheckedChange={setShowInBRL}
        />
      </div>
      </FilterContainer>
    </div>
  );
};
