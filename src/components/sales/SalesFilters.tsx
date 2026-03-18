import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FilterContainer } from "@/components/shared/FilterContainer";
import { useLocale } from "@/contexts/LocaleContext";
import type {
  SalesFilters as SalesFiltersType,
  Stage,
  SalesElementItem,
} from "@/types/sales";

interface SalesFiltersProps {
  filters: SalesFiltersType;
  stages: Stage[];
  items: SalesElementItem[];
  onFiltersChange: (filters: SalesFiltersType) => void;
}

export const SalesFilters = ({
  filters,
  stages,
  items,
  onFiltersChange,
}: SalesFiltersProps) => {
  const { t } = useLocale();
  const [showFilters, setShowFilters] = useState(false);

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
    const groupMap = new Map<string, string>();
    items.forEach((i) => {
      if (i.group && !groupMap.has(i.group)) {
        groupMap.set(i.group, i.name || i.group);
      }
    });
    return Array.from(groupMap.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const updateFilter = (key: keyof SalesFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      type: "",
      seller: "",
      name: "",
      sellerGroup: "",
      salesGroup: "",
    });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status !== "all" ||
      filters.type ||
      filters.seller ||
      filters.name ||
      filters.sellerGroup,
  );

  return (
    <FilterContainer
      searchValue={filters.search}
      searchPlaceholder={t("sales.searchPlaceholder")}
      onSearchChange={(value) => updateFilter("search", value)}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filterButtonLabel={
        showFilters ? t("common.hideFilters") : t("filters.filters")
      }
      onClearFilters={clearFilters}
      clearButtonLabel={t("clearFilters")}
      hasActiveFilters={hasActiveFilters}
    >
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

      {availableTypes.length > 0 && (
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

      {availableSellers.length > 0 && (
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

      {availableSellerGroups.length > 0 && (
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

      {availableSalesGroups.length > 0 && (
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
              {availableSalesGroups.map(({ code, name }) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t("sales.name")}</Label>
        <Input
          placeholder={t("sales.namePlaceholder")}
          value={filters.name}
          onChange={(e) => updateFilter("name", e.target.value)}
        />
      </div>
    </FilterContainer>
  );
};
