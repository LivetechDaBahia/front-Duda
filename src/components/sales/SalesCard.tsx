import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SalesElementItem, Stage } from "@/types/sales";
import { useLocale } from "@/contexts/LocaleContext";
import { formatDate } from "@/lib/utils";

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

export const SalesCard = ({ item, stages, onClick }: SalesCardProps) => {
  const { t, locale } = useLocale();
  const stage = stages.find((s) => s.id === item.stageId);

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all w-full max-w-[367px]"
      style={{
        backgroundColor: item.background ? `hsl(${item.background})` : undefined,
        borderLeftColor: item.borders?.left ? `hsl(${item.borders.left})` : undefined,
        borderRightColor: item.borders?.right ? `hsl(${item.borders.right})` : undefined,
        borderLeftWidth: item.borders?.left ? 4 : undefined,
        borderRightWidth: item.borders?.right ? 4 : undefined,
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
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {stage && (
              <Badge variant={stage.final ? "success" : "secondary"} className="text-xs">
                {stage.name}
              </Badge>
            )}
            {item.vip === "Sim" && (
              <Badge variant="default" className="text-xs">VIP</Badge>
            )}
          </div>
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
        {item.sellerGroup && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("sales.sellerGroup")}</span>
            <span className="truncate ml-2">{item.sellerGroup}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t("sales.type")}</span>
          <span className="truncate ml-2">{item.type}</span>
        </div>
        {item.paymentCondition && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t("sales.paymentCondition")}</span>
            <span className="truncate ml-2">{item.paymentCondition}</span>
          </div>
        )}
        {item.date && (
          <div className="text-xs text-muted-foreground truncate">
            {formatDate(item.date, locale)} • {item.oper}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
