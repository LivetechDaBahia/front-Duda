import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocale } from "@/contexts/LocaleContext";
import { UIOrderStatus, Branch } from "@/types/order";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRange } from "@/components/shared/FilterDateRange";

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

export const OrderFilters = ({
  onFilterChange,
  branches,
  isLoadingBranches = false,
  selectedBranch,
}: OrderFiltersProps) => {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UIOrderStatus | "all">("all");
  const [branch, setBranch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [showInBRL, setShowInBRL] = useState(false);

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

  const hasActiveFilters = Boolean(
    search || status !== "all" || branch || dateFrom || dateTo,
  );

  return (
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
  );
};
