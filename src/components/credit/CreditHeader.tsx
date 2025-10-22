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
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">{t("credit.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("credit.subtitle")}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant={view === "kanban" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("kanban")}
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          {t("kanbanView")}
        </Button>
        <Button
          variant={view === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewChange("table")}
        >
          <TableIcon className="h-4 w-4 mr-2" />
          {t("tableView")}
        </Button>
      </div>
    </div>
  );
};
