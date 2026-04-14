import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { ProductAllocationCodeSearch } from "./ProductAllocationCodeSearch";
import { useLocale } from "@/contexts/LocaleContext";
import { useSalesUIStore } from "@/store/useSalesUIStore";
import type { SalesSearchType, Stage, SalesElementItem } from "@/types/sales";

interface SalesFiltersProps {
  stages: Stage[];
  items: SalesElementItem[];
}

export const SalesFilters = ({ stages, items }: SalesFiltersProps) => {
  const { t } = useLocale();
  const filters = useSalesUIStore((state) => state.filters);
  const activeSearchType = useSalesUIStore((state) => state.activeSearchType);
  const allocationCodeSearch = useSalesUIStore(
    (state) => state.allocationCodeSearch,
  );
  const showFilters = useSalesUIStore((state) => state.showFilters);
  const updateFilter = useSalesUIStore((state) => state.updateFilter);
  const clearFilters = useSalesUIStore((state) => state.clearFilters);
  const setShowFilters = useSalesUIStore((state) => state.setShowFilters);
  const submitAllocationCodeSearch = useSalesUIStore(
    (state) => state.submitAllocationCodeSearch,
  );
  const setActiveSearchType = useSalesUIStore(
    (state) => state.setActiveSearchType,
  );
  const setAllocationCodeSearch = useSalesUIStore(
    (state) => state.setAllocationCodeSearch,
  );
  const searchTypeOptions = useMemo(
    () => [
      {
        value: "offerClient" as const,
        label: t("sales.searchType.offerClient"),
        placeholder: t("sales.searchPlaceholder"),
        hasFilters: true,
      },
      {
        value: "allocationCode" as const,
        label: t("sales.searchType.allocationCode"),
        placeholder: t("sales.searchType.allocationCodePlaceholder"),
        hasFilters: false,
      },
    ],
    [t],
  );

  const activeSearchOption =
    searchTypeOptions.find((option) => option.value === activeSearchType) ??
    searchTypeOptions[0];

  const availableTypes = useMemo(() => {
    const types = new Set(items.map((i) => i.type).filter(Boolean));
    return Array.from(types).sort();
  }, [items]);

  const availableSellers = useMemo(() => {
    const sellers = new Set(items.map((i) => i.sellerName).filter(Boolean));
    return Array.from(sellers).sort();
  }, [items]);

  const availableSellerGroups = useMemo(() => {
    const groups = new Set(items.map((i) => i.sellerGroup).filter(Boolean));
    return Array.from(groups).sort();
  }, [items]);

  const availableSalesGroups = useMemo(() => {
    const groups = new Set(items.map((i) => i.groupName).filter(Boolean));
    return Array.from(groups).sort();
  }, [items]);

  const hasActiveFilters = Boolean(
    activeSearchOption.hasFilters &&
      (filters.search ||
        filters.status !== "all" ||
        filters.type ||
        filters.seller ||
        filters.name ||
        filters.sellerGroup ||
        filters.salesGroup),
  );

  return (
    <FilterContainer
      searchValue={
        activeSearchType === "allocationCode"
          ? allocationCodeSearch
          : filters.search
      }
      searchPlaceholder={activeSearchOption.placeholder}
      onSearchChange={(value) => {
        if (activeSearchType === "allocationCode") {
          setAllocationCodeSearch(value);
          return;
        }

        updateFilter("search", value);
      }}
      showFilters={activeSearchOption.hasFilters ? showFilters : false}
      onShowFiltersChange={setShowFilters}
      filterButtonLabel={
        showFilters ? t("common.hideFilters") : t("filters.filters")
      }
      onClearFilters={clearFilters}
      clearButtonLabel={t("clearFilters")}
      hasActiveFilters={hasActiveFilters}
      searchHeader={
        <ProductAllocationCodeSearch
          value={
            activeSearchType === "allocationCode"
              ? allocationCodeSearch
              : filters.search
          }
          placeholder={activeSearchOption.placeholder}
          onChange={(value) => {
            if (activeSearchType === "allocationCode") {
              setAllocationCodeSearch(value);
              return;
            }

            updateFilter("search", value);
          }}
          onSubmit={
            activeSearchType === "allocationCode"
              ? submitAllocationCodeSearch
              : undefined
          }
          activePill={activeSearchType}
          pills={searchTypeOptions}
          onActivePillChange={(value) =>
            setActiveSearchType(value as SalesSearchType)
          }
          showFilters={showFilters}
          onShowFiltersChange={setShowFilters}
          showFilterButton={activeSearchOption.hasFilters}
          filterButtonLabel={
            showFilters ? t("common.hideFilters") : t("filters.filters")
          }
        />
      }
    >
      {activeSearchOption.hasFilters && (
        <div className="space-y-2">
          <Label>{t("status")}</Label>
          <Select
            value={filters.status}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sales.allStages")}</SelectItem>
              {stages.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeSearchOption.hasFilters && availableTypes.length > 0 && (
        <div className="space-y-2">
          <Label>{t("sales.type")}</Label>
          <Select
            value={filters.type || "all"}
            onValueChange={(v) => updateFilter("type", v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sales.allTypes")}</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeSearchOption.hasFilters && availableSellers.length > 0 && (
        <div className="space-y-2">
          <Label>{t("sales.seller")}</Label>
          <Select
            value={filters.seller || "all"}
            onValueChange={(v) => updateFilter("seller", v === "all" ? "" : v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sales.allSellers")}</SelectItem>
              {availableSellers.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeSearchOption.hasFilters && availableSellerGroups.length > 0 && (
        <div className="space-y-2">
          <Label>{t("sales.sellerGroup")}</Label>
          <Select
            value={filters.sellerGroup || "all"}
            onValueChange={(v) =>
              updateFilter("sellerGroup", v === "all" ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sales.allSellerGroups")}</SelectItem>
              {availableSellerGroups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {activeSearchOption.hasFilters && availableSalesGroups.length > 0 && (
        <div className="space-y-2">
          <Label>{t("sales.groupName")}</Label>
          <Select
            value={filters.salesGroup || "all"}
            onValueChange={(v) =>
              updateFilter("salesGroup", v === "all" ? "" : v)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("sales.allSalesGroups")}</SelectItem>
              {availableSalesGroups.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </FilterContainer>
  );
};
