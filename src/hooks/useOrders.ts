import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { PurchaseOrder } from "@/types/order";
import { toast } from "sonner";
import { useLocale } from "@/contexts/LocaleContext";
import { useAuth } from "@/contexts/AuthContext";
import { transformAPIToUIOrders } from "@/lib/orderTransformer";

interface UseOrdersParams {
  dateBegin?: string;
  dateEnd?: string;
  types?: string;
  tenantId?: string;
  enabled?: boolean; // Allow conditional fetching
}

interface UseOrdersReturn {
  orders: PurchaseOrder[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  approveOrder: (orderId: string) => void;
  declineOrder: (orderId: string, reason?: string) => void;
  revertOrder: (orderId: string) => void;
  isUpdating: boolean;
}

export const useOrders = (params?: UseOrdersParams): UseOrdersReturn => {
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const { user } = useAuth();

  // Default date range: current month
  const defaultDateBegin =
    params?.dateBegin ||
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0];
  const defaultDateEnd =
    params?.dateEnd || new Date().toISOString().split("T")[0];

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrder[], Error>({
    queryKey: [
      "orders",
      user?.email,
      defaultDateBegin,
      defaultDateEnd,
      params?.types,
      params?.tenantId,
    ],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      if (!user?.email) {
        throw new Error("User email not available");
      }

      const apiData = await orderService.getOrders(
        user.email,
        defaultDateBegin,
        defaultDateEnd,
        params?.types || "01,02,03,04,05,06,07",
        params?.tenantId || "01",
      );

      return transformAPIToUIOrders(apiData);
    },
    enabled: params?.enabled !== false && !!user?.email, // Respect enabled flag
  });

  // Helper: compute the branch id (tenant,branch) expected by backend
  const resolveBranchId = (order: PurchaseOrder): string => {
    const tenantParam = params?.tenantId;
    const tenant = tenantParam?.split(",")[0] || "01";

    // If tenant param already includes branch, prefer it
    if (tenantParam && tenantParam.includes(",")) {
      return tenantParam;
    }

    const orderBranch = order.branch || "";
    if (!orderBranch) return tenant; // fallback to tenant only

    // If order branch already contains tenant, return as is
    if (orderBranch.includes(",")) return orderBranch;

    // Combine tenant and branch
    return `${tenant},${orderBranch}`;
  };

  const approveMutation = useMutation({
    mutationFn: (orderId: string) => {
      if (!user?.email) {
        throw new Error("User email not available");
      }

      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      const branch = resolveBranchId(order);

      return orderService.approveOrder({
        orderId,
        branch,
        type: "PC",
        approvalUserCode: "",
        systemUserCode: "",
        email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("order.approveSuccess") || "Order approved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to approve order");
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) => {
      if (!user?.email) {
        throw new Error("User email not available");
      }

      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      const branch = resolveBranchId(order);

      return orderService.rejectOrder({
        orderId,
        branch,
        type: "PC",
        approvalUserCode: "",
        systemUserCode: "",
        email: user.email,
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(t("order.declineSuccess") || "Order declined successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to decline order");
    },
  });

  const revertMutation = useMutation({
    mutationFn: (orderId: string) => {
      if (!user?.email) {
        throw new Error("User email not available");
      }

      const order = orders.find((o) => o.id === orderId);
      if (!order) {
        throw new Error("Order not found");
      }

      const branch = resolveBranchId(order);

      return orderService.revertOrder({
        orderId,
        branch,
        type: "PC",
        approvalUserCode: "",
        systemUserCode: "",
        email: user.email,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(
        t("order.revertSuccess") || "Order reverted to pending successfully",
      );
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to revert order");
    },
  });

  return {
    orders,
    isLoading,
    error,
    refetch,
    approveOrder: approveMutation.mutate,
    declineOrder: (orderId: string, reason: string = "Declined by user") =>
      declineMutation.mutate({ orderId, reason }),
    revertOrder: revertMutation.mutate,
    isUpdating:
      approveMutation.isPending ||
      declineMutation.isPending ||
      revertMutation.isPending,
  };
};
