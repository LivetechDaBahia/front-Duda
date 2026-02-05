import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/contexts/LocaleContext";

interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxWithCustomProps {
  options: ComboboxOption[];
  value: string | null;
  customValue: string;
  onValueChange: (value: string | null) => void;
  onCustomValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  customInputPlaceholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

const OTHER_VALUE = "__OTHER__";

export function ComboboxWithCustom({
  options,
  value,
  customValue,
  onValueChange,
  onCustomValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  customInputPlaceholder,
  disabled = false,
  isLoading = false,
}: ComboboxWithCustomProps) {
  const [open, setOpen] = React.useState(false);
  const { t } = useLocale();

  const isOtherSelected = value === OTHER_VALUE;

  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (selectedValue: string) => {
    if (selectedValue === OTHER_VALUE) {
      onValueChange(OTHER_VALUE);
    } else {
      onValueChange(selectedValue);
      onCustomValueChange("");
    }
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || isLoading}
          >
            {isLoading
              ? t("accessRequest.loading")
              : selectedOption
                ? selectedOption.label
                : isOtherSelected
                  ? t("accessRequest.other")
                  : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-popover z-50">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder || t("accessRequest.search")}
            />
            <CommandList>
              <CommandEmpty>
                {emptyMessage || t("accessRequest.noResults")}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
                <CommandItem
                  value="other"
                  onSelect={() => handleSelect(OTHER_VALUE)}
                  className="border-t"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      isOtherSelected ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {t("accessRequest.other")}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isOtherSelected && (
        <Input
          placeholder={customInputPlaceholder}
          value={customValue}
          onChange={(e) => onCustomValueChange(e.target.value)}
          disabled={disabled}
          className="mt-2"
        />
      )}
    </div>
  );
}
