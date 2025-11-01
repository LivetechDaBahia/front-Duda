import { useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useCredits } from "@/hooks/useCredits";
import { usePermissions } from "@/hooks/usePermissions";
import { mapUIStatusToAPITypes } from "@/lib/statusMapper";
import { PendingItem } from "@/types/order";

export const usePendingItems = () => {
  const { canManagePurchaseOrders, canManageCredit } = usePermissions();

  // Fetch purchase orders only if user has permissions
  const {
    orders,
    isLoading: ordersLoading,
    error: ordersError,
    approveOrder,
    declineOrder,
  } = useOrders({
    types: mapUIStatusToAPITypes("pending"),
    tenantId: "01,01,02,05,06,08,09,13",
    enabled: canManagePurchaseOrders, // Only fetch if user has permission
  });

  // Fetch credits only if user has permissions
  const {
    credits,
    isLoading: creditsLoading,
    error: creditsError,
  } = useCredits({
    enabled: canManageCredit, // Only fetch if user has permission
  });

  // Transform and combine pending items
  const pendingItems = useMemo((): PendingItem[] => {
    const items: PendingItem[] = [];

    // Add purchase orders if user has permissions
    if (canManagePurchaseOrders) {
      const pendingOrders = orders.filter(
        (order) => order.needsApproval && order.status === "pending"
      );

      items.push(
        ...pendingOrders.map((order) => ({
          id: order.id,
          type: "purchase_order" as const,
          title: order.id,
          supplierOrClient: order.supplierName,
          value: order.value || 0,
          coinSymbol: order.coinSymbol,
          createdAt: order.createdAt,
          description: order.description,
          status: order.status,
          branch: order.branch,
          needsApproval: order.needsApproval,
          originalData: order,
        }))
      );
    }

    // Add credit items if user has permissions
    if (canManageCredit) {
      // Filter credits that need approval (adjust status check based on your credit workflow)
      const pendingCredits = credits.filter(
        (credit) => credit.statusId === "pending" || credit.statusId === "01"
      );

      items.push(
        ...pendingCredits.map((credit) => ({
          id: credit.id.toString(),
          type: "credit" as const,
          title: credit.name,
          supplierOrClient: credit.details.client,
          value: credit.details.value,
          coinSymbol: credit.details.currency,
          createdAt: credit.details.date.toISOString(),
          description: credit.details.offer,
          status: credit.statusId,
          branch: credit.details.clientBranch,
          needsApproval: true,
          originalData: credit,
        }))
      );
    }

    // Sort by creation date (newest first)
    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [canManagePurchaseOrders, canManageCredit, orders, credits]);

  // Calculate urgent items (pending + more than 3 days old)
  const urgentItems = useMemo(() => {
    return pendingItems.filter((item) => {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(item.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceCreation > 3;
    });
  }, [pendingItems]);

  // Calculate total value (sum all currencies for simplicity)
  const totalValue = useMemo(() => {
    return pendingItems.reduce((sum, item) => sum + item.value, 0);
  }, [pendingItems]);

  const isLoading =
    (canManagePurchaseOrders && ordersLoading) ||
    (canManageCredit && creditsLoading);

  const error = ordersError || creditsError;

  return {
    pendingItems,
    urgentItems,
    totalValue,
    isLoading,
    error,
    canManagePurchaseOrders,
    canManageCredit,
    approveOrder: canManagePurchaseOrders ? approveOrder : undefined,
    declineOrder: canManagePurchaseOrders ? declineOrder : undefined,
  };
};
