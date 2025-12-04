import { useMemo } from "react";
import { useOrders } from "@/hooks/useOrders";
import { usePermissions } from "@/hooks/usePermissions";
import { mapUIStatusToAPITypes } from "@/lib/statusMapper";
import { PendingItem } from "@/types/order";

interface UsePendingItemsParams {
  tenantId?: string;
}

export const usePendingItems = ({ tenantId }: UsePendingItemsParams = {}) => {
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
    tenantId: tenantId,
    enabled: canManagePurchaseOrders && !!tenantId, // Only fetch if user has permission and tenantId is provided
  });

  // Note: Credit items fetching is intentionally disabled on the Welcome page for now.

  // Transform and combine pending items
  const pendingItems = useMemo((): PendingItem[] => {
    const items: PendingItem[] = [];

    // Add purchase orders if user has permissions
    if (canManagePurchaseOrders) {
      const pendingOrders = orders.filter(
        (order) => order.needsApproval && order.status === "pending",
      );

      items.push(
        ...pendingOrders.map((order) => ({
          id: order.id,
          type: "purchase_order" as const,
          title: order.id,
          supplierOrClient: order.supplierName,
          amount: order.amount || 0,
          value: order.value || 0,
          coinSymbol: order.coinSymbol,
          createdAt: order.createdAt,
          description: order.description,
          status: order.status,
          branch: order.branch,
          needsApproval: order.needsApproval,
          originalData: order,
        })),
      );
    }

    // Intentionally skip credit items for now.

    // Sort by creation date (newest first)
    return items.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [canManagePurchaseOrders, orders]);

  // Calculate urgent items (pending + more than 3 days old)
  const urgentItems = useMemo(() => {
    return pendingItems.filter((item) => {
      const daysSinceCreation = Math.floor(
        (new Date().getTime() - new Date(item.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      return daysSinceCreation > 3;
    });
  }, [pendingItems]);

  // Calculate total value (sum all currencies for simplicity)
  const totalValue = useMemo(() => {
    return pendingItems.reduce((sum, item) => sum + item.amount, 0);
  }, [pendingItems]);

  const isLoading = canManagePurchaseOrders && ordersLoading;

  const error = ordersError;

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
