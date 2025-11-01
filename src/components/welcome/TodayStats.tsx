import { Card } from "@/components/ui/card";
import { AlertCircle, Clock, TrendingUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface TodayStatsProps {
  pendingCount: number;
  urgentCount: number;
  totalValue: number;
}

export const TodayStats = ({
  pendingCount,
  urgentCount,
  totalValue,
}: TodayStatsProps) => {
  const { t } = useLocale();

  return (
    <div
      className="grid gap-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
      }}
    >
      <Card className="p-5 bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-warning/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("welcome.needsApproval")}
            </p>
            <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-destructive/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("welcome.urgentItems")}
            </p>
            <p className="text-2xl font-bold text-foreground">{urgentCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-5 bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {t("welcome.totalValue")}
            </p>
            <p className="text-2xl font-bold text-foreground">
              ${(totalValue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
