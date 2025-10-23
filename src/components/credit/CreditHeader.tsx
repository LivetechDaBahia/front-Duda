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
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t("credit.title")}
            </h1>
            <p className="text-muted-foreground mt-1">{t("credit.subtitle")}</p>
          </div>

          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("kanban")}
              className="transition-all"
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              {t("kanbanView")}
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewChange("table")}
              className="transition-all"
            >
              <TableIcon className="w-4 h-4 mr-2" />
              {t("tableView")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
