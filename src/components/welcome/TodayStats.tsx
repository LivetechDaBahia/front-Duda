import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  CreditCard,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface IndicatorData {
  pending: number;
  urgent: number;
  totalValue: number;
}

interface TodayStatsProps {
  purchaseOrders?: IndicatorData;
  credit?: IndicatorData;
  isLoadingOrders?: boolean;
  isLoadingCredit?: boolean;
  showOrders?: boolean;
  showCredit?: boolean;
}

export const TodayStats = ({
  purchaseOrders,
  credit,
  isLoadingOrders = false,
  isLoadingCredit = false,
  showOrders = false,
  showCredit = false,
}: TodayStatsProps) => {
  const { t } = useLocale();

  const renderStatCard = (
    icon: React.ReactNode,
    label: string,
    value: string | number,
    variant: "warning" | "destructive" | "primary",
    isLoading: boolean,
  ) => {
    const variantStyles = {
      warning: {
        card: "bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20",
        iconBg: "bg-warning/20",
        iconColor: "text-warning",
      },
      destructive: {
        card: "bg-gradient-to-br from-destructive/5 to-destructive/10 border-destructive/20",
        iconBg: "bg-destructive/20",
        iconColor: "text-destructive",
      },
      primary: {
        card: "bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20",
        iconBg: "bg-primary/20",
        iconColor: "text-primary",
      },
    };

    const styles = variantStyles[variant];

    if (isLoading) {
      return (
        <Card className={`p-5 ${styles.card}`}>
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className={`p-5 ${styles.card}`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-lg ${styles.iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </Card>
    );
  };

  const formatCurrency = (value: number) => {
    return `R$ ${(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-4">
      {/* Purchase Orders Row */}
      {showOrders && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("welcome.purchaseOrders")}
            </span>
          </div>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            }}
          >
            {renderStatCard(
              <AlertCircle className="w-6 h-6 text-warning" />,
              t("welcome.pendingOrders"),
              purchaseOrders?.pending ?? 0,
              "warning",
              isLoadingOrders,
            )}
            {renderStatCard(
              <Clock className="w-6 h-6 text-destructive" />,
              t("welcome.urgentOrders"),
              purchaseOrders?.urgent ?? 0,
              "destructive",
              isLoadingOrders,
            )}
            {renderStatCard(
              <TrendingUp className="w-6 h-6 text-primary" />,
              t("welcome.orderValue"),
              formatCurrency(purchaseOrders?.totalValue ?? 0),
              "primary",
              isLoadingOrders,
            )}
          </div>
        </div>
      )}

      {/* Credit Row */}
      {showCredit && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {t("welcome.creditRequests")}
            </span>
          </div>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
            }}
          >
            {renderStatCard(
              <AlertCircle className="w-6 h-6 text-warning" />,
              t("welcome.pendingCredits"),
              credit?.pending ?? 0,
              "warning",
              isLoadingCredit,
            )}
            {renderStatCard(
              <Clock className="w-6 h-6 text-destructive" />,
              t("welcome.urgentCredits"),
              credit?.urgent ?? 0,
              "destructive",
              isLoadingCredit,
            )}
            {renderStatCard(
              <TrendingUp className="w-6 h-6 text-primary" />,
              t("welcome.creditValue"),
              formatCurrency(credit?.totalValue ?? 0),
              "primary",
              isLoadingCredit,
            )}
          </div>
        </div>
      )}

      {/* Show message if no permissions */}
      {!showOrders && !showCredit && (
        <div className="text-center py-8 text-muted-foreground">
          {t("welcome.noStatsAvailable")}
        </div>
      )}
    </div>
  );
};
