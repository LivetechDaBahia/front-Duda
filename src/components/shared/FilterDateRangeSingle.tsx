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
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

interface FilterDateRangeSingleProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateRangeChange: (from: Date | undefined, to: Date | undefined) => void;
  label: string;
  selectLabel: string;
  numberOfMonths?: number;
}

export const FilterDateRangeSingle = ({
  dateFrom,
  dateTo,
  onDateRangeChange,
  label,
  selectLabel,
  numberOfMonths = 2,
}: FilterDateRangeSingleProps) => {
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

  const formatDateRange = () => {
    if (dateFrom && dateTo) {
      return `${format(dateFrom, "MMM d, yyyy")} - ${format(dateTo, "MMM d, yyyy")}`;
    }
    if (dateFrom) {
      return `${format(dateFrom, "MMM d, yyyy")} - ...`;
    }
    return selectLabel;
  };

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
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleSelect}
            numberOfMonths={numberOfMonths}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
