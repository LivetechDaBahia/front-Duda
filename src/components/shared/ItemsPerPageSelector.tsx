import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocale } from "@/contexts/LocaleContext";

interface ItemsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export const ItemsPerPageSelector = ({
  value,
  onChange,
  options = [5, 10, 20, 50, 100],
}: ItemsPerPageSelectorProps) => {
  const { t } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t("pagination.itemsPerPage")}
      </span>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(Number(val))}
      >
        <SelectTrigger className="w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
