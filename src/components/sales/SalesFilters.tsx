import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterContainer } from "@/components/shared/FilterContainer";
import type { SalesFilters as SalesFiltersType, SalesStatus, SalesItem } from "@/types/sales";

interface SalesFiltersProps {
  filters: SalesFiltersType;
  statuses: SalesStatus[];
  items: SalesItem[];
  onFiltersChange: (filters: SalesFiltersType) => void;
}

export const SalesFilters = ({
  filters,
  statuses,
  items,
  onFiltersChange,
}: SalesFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);

  const availableTypes = useMemo(() => {
    const types = new Set(items.map((i) => i.type).filter(Boolean));
    return Array.from(types).sort();
  }, [items]);

  const availableSellers = useMemo(() => {
    const sellers = new Set(items.map((i) => i.sellerName).filter(Boolean));
    return Array.from(sellers).sort();
  }, [items]);

  const updateFilter = (key: keyof SalesFiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: "", status: "all", type: "", seller: "" });
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.status !== "all" || filters.type || filters.seller,
  );

  return (
    <FilterContainer
      searchValue={filters.search}
      searchPlaceholder="Search sales by offer, client..."
      onSearchChange={(value) => updateFilter("search", value)}
      showFilters={showFilters}
      onShowFiltersChange={setShowFilters}
      filterButtonLabel={showFilters ? "Hide filters" : "Filters"}
      onClearFilters={clearFilters}
      clearButtonLabel="Clear filters"
      hasActiveFilters={hasActiveFilters}
    >
      <div className="space-y-2">
        <Label>Status</Label>
        <Select value={filters.status} onValueChange={(v) => updateFilter("status", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.description}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {availableTypes.length > 0 && (
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={filters.type || "all"} onValueChange={(v) => updateFilter("type", v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {availableTypes.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {availableSellers.length > 0 && (
        <div className="space-y-2">
          <Label>Seller</Label>
          <Select value={filters.seller || "all"} onValueChange={(v) => updateFilter("seller", v === "all" ? "" : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sellers</SelectItem>
              {availableSellers.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </FilterContainer>
  );
};
