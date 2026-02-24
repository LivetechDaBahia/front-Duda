import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { format } from "date-fns";

interface SalesCardProps {
  item: SalesElementItem;
  stages: Stage[];
  onClick: () => void;
}

const formatCurrency = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const toCssColor = (input?: string) => {
  if (!input) return undefined;
  const value = input.trim();
  if (/^(hsl|hsla|rgb|rgba)\(/i.test(value) || value.startsWith("#") || value.startsWith("var(")) return value;
  if (/^\d+(?:\.\d+)?\s*,\s*\d+%\s*,\s*\d+%(?:\s*\/\s*\d+%?)?$/i.test(value)) return `hsl(${value})`;
  if (/^\d+(?:\.\d+)?\s+\d+%\s+\d+%(?:\s*\/\s*\d+%?)?$/i.test(value)) return `hsl(${value.replace(/\s+/g, " ")})`;
  return value;
};

export const SalesCard = ({ item, stages, onClick }: SalesCardProps) => {
  const { t } = useLocale();
  const stage = stages.find((s) => s.id === item.stageId);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all border-l-4 border-r-4 w-full width: 367.5px"
      style={{
        borderLeftColor: toCssColor(item.borders.left),
        borderRightColor: toCssColor(item.borders.right),
        ...(item.background && {
          backgroundColor: toCssColor(item.background),
          backgroundImage: `linear-gradient(135deg, ${toCssColor(item.background)} 0%, hsl(var(--card)) 100%)`,
        }),
      }}
      onClick={onClick}
    >
      <CardHeader className="p-2 sm:p-3 pb-1 sm:pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-muted-foreground text-xs">{t("sales.offer")}</span>
            <h3 className="font-semibold text-xs sm:text-sm truncate">{item.offer}</h3>
            <span className="text-muted-foreground text-xs">{t("sales.client")}</span>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {item.client}/{item.clientBranch}
            </p>
            {item.user && (
              <div className="mt-2">
                <Badge variant="outline" className="gap-1 text-xs">
                  {item.user}
                </Badge>
              </div>
            )}
          </div>
          {stage && (
            <Badge variant={stage.final ? "success" : "secondary"} className="text-xs shrink-0">
              {stage.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0 space-y-1">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-muted-foreground">{t("sales.value")}</span>
          <span className="font-medium">{formatCurrency(item.value, item.currency)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("sales.seller")}</span>
          <span className="truncate ml-2">{item.sellerName}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("sales.type")}</span>
          <span className="truncate ml-2">{item.type}</span>
        </div>
        {item.date && (
          <div className="text-xs text-muted-foreground truncate">
            {format(
              (() => {
                const str = String(item.date);
                const normalized = str.endsWith("Z") ? str.slice(0, -1) : str;
                return new Date(normalized);
              })(),
              "PPp",
            )}{" "}
            • {item.oper}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
