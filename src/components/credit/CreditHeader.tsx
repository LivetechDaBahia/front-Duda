import { LayoutGrid, Table as TableIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/contexts/LocaleContext";

interface CreditHeaderProps {
  view: "kanban" | "table";
  onViewChange: (view: "kanban" | "table") => void;
}

export const CreditHeader = ({ view, onViewChange }: CreditHeaderProps) => {
  const { t } = useLocale();

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("credit.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {t("credit.subtitle")}
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-muted rounded-lg w-full sm:w-auto">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("kanban")}
              className="transition-all flex-1 sm:flex-initial"
            >
              <LayoutGrid className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {t("dashboard.viewKanban")}
              </span>
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("table")}
              className="transition-all flex-1 sm:flex-initial"
            >
              <TableIcon className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {t("dashboard.viewTable")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
