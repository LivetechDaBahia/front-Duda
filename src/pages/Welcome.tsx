import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Package, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserProfile } from "@/components/welcome/UserProfile";
import { TodayStats } from "@/components/welcome/TodayStats";
import { PendingItemCard } from "@/components/welcome/PendingItemCard";
import { NotificationsSection } from "@/components/welcome/NotificationsSection";
import { OrderDetailPanel } from "@/components/dashboard/OrderDetailPanel";
import { PendingItem } from "@/types/order";
import { useLocale } from "@/contexts/LocaleContext";
import { usePendingItems } from "@/hooks/usePendingItems";
import { useBranches } from "@/hooks/useBranches";

const Welcome = () => {
  const { t } = useLocale();
  const [selectedItem, setSelectedItem] = useState<PendingItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [showInBRL, setShowInBRL] = useState(false);

  const { branches, isLoading: isLoadingBranches } = useBranches();

  // Set default branch when branches are loaded
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0].code);
    }
  }, [branches, selectedBranch]);

  // Format tenantId for API (always "01" + selected branch)
  const tenantId = selectedBranch ? `01,${selectedBranch}` : undefined;

  const {
    pendingItems,
    urgentItems,
    totalValue,
    isLoading,
    error,
    canManagePurchaseOrders,
    canManageCredit,
    approveOrder,
    declineOrder,
  } = usePendingItems({ tenantId });

  const handleApprove = (itemId: string) => {
    if (approveOrder) {
      approveOrder(itemId);
    }
  };

  const handleDecline = (itemId: string) => {
    if (declineOrder) {
      declineOrder(itemId);
    }
  };

  const handleViewDetails = (item: PendingItem) => {
    setSelectedItem(item);
    setIsPanelOpen(true);
  };

  // Determine which page to link to based on permissions
  const getPrimaryLink = () => {
    if (canManagePurchaseOrders && canManageCredit) {
      // If user has both, show purchase orders by default
      return {
        path: "/purchase-orders",
        label: t("welcome.viewAll"),
        icon: Package,
      };
    } else if (canManagePurchaseOrders) {
      return {
        path: "/purchase-orders",
        label: t("welcome.viewAllOrders"),
        icon: Package,
      };
    } else if (canManageCredit) {
      return {
        path: "/credit",
        label: t("welcome.viewAllCredits"),
        icon: CreditCard,
      };
    }
    return null;
  };

  const primaryLink = getPrimaryLink();

  if (isLoading || isLoadingBranches) {
    return (
      <div className="min-h-full bg-background">
        <main className="container mx-auto">
          <div className="mb-8 animate-fade-in">
            <UserProfile />
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-background">
        <main className="container mx-auto">
          <div className="mb-8 animate-fade-in">
            <UserProfile />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-2">
                Error loading pending items
              </p>
              <p className="text-sm text-muted-foreground">
                {error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Don't show the section if user has no permissions
  const hasAnyPermissions = canManagePurchaseOrders || canManageCredit;

  return (
    <div className="min-h-full bg-background">
      <main className="container mx-auto">
        {/* User Profile */}
        <div className="mb-8 animate-fade-in">
          <UserProfile />
        </div>

        {/* Today's Stats */}
        <div
          className="mb-8 animate-fade-in"
          style={{ animationDelay: "100ms" }}
        >
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {t("welcome.todayOverview")}
          </h2>
          <TodayStats
            pendingCount={pendingItems.length}
            urgentCount={urgentItems.length}
            totalValue={totalValue}
          />
        </div>

        {/* Notifications */}
        <div className="mb-8">
          <NotificationsSection />
        </div>

        {/* Pending Approvals - Only show if user has permissions */}
        {hasAnyPermissions && (
          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                {t("welcome.pendingApprovals")}
              </h2>
              {primaryLink && (
                <Button variant="outline" asChild>
                  <Link
                    to={primaryLink.path}
                    className="flex items-center gap-2"
                  >
                    <primaryLink.icon className="w-4 h-4" />
                    {primaryLink.label}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Branch Selector and Currency Toggle */}
            {canManagePurchaseOrders && branches.length > 0 && (
              <div className="mb-4 flex items-end gap-4">
                <div className="flex-1 max-w-xs">
                  <Label className="mb-2 block">{t("order.branch")}</Label>
                  <Select
                    value={selectedBranch}
                    onValueChange={setSelectedBranch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("order.filterByBranch")} />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.code}>
                          {b.name} ({b.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-brl"
                    checked={showInBRL}
                    onCheckedChange={setShowInBRL}
                  />
                  <Label htmlFor="show-brl" className="cursor-pointer">
                    Show in BRL
                  </Label>
                </div>
              </div>
            )}

            {/* Show secondary link if user has both permissions */}
            {canManagePurchaseOrders && canManageCredit && (
              <div className="mb-4 flex gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    to="/purchase-orders"
                    className="flex items-center gap-2"
                  >
                    <Package className="w-3 h-3" />
                    {t("welcome.purchaseOrders")}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/credit" className="flex items-center gap-2">
                    <CreditCard className="w-3 h-3" />
                    {t("welcome.creditRequests")}
                  </Link>
                </Button>
              </div>
            )}

            {pendingItems.length > 0 ? (
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                }}
              >
                {pendingItems.map((item) => (
                  <PendingItemCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    onApprove={
                      item.type === "purchase_order" ? handleApprove : undefined
                    }
                    onDecline={
                      item.type === "purchase_order" ? handleDecline : undefined
                    }
                    onViewDetails={handleViewDetails}
                    showInBRL={showInBRL}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg border-2 border-dashed">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-lg">
                  {t("welcome.noPendingItems")}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("welcome.allCaughtUp")}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Only show order detail panel if it's a purchase order */}
      {selectedItem?.type === "purchase_order" && (
        <OrderDetailPanel
          order={selectedItem.originalData}
          open={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default Welcome;
