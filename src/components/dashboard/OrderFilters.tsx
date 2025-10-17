import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useLocale } from "@/contexts/LocaleContext";
import { UIOrderStatus } from "@/types/order";

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

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("filters.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyFilters();
            }}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          {t("filters.filters")}
        </Button>
        <Button onClick={handleApplyFilters}>{t("filters.search")}</Button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-muted/50 rounded-lg p-4 space-y-4 animate-slide-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Date From */}
            <div className="space-y-2">
              <Label>{t("filters.dateFrom")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : t("filters.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label>{t("filters.dateTo")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : t("filters.selectDate")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              {t("filters.clear")}
            </Button>
            <Button onClick={handleApplyFilters}>{t("filters.apply")}</Button>
          </div>
        </div>
      )}
    </div>
  );
};
