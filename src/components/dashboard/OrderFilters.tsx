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
import { useLocale } from "@/contexts/LocaleContext";
import { UIOrderStatus, Branch } from "@/types/order";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRange } from "@/components/shared/FilterDateRange";

interface OrderFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  branches: Branch[];
  isLoadingBranches?: boolean;
}

export interface FilterValues {
  search: string;
  status: UIOrderStatus | "all";
  branch: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export const OrderFilters = ({
  onFilterChange,
  branches,
  isLoadingBranches = false,
}: OrderFiltersProps) => {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UIOrderStatus | "all">("all");
  const [branch, setBranch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Set default branch to first branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !branch) {
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
  }, [branches]);

  const handleApplyFilters = () => {
    onFilterChange({
      search,
      status,
      branch,
      dateFrom,
      dateTo,
    });
  };

  const handleClearFilters = () => {
    const firstBranch = branches.length > 0 ? branches[0].code : "";
    setSearch("");
    setStatus("all");
    setBranch(firstBranch);
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange({
      search: "",
      status: "all",
      branch: firstBranch,
      dateFrom: undefined,
      dateTo: undefined,
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
    </FilterContainer>
  );
};
