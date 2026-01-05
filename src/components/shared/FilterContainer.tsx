import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterContainerProps {
  searchValue: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  filterButtonLabel: string;
  onApplyFilters?: () => void;
  onClearFilters: () => void;
  clearButtonLabel: string;
  applyButtonLabel?: string;
  hasActiveFilters?: boolean;
  children: ReactNode;
  onSearchKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const FilterContainer = ({
  searchValue,
  searchPlaceholder,
  onSearchChange,
  showFilters,
  onShowFiltersChange,
  filterButtonLabel,
  onApplyFilters,
  onClearFilters,
  clearButtonLabel,
  applyButtonLabel,
  hasActiveFilters = true,
  children,
  onSearchKeyDown,
}: FilterContainerProps) => {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={onSearchKeyDown}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => onShowFiltersChange(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          {filterButtonLabel}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showFilters && "rotate-180",
            )}
          />
        </Button>
        {onApplyFilters && (
          <Button onClick={onApplyFilters}>{applyButtonLabel}</Button>
        )}
      </div>

      {/* Collapsible Filters */}
      <Collapsible open={showFilters} onOpenChange={onShowFiltersChange}>
        <CollapsibleContent className="mt-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={onClearFilters}
                className="gap-2"
                disabled={!hasActiveFilters}
              >
                <X className="w-4 h-4" />
                {clearButtonLabel}
              </Button>
              {onApplyFilters && (
                <Button onClick={onApplyFilters}>{applyButtonLabel}</Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
