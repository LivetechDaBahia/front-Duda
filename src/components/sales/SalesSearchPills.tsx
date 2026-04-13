import { cn } from "@/lib/utils";

export interface SalesSearchPillOption {
  value: string;
  label: string;
}

interface SalesSearchPillsProps {
  options: SalesSearchPillOption[];
  value: string;
  onValueChange: (value: string) => void;
}

export const SalesSearchPills = ({
  options,
  value,
  onValueChange,
}: SalesSearchPillsProps) => {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={cn(
              "rounded-full border px-6 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-border bg-muted text-foreground shadow-sm"
                : "border-border/70 bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
