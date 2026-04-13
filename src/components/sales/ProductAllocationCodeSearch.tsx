import { useEffect, useState } from "react";
import { ChevronDown, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SalesSearchPills,
  type SalesSearchPillOption,
} from "./SalesSearchPills";

interface ProductAllocationCodeSearchProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  activePill: string;
  pills: SalesSearchPillOption[];
  onActivePillChange: (value: string) => void;
  showFilters?: boolean;
  onShowFiltersChange?: (show: boolean) => void;
  showFilterButton?: boolean;
  filterButtonLabel?: string;
}

export const ProductAllocationCodeSearch = ({
  value,
  placeholder,
  onChange,
  onSubmit,
  activePill,
  pills,
  onActivePillChange,
  showFilters = false,
  onShowFiltersChange,
  showFilterButton = true,
  filterButtonLabel,
}: ProductAllocationCodeSearchProps) => {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (draftValue !== value) {
        onChange(draftValue);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [draftValue, value, onChange]);

  const flushChange = (nextValue = draftValue) => {
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={placeholder}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onBlur={() => flushChange()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                flushChange();
                onSubmit?.(draftValue);
              }
            }}
            className="pl-10"
          />
        </div>

        {showFilterButton && onShowFiltersChange && filterButtonLabel && (
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
        )}
      </div>

      <SalesSearchPills
        options={pills}
        value={activePill}
        onValueChange={onActivePillChange}
      />
    </div>
  );
};
