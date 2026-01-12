import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { useLocale } from "@/contexts/LocaleContext";

interface FilterDateRangeSingleProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  label: string;
  selectLabel: string;
  numberOfMonths?: number;
  showPresets?: boolean;
}

interface DatePreset {
  labelKey: string;
  getValue: () => { from: Date; to: Date };
}

const getPresets = (): DatePreset[] => [
  {
    labelKey: "filters.presets.today",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    labelKey: "filters.presets.last7Days",
    getValue: () => ({
      from: subDays(new Date(), 6),
      to: new Date(),
    }),
  },
  {
    labelKey: "filters.presets.last30Days",
    getValue: () => ({
      from: subDays(new Date(), 29),
      to: new Date(),
    }),
  },
  {
    labelKey: "filters.presets.thisMonth",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    labelKey: "filters.presets.lastMonth",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    labelKey: "filters.presets.last90Days",
    getValue: () => ({
      from: subDays(new Date(), 89),
      to: new Date(),
    }),
  },
];

export const FilterDateRangeSingle = ({
  dateFrom,
  dateTo,
  onDateRangeChange,
  label,
  selectLabel,
  numberOfMonths = 2,
  showPresets = true,
}: FilterDateRangeSingleProps) => {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  const range: DateRange = {
    from: dateFrom,
    to: dateTo,
  };

  const handleSelect = (newRange: DateRange | undefined) => {
    const from = newRange?.from;
    const to = newRange?.to;

    // Call the callback with the new range
    onDateRangeChange(from, to);

    // Auto-close when both dates are selected
    if (from && to) {
      setOpen(false);
    }
  };

  const handlePresetClick = (preset: DatePreset) => {
    const { from, to } = preset.getValue();
    onDateRangeChange(from, to);
    setOpen(false);
  };

  const handleClear = () => {
    onDateRangeChange(undefined, undefined);
    setOpen(false);
  };

  const formatDateRange = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, "MMM d, yyyy")} - ${format(dateTo, "MMM d, yyyy")}`;
    }
    if (dateFrom) {
      return `${format(dateFrom, "MMM d, yyyy")} - ...`;
    }
    return selectLabel;
  };

  const presets = getPresets();

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateFrom && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Presets sidebar */}
            {showPresets && (
              <div className="border-r p-3 flex flex-col gap-1 min-w-[140px]">
                <span className="text-xs font-medium text-muted-foreground mb-2">
                  {t("filters.presets.title")}
                </span>
                {presets.map((preset) => (
                  <Button
                    key={preset.labelKey}
                    variant="ghost"
                    size="sm"
                    className="justify-start h-8 px-2 text-sm"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {t(preset.labelKey)}
                  </Button>
                ))}
                {(dateFrom || dateTo) && (
                  <>
                    <div className="border-t my-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="justify-start h-8 px-2 text-sm text-muted-foreground"
                      onClick={handleClear}
                    >
                      {t("filters.presets.clear")}
                    </Button>
                  </>
                )}
              </div>
            )}
            {/* Calendar */}
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleSelect}
              numberOfMonths={numberOfMonths}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
