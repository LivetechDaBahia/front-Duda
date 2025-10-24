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
import { UIOrderStatus } from "@/types/order";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { FilterDateRange } from "@/components/shared/FilterDateRange";

interface OrderFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  search: string;
  status: UIOrderStatus | "all";
  branch: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export const OrderFilters = ({ onFilterChange }: OrderFiltersProps) => {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<UIOrderStatus | "all">("all");
  const [branch, setBranch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);

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
    setSearch("");
    setStatus("all");
    setBranch("");
    setDateFrom(undefined);
    setDateTo(undefined);
    onFilterChange({
      search: "",
      status: "all",
      branch: "",
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
            <SelectItem value="processing">{t("status.processing")}</SelectItem>
            <SelectItem value="approved">{t("status.approved")}</SelectItem>
            <SelectItem value="completed">{t("status.completed")}</SelectItem>
            <SelectItem value="declined">{t("status.declined")}</SelectItem>
            <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Branch Filter */}
      <div className="space-y-2">
        <Label>{t("filters.branch")}</Label>
        <Input
          placeholder={t("filters.branchPlaceholder")}
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        />
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
