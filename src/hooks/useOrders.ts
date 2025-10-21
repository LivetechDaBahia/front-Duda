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
}

interface UseOrdersReturn {
  orders: PurchaseOrder[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  approveOrder: (orderId: string) => void;
  declineOrder: (orderId: string, reason?: string) => void;
  isUpdating: boolean;
}

export const useOrders = (params?: UseOrdersParams): UseOrdersReturn => {
  const queryClient = useQueryClient();
  const { t } = useLocale();
  const { user } = useAuth();

  // Default date range: current month
  const defaultDateBegin = params?.dateBegin || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const defaultDateEnd = params?.dateEnd || new Date().toISOString().split('T')[0];

  const {
    data: orders = [],
    isLoading,
    error,
    refetch,
  } = useQuery<PurchaseOrder[], Error>({
    queryKey: ["orders", user?.email, defaultDateBegin, defaultDateEnd, params?.types, params?.tenantId],
    queryFn: async (): Promise<PurchaseOrder[]> => {
      if (!user?.email) {
        throw new Error("User email not available");
      }

      const apiData = await orderService.getOrders(
        user.email,
        defaultDateBegin,
        defaultDateEnd,
        params?.types || "01,02,03,04,05,06,07",
        params?.tenantId || "01"
      );
      
      return transformAPIToUIOrders(apiData);
    },
    enabled: !!user?.email,
  });

  const approveMutation = useMutation({
    mutationFn: (orderId: string) => {
      if (!user?.email) {
        throw new Error("User email not available");
      }

      return orderService.approveOrder({
        orderId,
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

      return orderService.rejectOrder({
        orderId,
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

  return {
    orders,
    isLoading,
    error,
    refetch,
    approveOrder: approveMutation.mutate,
    declineOrder: (orderId: string, reason: string = "Declined by user") => 
      declineMutation.mutate({ orderId, reason }),
    isUpdating:
      approveMutation.isPending ||
      declineMutation.isPending,
  };
};
